using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.DTOs
{
    public class CreateCategoryRequest
    {
        [Required(ErrorMessage = "Category name is required")]
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "An icon is required")]
        public string Icon { get; set; } = "📁"; // Users can send an emoji

        [Required(ErrorMessage = "A color is required for reporting")]
        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Invalid Hex color")]
        public string Color { get; set; } = "#cccccc";
    }

    public class CategoryResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class BulkCategorizeRequest
    {
        public List<Guid> TransactionIds { get; set; } = new();
        public Guid CategoryId { get; set; }
    }
}
