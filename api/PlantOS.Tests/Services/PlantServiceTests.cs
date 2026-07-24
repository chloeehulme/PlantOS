using PlantOS.Core.Entities;
using PlantOS.Core.Exceptions;
using PlantOS.Core.Interfaces;
using PlantOS.Core.Services;
using Xunit;

namespace PlantOS.Tests.Services;

public class PlantServiceTests
{
    [Fact]
    public async Task GetPlantByIdAsync_Throws_WhenPlantDoesNotExist()
    {
        var repository = new StubPlantRepository();
        var service = new PlantService(repository);

        await Assert.ThrowsAsync<PlantNotFoundException>(() => service.GetPlantByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdatePlantAsync_UpdatesOnlyProvidedFields()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 0, 0);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await service.UpdatePlantAsync(plant.Id, "Updated Name", null, null, null);

        Assert.Equal("Updated Name", repository.Plant!.Name);
        Assert.Equal("Original Species", repository.Plant.Species);
    }

    [Fact]
    public async Task UpdatePlantAsync_RejectsBlankPlantName()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 0, 0);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdatePlantAsync(plant.Id, "   ", null, null, null));
    }

    [Fact]
    public async Task UpdatePlantAsync_WithNullValues_DoesNotChangeExistingValues()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 0, 0);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await service.UpdatePlantAsync(plant.Id, null, null, null, null);

        Assert.Equal("Original Name", repository.Plant!.Name);
        Assert.Equal("Original Species", repository.Plant.Species);
    }

    [Fact]
    public async Task DeletePlantAsync_UsesResolvedPlantFromRepository()
    {
        var plant = new Plant(Guid.NewGuid(), "Rose", "Rosa", 0, 0);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await service.DeletePlantAsync(plant.Id);

        Assert.Equal(plant.Id, repository.DeletedPlantId);
    }

    [Fact]
    public async Task UpdatePlantAsync_UpdatesTilePosition_WhenProvided()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 1, 2);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await service.UpdatePlantAsync(plant.Id, null, null, 5, 7);

        Assert.Equal(5, repository.Plant!.TileX);
        Assert.Equal(7, repository.Plant.TileY);
    }

    [Fact]
    public async Task UpdatePlantAsync_LeavesTilePositionUnchanged_WhenNotProvided()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 1, 2);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await service.UpdatePlantAsync(plant.Id, "Updated Name", null, null, null);

        Assert.Equal(1, repository.Plant!.TileX);
        Assert.Equal(2, repository.Plant.TileY);
    }

    [Fact]
    public async Task UpdatePlantAsync_Throws_WhenTileXIsNegative()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 0, 0);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => service.UpdatePlantAsync(plant.Id, null, null, -1, null));
    }

    [Fact]
    public async Task UpdatePlantAsync_Throws_WhenTileYIsNegative()
    {
        var plant = new Plant(Guid.NewGuid(), "Original Name", "Original Species", 0, 0);
        var repository = new StubPlantRepository { Plant = plant };
        var service = new PlantService(repository);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => service.UpdatePlantAsync(plant.Id, null, null, null, -1));
    }

    [Fact]
    public void Constructor_Throws_WhenTileXIsNegative()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Plant(Guid.NewGuid(), "Rose", "Rosa", -1, 0));
    }

    [Fact]
    public void Constructor_Throws_WhenTileYIsNegative()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Plant(Guid.NewGuid(), "Rose", "Rosa", 0, -1));
    }

    private sealed class StubPlantRepository : IPlantRepository
    {
        public Plant? Plant { get; set; }
        public Guid? DeletedPlantId { get; private set; }

        public Task<IEnumerable<Plant>> GetAllPlantsAsync() => Task.FromResult<IEnumerable<Plant>>(Array.Empty<Plant>());

        public Task<Plant?> GetPlantByIdAsync(Guid id) => Task.FromResult(Plant?.Id == id ? Plant : null);

        public Task<Plant?> GetPlantWithEventsAsync(Guid id) => Task.FromResult(Plant?.Id == id ? Plant : null);

        public Task AddPlantAsync(Plant plant) => Task.CompletedTask;

        public Task UpdatePlantAsync(Plant plant)
        {
            Plant = plant;
            return Task.CompletedTask;
        }

        public Task DeletePlantAsync(Plant plant)
        {
            DeletedPlantId = plant.Id;
            return Task.CompletedTask;
        }
    }
}
