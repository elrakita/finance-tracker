using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Data
{
    public class FinanceContext : DbContext
    {
        public FinanceContext(DbContextOptions<FinanceContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
    }
}