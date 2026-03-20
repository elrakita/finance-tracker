using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DTOs;
using System.Security.Claims;

namespace FinanceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly Guid InitialBalanceCategoryId = Guid.Parse("00000000-0000-0000-0000-000000000005");
        private readonly FinanceContext context;

        public AccountsController(FinanceContext context)
        {
            this.context = context;
        }

        // GET: api/accounts
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<AccountResponse>>>> GetAccounts()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var accounts = await context.Accounts
                    .Where(a => a.UserId == userId)
                    .Select(a => new AccountResponse
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Type = a.Type,
                        Balance = context.Transactions
                            .Where(t => t.AccountId == a.Id)
                            .Sum(t => t.Type == TransactionType.Income ? t.Amount : -t.Amount),
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt
                    })
                    .OrderBy(a => a.Type)
                    .ThenBy(a => a.Name)
                    .ToListAsync();

                return Ok(new ApiResponse<List<AccountResponse>>
                {
                    Success = true,
                    Message = "Accounts retrieved successfully",
                    Data = accounts
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
            const decimal Epsilon = 0.00000001m;

            if (!ModelState.IsValid) return ValidationBadRequest();
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            using var transactionScope = await context.Database.BeginTransactionAsync();

            try
            {
                var nameLower = request.Name.ToLower();
                if (await context.Accounts.AnyAsync(a => a.UserId == userId && a.Name.ToLower() == nameLower))
                {
                    return BadRequest(new ApiResponse<AccountResponse> {
                        Success = false,
                        Message = "Account name must be unique"
                    });
                }

                var account = new Account
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name.Trim(),
                    Type = request.Type,
                    Balance = request.Balance,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Accounts.Add(account);

                if (Math.Abs(request.Balance) > Epsilon)
                {
                    var initialTx = new Transaction
                    {
                        Id = Guid.NewGuid(),
                        AccountId = account.Id,
                        UserId = userId,
                        Amount = Math.Abs(request.Balance),
                        Type = request.Balance > Epsilon ? TransactionType.Income : TransactionType.Expense,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        CategoryId = InitialBalanceCategoryId
                    };
                    context.Transactions.Add(initialTx);
                }

                await context.SaveChangesAsync();
                await transactionScope.CommitAsync();

                return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, new ApiResponse<AccountResponse>
                {
                    Success = true,
                    Message = "Account and initial transaction created",
                    Data = MapToResponse(account)
                });
            }
            catch (Exception ex)
            {
                await transactionScope.RollbackAsync();
                return BadRequest(new ApiResponse<AccountResponse> {
                    Success = false,
                    Message = "Transaction failed",
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

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteAccount(Guid id)
        {
            try
            {
                var account = await context.Accounts.FindAsync(id);
                
                if (account == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Account not found"
                    });
                }

                context.Accounts.Remove(account);
                await context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Account deleted successfully",
                    Data = null
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to delete account",
                    Errors = new List<string> { ex.Message }
                });
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