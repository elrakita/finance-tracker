using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Interfaces;
using FinanceTracker.Api.DTOs;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace FinanceTracker.Api.Services
{
    public class AccountService : IAccountService
    {
        private readonly FinanceContext _context;
        private readonly IHubContext<FinanceHub> _hubContext;
        private readonly IHttpContextAccessor _httpContextAccessor; 

        public AccountService(FinanceContext context, 
            IHubContext<FinanceHub> hubContext, 
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _hubContext = hubContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<AccountResponse>> GetUserAccountsWithBalancesAsync(string userId)
        {
            return await _context.Accounts
                .Where(a => a.UserId == userId)
                .Select(a => new AccountResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Type = a.Type,
                    Balance = _context.Transactions
                        .Where(t => t.AccountId == a.Id)
                        .Sum(t => t.Type == TransactionType.Income ? t.Amount : -t.Amount),
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .OrderBy(a => a.Type)
                .ThenBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<AccountResponse?> GetUserAccountByIdAsync(string userId, Guid accountId)
        {
            return await _context.Accounts
                .Where(a => a.UserId == userId && a.Id == accountId)
                .Select(a => new AccountResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Type = a.Type,
                    Balance = _context.Transactions
                        .Where(t => t.AccountId == a.Id)
                        .Sum(t => t.Type == TransactionType.Income ? t.Amount : -t.Amount),
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task NotifyBalanceUpdateAsync(string userId, Guid accountId)
        {
            var account = await GetUserAccountByIdAsync(userId, accountId);
            if (account != null)
            {
                var connectionId = _httpContextAccessor.HttpContext?.Request.Headers["X-SignalR-Connection-Id"].ToString();
                await _hubContext.Clients.User(userId).SendAsync(
                    "ReceiveBalanceUpdate", 
                    accountId, 
                    account.Balance,
                    account.Name,
                    connectionId
                );
            }
        }
    }
}
