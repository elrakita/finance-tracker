using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DTOs;

namespace FinanceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly FinanceContext context;

        public AccountsController(FinanceContext context)
        {
            this.context = context;
        }

        // GET: api/accounts
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<AccountResponse>>>> GetAccounts()
        {
            try
            {
                var accounts = await context.Accounts
                    .OrderBy(a => a.Type)
                    .ThenBy(a => a.Name)
                    .ToListAsync();

                var accountResponses = accounts.Select(MapToResponse).ToList();

                return Ok(new ApiResponse<List<AccountResponse>>
                {
                    Success = true,
                    Message = "Accounts retrieved successfully",
                    Data = accountResponses
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<List<AccountResponse>>
                {
                    Success = false,
                    Message = "Failed to retrieve accounts",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET: api/accounts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AccountResponse>>> GetAccount(Guid id)
        {
            try
            {
                var account = await context.Accounts.FindAsync(id);

                if (account == null)
                {
                    return NotFound(new ApiResponse<AccountResponse>
                    {
                        Success = false,
                        Message = "Account not found"
                    });
                }

                return Ok(new ApiResponse<AccountResponse>
                {
                    Success = true,
                    Message = "Account retrieved successfully",
                    Data = MapToResponse(account)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<AccountResponse>
                {
                    Success = false,
                    Message = "Failed to retrieve account",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // POST: api/accounts
        [HttpPost]
        public async Task<ActionResult<ApiResponse<AccountResponse>>> PostAccount([FromBody] CreateAccountRequest request)
        {
            if (!ModelState.IsValid) return ValidationBadRequest();

            try
            {
                // Check if account name already exists
                var existingAccount = await context.Accounts
                    .FirstOrDefaultAsync(a => a.Name.ToLower() == request.Name.ToLower());

                if (existingAccount != null)
                {
                    return BadRequest(new ApiResponse<AccountResponse>
                    {
                        Success = false,
                        Message = "Account with this name already exists",
                        Errors = new List<string> { "Account name must be unique" }
                    });
                }

                // Create new account
                var account = new Account
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name.Trim(),
                    Type = request.Type,
                    Balance = request.Balance,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                context.Accounts.Add(account);
                await context.SaveChangesAsync();

                var response = new ApiResponse<AccountResponse>
                {
                    Success = true,
                    Message = "Account created successfully",
                    Data = MapToResponse(account)
                };

                return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, response);
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<AccountResponse>
                {
                    Success = false,
                    Message = "Failed to create account",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<AccountResponse>>> PutAccount(Guid id, [FromBody] UpdateAccountRequest request)
        {
            if (!ModelState.IsValid) return ValidationBadRequest();

            try
            {
                var account = await context.Accounts.FindAsync(id);
                if (account == null)
                {
                    return NotFound(new ApiResponse<AccountResponse> { Success = false, Message = "Account not found" });
                }

                // Check if name is taken by ANOTHER account
                if (await context.Accounts.AnyAsync(a => a.Name.ToLower() == request.Name.ToLower() && a.Id != id))
                {
                    return BadRequest(new ApiResponse<AccountResponse> { Success = false, Message = "Account name already exists" });
                }

                // Update only allowed fields
                account.Name = request.Name.Trim();
                account.Type = request.Type;
                account.UpdatedAt = DateTime.UtcNow;

                await context.SaveChangesAsync();

                return Ok(new ApiResponse<AccountResponse> {
                    Success = true,
                    Message = "Account updated successfully",
                    Data = MapToResponse(account)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<AccountResponse> { Success = false, Message = "Update failed", Errors = new() { ex.Message } });
            }
        }


        private static AccountResponse MapToResponse(Account account)
        {
            return new AccountResponse
            {
                Id = account.Id,
                Name = account.Name,
                Type = account.Type,
                Balance = account.Balance,
                CreatedAt = account.CreatedAt,
                UpdatedAt = account.UpdatedAt
            };
        }

        private BadRequestObjectResult ValidationBadRequest()
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new ApiResponse<AccountResponse>
            {
                Success = false,
                Message = "Validation failed",
                Errors = errors
            });
        }

    }
}