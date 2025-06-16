using System.ComponentModel.DataAnnotations;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DTOs
{
    public class CreateAccountRequest
    {
        [Required(ErrorMessage = "Account name is required")]
        [MaxLength(100, ErrorMessage = "Account name cannot exceed 100 characters")]
        [MinLength(3, ErrorMessage = "Account name must be at least 3 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Account type is required")]
        public AccountType Type { get; set; }

        [Required(ErrorMessage = "Balance is required")]
        [Range(-999999.99, 999999.99, ErrorMessage = "Balance must be between -999,999.99 and 999,999.99")]
        public decimal Balance { get; set; } = 0.00m;
    }

    public class AccountResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public AccountType Type { get; set; }
        public string TypeDisplay => Type.ToString();
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}