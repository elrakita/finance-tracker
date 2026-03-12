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
    public class TransactionsController : ControllerBase
    {
        private readonly FinanceContext _context;

        public TransactionsController(FinanceContext context)
        {
            _context = context;
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TransactionResponse>>> PostTransaction([FromBody] CreateTransactionRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(new ApiResponse<TransactionResponse> { Success = false, Message = "Invalid data" });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                // Verify account exists and belongs to user before creating transaction
                var accountExists = await _context.Accounts
                    .AnyAsync(a => a.Id == request.AccountId && a.UserId == userId);

                if (!accountExists)
                {
                    return NotFound(new ApiResponse<TransactionResponse> { Success = false, Message = "Account not found or access denied" });
                }

                var transaction = new Transaction
                {
                    Id = Guid.NewGuid(),
                    Type = request.Type,
                    Amount = request.Amount,
                    AccountId = request.AccountId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<TransactionResponse>
                {
                    Success = true,
                    Message = "Transaction created successfully",
                    Data = MapToResponse(transaction)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<TransactionResponse> { Success = false, Message = "Failed to create transaction", Errors = new() { ex.Message } });
            }
        }

        // GET: api/transactions/account/{accountId}
        [HttpGet("account/{accountId}")]
        public async Task<ActionResult<ApiResponse<List<TransactionResponse>>>> GetAccountTransactions(string accountId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var transactions = await _context.Transactions
                    .Where(t => t.AccountId.ToString() == accountId && t.UserId == userId)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return Ok(new ApiResponse<List<TransactionResponse>>
                {
                    Success = true,
                    Message = "Transactions retrieved successfully",
                    Data = transactions.Select(MapToResponse).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<List<TransactionResponse>> { Success = false, Message = "Failed to load transactions", Errors = new() { ex.Message } });
            }
        }

        private TransactionResponse MapToResponse(Transaction t)
        {
            return new TransactionResponse
            {
                Id = t.Id,
                Type = t.Type,
                Amount = t.Amount,
                AccountId = t.AccountId,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            };
        }
    }
}
