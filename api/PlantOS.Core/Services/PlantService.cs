using PlantOS.Core.Entities;
using PlantOS.Core.Exceptions;
using PlantOS.Core.Interfaces;

namespace PlantOS.Core.Services;

/// <summary>
/// Provides application and business logic for managing Plant entities.
/// 
/// This service coordinates workflows involving Plants and acts as the boundary between the API layer
/// and the data access layer. It is responsible for applying business rules, managing domain operations,
/// and determining when exceptions should be raised.
/// 
/// This class should not contain HTTP-specific concerns such as status codes, request handling,
/// or response formatting. Input validation related to HTTP requests belongs in the API layer,
/// while business validation belongs here or within the domain entities.
/// 
/// Assumption: requests reaching this service have already been validated by the controller.
/// </summary>

public class PlantService
{
    private readonly IPlantRepository _plantRepository;

    public PlantService(IPlantRepository plantRepository)
    {
        _plantRepository = plantRepository;
    }

    public async Task<IEnumerable<Plant>> GetAllPlantsAsync()
    {
        return await _plantRepository.GetAllPlantsAsync();
    }

    public async Task<Plant> GetPlantByIdAsync(Guid id)
    {
        var plant = await _plantRepository.GetPlantByIdAsync(id) ?? throw new PlantNotFoundException(id);
        return plant;
    }

    public async Task<Plant> GetPlantWithEventsAsync(Guid id)
    {
        var plant = await _plantRepository.GetPlantWithEventsAsync(id) ?? throw new PlantNotFoundException(id);
        return plant;
    }

    public async Task AddPlantAsync(Plant plant)
    {
        await _plantRepository.AddPlantAsync(plant);
    }

    public async Task UpdatePlantAsync(Guid id, string? name, string? species, int? tileX, int? tileY)
    {
        var plant = await GetPlantByIdAsync(id) ?? throw new PlantNotFoundException(id);

        if (name is not null)
        {
            plant.SetName(name);
        }

        if (species is not null)
        {
            plant.SetSpecies(species);
        }

        if (tileX is not null)
        {
            plant.SetTileX(tileX.Value);
        }

        if (tileY is not null)
        {
            plant.SetTileY(tileY.Value);
        }

        await _plantRepository.UpdatePlantAsync(plant);
    }

    public async Task DeletePlantAsync(Guid id)
    {
        var plant = await GetPlantByIdAsync(id) ?? throw new PlantNotFoundException(id);
        await _plantRepository.DeletePlantAsync(plant);
    }
}
