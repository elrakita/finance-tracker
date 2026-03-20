using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace FinanceTracker.Api.Data
{
    public class FinanceContext : IdentityDbContext<ApplicationUser>
    {
        public FinanceContext(DbContextOptions<FinanceContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<IdentityRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");

            builder.Entity<Category>().HasData(
                new Category 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), 
                    Name = "Food", 
                    Icon = "🍔", 
                    Color = "#FF5733", 
                    IsDefault = true 
                },
                new Category 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), 
                    Name = "Housing", 
                    Icon = "🏠", 
                    Color = "#3357FF", 
                    IsDefault = true 
                },
                new Category 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), 
                    Name = "Transportation", 
                    Icon = "🚗", 
                    Color = "#33FF57", 
                    IsDefault = true 
                },
                new Category 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), 
                    Name = "Salary", 
                    Icon = "💰", 
                    Color = "#2ECC71", 
                    IsDefault = true 
                },
                new Category 
                { 
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000005"), 
                    Name = "Initial Balance", 
                    Icon = "🏁", 
                    Color = "#201c1c", 
                    IsDefault = true 
                 }
            );

        }
    }
}
