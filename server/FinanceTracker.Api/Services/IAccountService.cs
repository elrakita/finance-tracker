using FinanceTracker.Api.DTOs;

namespace FinanceTracker.Api.Interfaces
{
    public interface IAccountService
    {
        Task<List<AccountResponse>> GetUserAccountsWithBalancesAsync(string userId);
        Task<AccountResponse?> GetUserAccountByIdAsync(string userId, Guid accountId);
        Task NotifyBalanceUpdateAsync(string userId, Guid accountId);
    }
}
