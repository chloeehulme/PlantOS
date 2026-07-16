using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Entities;
using PlantOS.Core.Interfaces;
using PlantOS.Infrastructure.Data;

namespace PlantOS.Infrastructure.Repositories;

/// <summary>
/// Provides a data access implementation of <see cref="IPlantRepository"/> using Entity Framework Core.
/// 
/// This class is responsible only for persistence concerns, including querying and updating Plant entities
/// in the database. It should not contain business rules or domain-specific decision making.
/// 
/// Business logic, validation rules, and application workflows belong in the Core layer.
/// This class should expose simple, focused data operations and allow higher layers to determine how
/// retrieved data should be interpreted.
/// 
/// Avoid calling a method within another method. Each method should be self-contained and perform a single operation.
/// </summary>

public class EfPlantRepository : IPlantRepository
{
    private readonly PlantOSDbContext _context;

    public EfPlantRepository(PlantOSDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Plant>> GetAllPlantsAsync()
    {
        return await _context.Plants.ToListAsync();
    }

    public async Task<Plant?> GetPlantByIdAsync(Guid id)
    {
        return await _context.Plants
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Plant?> GetPlantWithEventsAsync(Guid id)
    {
        return await _context.Plants
            .Include(p => p.Events)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddPlantAsync(Plant plant)
    {
        _context.Plants.Add(plant);
        await _context.SaveChangesAsync();
    }

    public async Task UpdatePlantAsync(Plant plant)
    {
        _context.Plants.Update(plant);
        await _context.SaveChangesAsync();
    }

    public async Task DeletePlantAsync(Plant plant)
    {
        _context.Plants.Remove(plant);
        await _context.SaveChangesAsync();
    }
}