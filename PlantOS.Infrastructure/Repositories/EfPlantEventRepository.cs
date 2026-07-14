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

    public async Task<IEnumerable<PlantEvent>> GetPlantEventsAsync(Guid plantId)
    {
        return await _context.PlantEvents
            .Where(e => e.PlantId == plantId)
            .Include(e => e.Plant)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task AddPlantEventAsync(PlantEvent plantEvent)
    {
        _context.Add(plantEvent);
        await _context.SaveChangesAsync();
    }
}