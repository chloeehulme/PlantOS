using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Entities;
using PlantOS.Infrastructure.Data;
using PlantOS.Infrastructure.Repositories;
using Xunit;

namespace PlantOS.Tests.Infrastructure;

public class RepositoryTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly PlantOSDbContext _context;

    public RepositoryTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<PlantOSDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new PlantOSDbContext(options);
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task EfPlantRepository_AddPlantAsync_PersistsPlantAndThrowsOnInvalidState()
    {
        var repository = new EfPlantRepository(_context);
        var plant = new Plant(Guid.NewGuid(), "Rose", "Rosa");

        await repository.AddPlantAsync(plant);

        var persisted = await _context.Plants.SingleAsync(p => p.Id == plant.Id);
        Assert.Equal("Rose", persisted.Name);
    }

    [Fact]
    public async Task EfPlantRepository_GetPlantWithEventsAsync_LoadsEventsForMatchingPlant()
    {
        var repository = new EfPlantRepository(_context);
        var plant = new Plant(Guid.NewGuid(), "Fern", "Nephrolepis");
        plant.Events.Add(new PlantEvent(Guid.NewGuid(), plant.Id, PlantEventType.Water, new DateTime(2024, 1, 1), "Watered"));

        await repository.AddPlantAsync(plant);

        var fetched = await repository.GetPlantWithEventsAsync(plant.Id);

        Assert.NotNull(fetched);
        Assert.Single(fetched!.Events);
        Assert.Equal(PlantEventType.Water, fetched.Events.Single().EventType);
    }

    [Fact]
    public async Task EfPlantEventRepository_AddPlantEventAsync_PersistsEventWithPlantReference()
    {
        var plant = new Plant(Guid.NewGuid(), "Basil", "Ocimum");
        await _context.Plants.AddAsync(plant);
        await _context.SaveChangesAsync();

        var repository = new EfPlantEventRepository(_context);
        var plantEvent = new PlantEvent(Guid.NewGuid(), plant.Id, PlantEventType.Fertilise, new DateTime(2024, 2, 1), "Fertilised");

        await repository.AddPlantEventAsync(plantEvent);

        var persisted = await _context.PlantEvents.SingleAsync(e => e.Id == plantEvent.Id);
        Assert.Equal(plant.Id, persisted.PlantId);
    }

    [Fact]
    public async Task EfPlantRepository_DeletePlantAsync_Throws_WhenPlantIsDetachedOrInvalid()
    {
        var repository = new EfPlantRepository(_context);
        var plant = new Plant(Guid.NewGuid(), "Cactus", "Cactaceae");

        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => repository.DeletePlantAsync(plant));
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
