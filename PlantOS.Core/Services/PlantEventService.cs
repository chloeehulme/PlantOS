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
        var plant = await _plantRepository.GetPlantWithEventsAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        return plant.Events.OrderByDescending(e => e.Date);
    }

    public async Task<PlantEvent?> GetPlantEventByIdAsync(Guid id)
    {
        var plantEvent = await _plantEventRepository.GetPlantEventByIdAsync(id) ?? throw new PlantEventNotFoundException(id);
        return plantEvent;
    }

    public async Task UpdatePlantEventAsync(Guid id, PlantEventType? eventType, DateTime? dateTime, string? notes)
    {
        var plantEvent = await _plantEventRepository.GetPlantEventByIdAsync(id) ?? throw new PlantEventNotFoundException(id);

        if (eventType.HasValue)
        {
            plantEvent.SetEventType(eventType.Value);
        }

        if (dateTime.HasValue)
        {
            plantEvent.SetDate(dateTime.Value);
        }

        if (notes is not null)
        {
            plantEvent.SetNotes(notes);
        }

        await _plantEventRepository.UpdatePlantEventAsync(plantEvent);
    }

    public async Task DeletePlantEventAsync(Guid plantEventId)
    {
        var plantEvent = await _plantEventRepository.GetPlantEventByIdAsync(plantEventId) ?? throw new PlantEventNotFoundException(plantEventId);
        await _plantEventRepository.DeletePlantEventAsync(plantEvent);
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