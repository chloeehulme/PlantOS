using PlantOS.Core.Entities;

namespace PlantOS.Core.Interfaces;

public interface IPlantEventRepository
{
    Task<PlantEvent?> GetPlantEventByIdAsync(Guid id);

    Task AddPlantEventAsync(PlantEvent plantEvent);

    Task UpdatePlantEventAsync(PlantEvent plantEvent);

    Task DeletePlantEventAsync(PlantEvent plantEvent);
}