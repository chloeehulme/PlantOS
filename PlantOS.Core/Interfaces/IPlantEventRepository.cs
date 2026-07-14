using PlantOS.Core.Entities;

namespace PlantOS.Core.Interfaces;

public interface IPlantEventRepository
{
    Task<IEnumerable<PlantEvent>> GetPlantEventsAsync(Guid plantId);

    Task AddPlantEventAsync(PlantEvent plantEvent);
}