using PlantOS.Core.Entities;
using PlantOS.Core.Exceptions;
using PlantOS.Core.Interfaces;

namespace PlantOS.Core.Services;

/// <summary>
/// Provides application and business logic for managing PlantEvent entities.
/// 
/// This service coordinates workflows involving PlantEvents and acts as the boundary between the API layer
/// and the data access layer. It is responsible for applying business rules, managing domain operations,
/// and determining when exceptions should be raised.
/// 
/// This class should not contain HTTP-specific concerns such as status codes, request handling,
/// or response formatting. Input validation related to HTTP requests belongs in the API layer,
/// while business validation belongs here or within the domain entities.
/// 
/// Assumption: requests reaching this service have already been validated by the controller.
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

    public async Task<PlantEvent?> GetPlantEventByIdAsync(Guid plantId, Guid id)
    {
        var plant = await _plantRepository.GetPlantWithEventsAsync(plantId) ?? throw new PlantNotFoundException(plantId);
        var plantEvent = plant.Events.FirstOrDefault(e => e.Id == id) ?? throw new PlantEventNotFoundException(id);

        return plantEvent;
    }

    public async Task UpdatePlantEventAsync(Guid plantId, Guid id, PlantEventType? eventType, DateTime? dateTime, string? notes)
    {
        var plantEvent = await GetPlantEventByIdAsync(plantId, id) ?? throw new PlantEventNotFoundException(id);

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

    public async Task DeletePlantEventAsync(Guid plantId, Guid id)
    {
        var plantEvent = await GetPlantEventByIdAsync(plantId, id) ?? throw new PlantEventNotFoundException(id);
        await _plantEventRepository.DeletePlantEventAsync(plantEvent);
    }

    public async Task WaterPlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.Water,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }

    public async Task FertilisePlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.Fertilise,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }

    public async Task RepotPlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.Repot,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }

    public async Task PrunePlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.Prune,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }

    public async Task BloomPlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.Bloom,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }

    public async Task NewLeafPlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.NewLeaf,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }

    public async Task PestDetectionPlantAsync(Guid plantId, DateTime dateTime, string? notes)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(plantId) ?? throw new PlantNotFoundException(plantId);

        var plantEvent = new PlantEvent(
            Guid.NewGuid(),
            plant.Id,
            PlantEventType.PestDetection,
            dateTime,
            notes
        );

        await _plantEventRepository.AddPlantEventAsync(plantEvent);
    }
}
