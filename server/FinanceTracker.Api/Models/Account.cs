using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Models
{
    public class Account
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public AccountType Type { get; set; }

        [Required]
        public decimal Balance { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }

    public enum AccountType
    {
        Checking = 1,
        Savings = 2,
        CreditCard = 3
    }
}