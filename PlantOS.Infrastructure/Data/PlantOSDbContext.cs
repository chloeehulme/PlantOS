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
}