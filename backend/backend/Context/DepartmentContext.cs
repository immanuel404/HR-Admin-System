using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Context
{
    public class DepartmentContext : DbContext
    {
        public DepartmentContext(DbContextOptions<DepartmentContext> options) : base(options)
        {

        }
        public DbSet<Department> Departments { get; set; }
    }
}