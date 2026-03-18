using Microsoft.AspNetCore.Mvc;
using FinanceTracker.Api.DTOs;
using FinanceTracker.Api.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace FinanceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CategoryResponse>>>> GetCategories()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _categoryService.GetUserCategoriesAsync(userId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<CategoryResponse>>> PostCategory([FromBody] CreateCategoryRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _categoryService.CreateCategoryAsync(request, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("bulk-categorize")]
        public async Task<ActionResult<ApiResponse<bool>>> BulkCategorize([FromBody] BulkCategorizeRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _categoryService.BulkCategorizeAsync(request, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
