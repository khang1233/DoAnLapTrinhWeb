using System;
using System.Linq;
using DoAnLtWeb.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DoAnLtWeb.Data
{
    public static class DbInitializer
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new AppDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>()))
            {
                // Create a system user for templates if doesn't exist
                var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@slidify.com");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        Username = "System Admin",
                        Email = "admin@slidify.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
                    };
                    context.Users.Add(adminUser);
                    context.SaveChanges();
                }
            }
        }
    }
}
