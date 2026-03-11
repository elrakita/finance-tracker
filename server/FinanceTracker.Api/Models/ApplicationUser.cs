using Microsoft.AspNetCore.Identity;

namespace FinanceTracker.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Custom fields specific to your Finance App
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property to link users to their finance accounts
        // public ICollection<Account> Accounts { get; set; }
    }
}
