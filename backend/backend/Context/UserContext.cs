using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Context
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions<UserContext> options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
    }
}