using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Entities;
using PlantOS.Core.Interfaces;
using PlantOS.Infrastructure.Data;

namespace PlantOS.Infrastructure.Repositories;

/// <summary>
/// Provides a data access implementation of <see cref="IPlantEventRepository"/> using Entity Framework Core.
/// 
/// This class is responsible only for persistence concerns, including querying and updating PlantEvent entities
/// in the database. It should not contain business rules or domain-specific decision making.
/// 
/// Business logic, validation rules, and application workflows belong in the Core layer.
/// This class should expose simple, focused data operations and allow higher layers to determine how
/// retrieved data should be interpreted.
/// 
/// Avoid calling a method within another method. Each method should be self-contained and perform a single operation.
/// </summary>

public class EfPlantEventRepository : IPlantEventRepository
{
    private readonly PlantOSDbContext _context;

    public EfPlantEventRepository(PlantOSDbContext context)
    {
        _context = context;
    }

    public async Task<PlantEvent?> GetPlantEventByIdAsync(Guid id)
    {
        return await _context.PlantEvents
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddPlantEventAsync(PlantEvent plantEvent)
    {
        _context.Add(plantEvent);
        await _context.SaveChangesAsync();
    }

    public async Task UpdatePlantEventAsync(PlantEvent plantEvent)
    {
        _context.Update(plantEvent);
        await _context.SaveChangesAsync();
    }

    public async Task DeletePlantEventAsync(PlantEvent plantEvent)
    {

        _context.Remove(plantEvent);
        await _context.SaveChangesAsync();
    }
}
