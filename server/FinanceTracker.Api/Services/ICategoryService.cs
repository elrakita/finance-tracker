using FinanceTracker.Api.DTOs;

namespace FinanceTracker.Api.Interfaces
{
    public interface ICategoryService
    {
        Task<ApiResponse<List<CategoryResponse>>> GetUserCategoriesAsync(string userId);
        Task<ApiResponse<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest request, string userId);
        Task<ApiResponse<bool>> BulkCategorizeAsync(BulkCategorizeRequest request, string userId);
    }
}