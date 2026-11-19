using Laboratorna8_UtilitiesApi.Models;
using Microsoft.EntityFrameworkCore;

namespace Laboratorna8_UtilitiesApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<TenantService> TenantServices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TenantService>()
                .HasKey(ts => new { ts.TenantID, ts.ServiceID });
        }
    }
}
