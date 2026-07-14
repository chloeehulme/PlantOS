using PlantOS.Core.Entities;

namespace PlantOS.Core.Interfaces;

public interface IPlantRepository
{
    Task<IEnumerable<Plant>> GetAllPlantsAsync();

    Task<Plant?> GetPlantByIdAsync(Guid id);

    Task<Plant?> GetPlantWithEventsAsync(Guid id);

    Task AddPlantAsync(Plant plant);

    Task UpdatePlantAsync(Plant plant);

    Task DeletePlantAsync(Plant plant);
}