using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceTracker.Api.Models
{
    public class Transaction
    {
        public Guid Id { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid AccountId { get; set; } = Guid.Empty;
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("AccountId")]
        public virtual Account? Account { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }
    }

    public enum TransactionType
    {
        Income = 1,
        Expense = 2
    }
}