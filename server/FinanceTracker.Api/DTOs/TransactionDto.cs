using System.ComponentModel.DataAnnotations;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.DTOs
{
    public class CreateTransactionRequest
    {
        [Required(ErrorMessage = "Transaction type is required")]
        public TransactionType Type { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(-999999.99, 999999.99, ErrorMessage = "Amount must be between -999,999.99 and 999,999.99")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Account ID is required")]
        public Guid AccountId { get; set; } = Guid.Empty;
    }

    public class TransactionResponse
    {
        public Guid Id { get; set; }
        public TransactionType Type { get; set; }
        public string TypeDisplay => Type.ToString();
        public decimal Amount { get; set; }
        public Guid AccountId { get; set; } = Guid.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
