using Microsoft.EntityFrameworkCore;
using DoAnLtWeb.Models;

namespace DoAnLtWeb.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Presentation> Presentations { get; set; }
        public DbSet<Slide> Slides { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Presentation>()
                .HasMany(p => p.Slides)
                .WithOne(s => s.Presentation)
                .HasForeignKey(s => s.PresentationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
