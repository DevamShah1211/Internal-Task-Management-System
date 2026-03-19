using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models;
using BC = BCrypt.Net.BCrypt;

namespace TaskManagement.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.Migrate();

            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }

            var admin = new User
            {
                Name = "Admin User",
                Email = "admin@taskflow.com",
                PasswordHash = BC.HashPassword("Admin@123"),
                Role = "Admin"
            };

            var user = new User
            {
                Name = "John Doe",
                Email = "john@taskflow.com",
                PasswordHash = BC.HashPassword("User@123"),
                Role = "User"
            };

            context.Users.AddRange(admin, user);
            context.SaveChanges();

            var tasks = new TaskItem[]
            {
                new TaskItem { 
                    Title = "Implement Auth", 
                    Description = "Setup JWT and BCrypt", 
                    Priority = TaskPriority.High, 
                    Status = Models.TaskStatus.Completed, 
                    DueDate = DateTime.UtcNow.AddDays(2),
                    CreatedById = admin.Id,
                    AssignedToId = user.Id
                },
                new TaskItem { 
                    Title = "Design UI", 
                    Description = "Create mockup for dashboard", 
                    Priority = TaskPriority.Medium, 
                    Status = Models.TaskStatus.InProgress, 
                    DueDate = DateTime.UtcNow.AddDays(5),
                    CreatedById = user.Id,
                    AssignedToId = admin.Id
                },
                new TaskItem { 
                    Title = "Unit Testing", 
                    Description = "Write tests for controllers", 
                    Priority = TaskPriority.Low, 
                    Status = Models.TaskStatus.Pending, 
                    DueDate = DateTime.UtcNow.AddDays(7),
                    CreatedById = admin.Id,
                    AssignedToId = user.Id
                }
            };

            context.Tasks.AddRange(tasks);
            context.SaveChanges();
        }
    }
}
 