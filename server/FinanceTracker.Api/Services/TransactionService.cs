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

        public async Task<ApiPaginatedResponse<TransactionResponse>> GetAccountTransactionsAsync(
            string accountId, string userId, int page, int limit)
        {
            var accountGuid = Guid.Parse(accountId);

            var totalCount = await _context.Transactions
                .Where(t => t.AccountId == accountGuid && t.UserId == userId)
                .CountAsync();

            var query = _context.Database.SqlQuery<TransactionResponse>($"""
                SELECT 
                    t."Id",
                    t."Type",
                    t."Amount",
                    t."AccountId",
                    t."CategoryId",
                    c."Name" AS "CategoryName",
                    t."CreatedAt",
                    t."UpdatedAt",
                    SUM(CASE WHEN t."Type" = {(int)TransactionType.Income} THEN t."Amount" ELSE -t."Amount" END) 
                        OVER (ORDER BY t."CreatedAt" ASC, t."Id" ASC) AS "BalanceAfter"
                FROM "Transactions" as t
                LEFT JOIN "Categories" as c ON t."CategoryId" = c."Id" 
                WHERE t."AccountId" = {accountGuid} AND t."UserId" = {userId}
                """);

            var transactions = await query
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
                CategoryId = request.CategoryId!.Value,
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
