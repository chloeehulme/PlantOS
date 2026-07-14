using Microsoft.AspNetCore.Mvc;
using PlantOS.Api.Requests;
using PlantOS.Api.Responses;
using PlantOS.Core.Services;

namespace PlantOS.Api.Controllers;

/// <summary>
/// Handles HTTP requests related to Plant entities.
/// 
/// This controller is responsible for translating HTTP requests into application operations and
/// returning appropriate HTTP responses. It should handle request binding, basic input validation,
/// and delegation of work to the Plant service.
/// 
/// Exception handling is managed centrally by ExceptionHandlingMiddleware and should not be implemented
/// directly within controller actions.
/// 
/// Business logic and data access concerns should remain outside of this class.
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class PlantsController : ControllerBase
{
    private readonly PlantService _service;


    public PlantsController(PlantService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> GetPlants()
    {
        var plants = await _service.GetAllPlantsAsync();

        var response = plants.Select(p => new PlantResponse
        {
            Id = p.Id,
            Name = p.Name,
            Species = p.Species
        });

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlantById(Guid id)
    {
        var plant = await _service.GetPlantByIdAsync(id);
        return Ok(new PlantResponse
        {
            Id = plant.Id,
            Name = plant.Name,
            Species = plant.Species,
        });
    }

    [HttpGet("{id}/events")]
    public async Task<IActionResult> GetPlantWithEvents(Guid id)
    {
        var plant = await _service.GetPlantWithEventsAsync(id);

        return Ok(new PlantDetailedResponse
        {
            Id = plant.Id,
            Name = plant.Name,
            Species = plant.Species,
            Events = plant.Events.Select(e => new PlantEventResponse
            {
                Id = e.Id,
                EventType = e.EventType,
                Date = e.Date,
                Notes = e.Notes
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> AddPlant([FromBody] Core.Entities.Plant plant)
    {
        if (plant == null)
        {
            return BadRequest("Plant cannot be null.");
        }

        await _service.AddPlantAsync(plant);
        var response = new PlantResponse
        {
            Id = plant.Id,
            Name = plant.Name,
            Species = plant.Species
        };

        return CreatedAtAction(nameof(GetPlantById), new { id = plant.Id }, response);
    }

    [HttpPut("{id}/name")]
    public async Task<IActionResult> UpdatePlantName(Guid id, [FromBody] UpdatePlantNameRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.UpdatePlantNameAsync(id, request.Name);
        return NoContent();
    }

    [HttpPut("{id}/species")]
    public async Task<IActionResult> UpdatePlantSpecies(Guid id, [FromBody] UpdatePlantSpeciesRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.UpdatePlantSpeciesAsync(id, request.Species);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlant(Guid id)
    {
        await _service.DeletePlantAsync(id);
        return NoContent();
    }
}