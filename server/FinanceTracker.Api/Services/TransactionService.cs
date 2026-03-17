using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DTOs;
using FinanceTracker.Api.Interfaces;

namespace FinanceTracker.Api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly FinanceContext _context;

        public TransactionService(FinanceContext context)
        {
            _context = context;
        }

        public async Task<ApiPaginatedResponse<TransactionResponse>> GetAccountTransactionsAsync(string accountId, string userId, int page, int limit)
        {
            var accountGuid = Guid.Parse(accountId);

            var query = _context.Transactions
                .Where(t => t.AccountId == accountGuid && t.UserId == userId);

            var totalCount = await query.CountAsync();

            var transactions = await query
                .OrderBy(t => t.CreatedAt)
                .ThenBy(t => t.Id)
                .Select(t => new TransactionResponse
                {
                    Id = t.Id,
                    Type = t.Type,
                    Amount = t.Amount,
                    AccountId = t.AccountId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    BalanceAfter = _context.Transactions
                        .Where(inner => inner.AccountId == t.AccountId && 
                                       (inner.CreatedAt < t.CreatedAt || (inner.CreatedAt == t.CreatedAt && inner.Id <= t.Id)))
                        .Sum(inner => inner.Type == TransactionType.Income ? inner.Amount : -inner.Amount)
                })
                .OrderByDescending(t => t.CreatedAt)
                .ThenByDescending(t => t.Id)
                .Skip(page * limit)
                .Take(limit)
                .ToListAsync();

            return new ApiPaginatedResponse<TransactionResponse>
            {
                Success = true,
                Data = transactions,
                Total = totalCount,
                Message = "Transactions retrieved successfully"
            };
        }

        public async Task<ApiResponse<TransactionResponse>> CreateTransactionAsync(CreateTransactionRequest request, string userId)
        {
            var accountExists = await _context.Accounts
                .AnyAsync(a => a.Id == request.AccountId && a.UserId == userId);

            if (!accountExists)
                return new ApiResponse<TransactionResponse> { Success = false, Message = "Account not found" };

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

            return new ApiResponse<TransactionResponse>
            {
                Success = true,
                Data = new TransactionResponse 
                { 
                    Id = transaction.Id, 
                    Type = transaction.Type, 
                    Amount = transaction.Amount, 
                    AccountId = transaction.AccountId,
                    CreatedAt = transaction.CreatedAt
                },
                Message = "Transaction created successfully"
            };
        }
    }
}
