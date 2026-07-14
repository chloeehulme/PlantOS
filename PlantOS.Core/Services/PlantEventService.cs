using PlantOS.Core.Entities;
using PlantOS.Core.Exceptions;
using PlantOS.Core.Interfaces;

namespace PlantOS.Core.Services;

/// <summary>
/// 
/// </summary>

public class PlantEventService
{
    private readonly IPlantEventRepository _plantEventRepository;

    private readonly IPlantRepository _plantRepository;

    public PlantEventService(IPlantEventRepository plantEventRepository, IPlantRepository plantRepository)
    {
        _plantEventRepository = plantEventRepository;
        _plantRepository = plantRepository;
    }

    public async Task<IEnumerable<PlantEvent>> GetPlantEventsAsync(Guid plantId)
    {
        return await _plantEventRepository.GetPlantEventsAsync(plantId);
    }

    public async Task WaterPlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.Watered,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }
}