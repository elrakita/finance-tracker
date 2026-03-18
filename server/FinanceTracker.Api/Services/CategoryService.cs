using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DTOs;
using FinanceTracker.Api.Interfaces;

namespace FinanceTracker.Api.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly FinanceContext _context;

        public CategoryService(FinanceContext context) => _context = context;

        public async Task<ApiResponse<List<CategoryResponse>>> GetUserCategoriesAsync(string userId)
        {
            var categories = await _context.Categories
                .Where(c => c.IsDefault || c.UserId == userId)
                .Select(c => new CategoryResponse {
                    Id = c.Id,
                    Name = c.Name,
                    Icon = c.Icon,
                    Color = c.Color,
                    IsDefault = c.IsDefault
                }).ToListAsync();

            return new ApiResponse<List<CategoryResponse>> { Success = true, Data = categories };
        }

        public async Task<ApiResponse<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest request, string userId)
        {
            var exists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == request.Name.ToLower() && 
                            (c.UserId == userId || c.IsDefault));

            if (exists)
            {
                return new ApiResponse<CategoryResponse> 
                { 
                    Success = false, 
                    Message = "A category with this name already exists." 
                };
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Icon = request.Icon,
                Color = request.Color,
                IsDefault = false,
                UserId = userId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new ApiResponse<CategoryResponse>
            {
                Success = true,
                Data = new CategoryResponse
                {
                    Id = category.Id,
                    Name = category.Name,
                    Icon = category.Icon,
                    Color = category.Color,
                    IsDefault = category.IsDefault
                },
                Message = "Category created successfully"
            };
        }


        public async Task<ApiResponse<bool>> BulkCategorizeAsync(BulkCategorizeRequest request, string userId)
        {
            await _context.Transactions
                .Where(t => request.TransactionIds.Contains(t.Id) && t.UserId == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.CategoryId, request.CategoryId));

            return new ApiResponse<bool> { Success = true, Data = true, Message = "Bulk categorization complete" };
        }
    }
}
