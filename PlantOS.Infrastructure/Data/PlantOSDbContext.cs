using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Entities;

namespace PlantOS.Infrastructure.Data;

public class PlantOSDbContext : DbContext
{
    public PlantOSDbContext(
        DbContextOptions<PlantOSDbContext> options)
        : base(options)
    {
    }

    public DbSet<Plant> Plants => Set<Plant>();

    public DbSet<PlantEvent> PlantEvents => Set<PlantEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlantEvent>()
            .HasOne(e => e.Plant)
            .WithMany(p => p.Events)
            .HasForeignKey(e => e.PlantId)
            .IsRequired();

        base.OnModelCreating(modelBuilder);
    }
}