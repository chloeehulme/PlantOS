using PlantOS.Core.Entities;
using PlantOS.Core.Exceptions;
using PlantOS.Core.Interfaces;
using PlantOS.Core.Services;
using Xunit;

namespace PlantOS.Tests.Services;

public class PlantEventServiceTests
{
    [Fact]
    public async Task GetPlantEventsAsync_ReturnsEventsInDescendingDateOrder()
    {
        var plant = CreatePlantWithEvents();
        var repository = new StubPlantRepository { Plant = plant };
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        var result = (await service.GetPlantEventsAsync(plant.Id)).ToList();

        Assert.Collection(
            result,
            e => Assert.Equal(new DateTime(2024, 3, 10), e.Date),
            e => Assert.Equal(new DateTime(2024, 2, 10), e.Date));
    }

    [Fact]
    public async Task GetPlantEventByIdAsync_Throws_WhenEventIsMissing()
    {
        var plant = CreatePlantWithEvents();
        var repository = new StubPlantRepository { Plant = plant };
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        await Assert.ThrowsAsync<PlantEventNotFoundException>(() => service.GetPlantEventByIdAsync(plant.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdatePlantEventAsync_UpdatesOnlyProvidedFields()
    {
        var plant = CreatePlantWithEvents();
        var repository = new StubPlantRepository { Plant = plant };
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        await service.UpdatePlantEventAsync(plant.Id, plant.Events.First().Id, null, new DateTime(2024, 4, 1), "Updated note");

        var updated = eventRepository.UpdatedPlantEvent!;
        Assert.Equal(new DateTime(2024, 4, 1), updated.Date);
        Assert.Equal("Updated note", updated.Notes);
        Assert.Equal(PlantEventType.Water, updated.EventType);
    }

    [Fact]
    public async Task UpdatePlantEventAsync_WithNullValues_DoesNotChangeExistingValues()
    {
        var plant = CreatePlantWithEvents();
        var repository = new StubPlantRepository { Plant = plant };
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        await service.UpdatePlantEventAsync(plant.Id, plant.Events.First().Id, null, null, null);

        var updated = eventRepository.UpdatedPlantEvent!;
        Assert.Equal(new DateTime(2024, 2, 10), updated.Date);
        Assert.Equal("First", updated.Notes);
        Assert.Equal(PlantEventType.Water, updated.EventType);
    }

    [Fact]
    public async Task GetPlantEventsAsync_ReturnsEmptyCollection_WhenPlantHasNoEvents()
    {
        var plant = new Plant(Guid.NewGuid(), "Fern", "Nephrolepis");
        var repository = new StubPlantRepository { Plant = plant };
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        var result = (await service.GetPlantEventsAsync(plant.Id)).ToList();

        Assert.Empty(result);
    }

    [Fact]
    public async Task WaterPlantAsync_AddsWaterEventForExistingPlant()
    {
        var plant = new Plant(Guid.NewGuid(), "Fern", "Nephrolepis");
        var repository = new StubPlantRepository { Plant = plant };
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        await service.WaterPlantAsync(plant.Id, new DateTime(2024, 5, 1), "Watered thoroughly");

        Assert.Single(eventRepository.AddedEvents);
        var added = eventRepository.AddedEvents.Single();
        Assert.Equal(PlantEventType.Water, added.EventType);
        Assert.Equal(plant.Id, added.PlantId);
        Assert.Equal("Watered thoroughly", added.Notes);
    }

    [Fact]
    public async Task WaterPlantAsync_Throws_WhenPlantDoesNotExist()
    {
        var repository = new StubPlantRepository();
        var eventRepository = new StubPlantEventRepository();
        var service = new PlantEventService(eventRepository, repository);

        await Assert.ThrowsAsync<PlantNotFoundException>(() => service.WaterPlantAsync(Guid.NewGuid(), DateTime.UtcNow, null));
    }

    private static Plant CreatePlantWithEvents()
    {
        var plant = new Plant(Guid.NewGuid(), "Rose", "Rosa");
        plant.Events.Add(new PlantEvent(Guid.NewGuid(), plant.Id, PlantEventType.Water, new DateTime(2024, 2, 10), "First"));
        plant.Events.Add(new PlantEvent(Guid.NewGuid(), plant.Id, PlantEventType.Fertilise, new DateTime(2024, 3, 10), "Second"));
        return plant;
    }

    private sealed class StubPlantRepository : IPlantRepository
    {
        public Plant? Plant { get; set; }

        public Task<IEnumerable<Plant>> GetAllPlantsAsync() => Task.FromResult<IEnumerable<Plant>>(Array.Empty<Plant>());

        public Task<Plant?> GetPlantByIdAsync(Guid id) => Task.FromResult(Plant?.Id == id ? Plant : null);

        public Task<Plant?> GetPlantWithEventsAsync(Guid id) => Task.FromResult(Plant?.Id == id ? Plant : null);

        public Task AddPlantAsync(Plant plant) => Task.CompletedTask;

        public Task UpdatePlantAsync(Plant plant) => Task.CompletedTask;

        public Task DeletePlantAsync(Plant plant) => Task.CompletedTask;
    }

    private sealed class StubPlantEventRepository : IPlantEventRepository
    {
        public List<PlantEvent> AddedEvents { get; } = [];
        public PlantEvent? UpdatedPlantEvent { get; private set; }

        public Task<PlantEvent?> GetPlantEventByIdAsync(Guid id) => Task.FromResult<PlantEvent?>(null);

        public Task AddPlantEventAsync(PlantEvent plantEvent)
        {
            AddedEvents.Add(plantEvent);
            return Task.CompletedTask;
        }

        public Task UpdatePlantEventAsync(PlantEvent plantEvent)
        {
            UpdatedPlantEvent = plantEvent;
            return Task.CompletedTask;
        }

        public Task DeletePlantEventAsync(PlantEvent plantEvent) => Task.CompletedTask;
    }
}
