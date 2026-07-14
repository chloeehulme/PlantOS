using PlantOS.Core.Entities;

namespace PlantOS.Core.Interfaces;

public interface IPlantEventRepository
{

    // This is per plant, does not make sense to get all events in the system (for now)
    Task<IEnumerable<PlantEvent>> GetPlantEventsAsync(Guid plantId);

    // This is a specific event from a specific plant
    Task<PlantEvent> GetPlantEventByIdAsync(Guid id);

    Task AddPlantEventAsync(PlantEvent plantEvent);

    Task UpdatePlantEventAsync(PlantEvent plantEvent);

    Task DeletePlantEventAsync(Guid id);
}