using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Entities;
using PlantOS.Core.Interfaces;
using PlantOS.Infrastructure.Data;

namespace PlantOS.Infrastructure.Repositories;

/// <summary>
///
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