using FinanceTracker.Api.DTOs;

namespace FinanceTracker.Api.Interfaces
{
    public interface ITransactionService
    {
        Task<ApiPaginatedResponse<TransactionResponse>> GetAccountTransactionsAsync(string accountId, string userId, int page, int limit);
        Task<ApiResponse<TransactionResponse>> CreateTransactionAsync(CreateTransactionRequest request, string userId);
    }
}
