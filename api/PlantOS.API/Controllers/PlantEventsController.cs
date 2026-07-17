using Microsoft.AspNetCore.Mvc;
using PlantOS.Api.Requests;
using PlantOS.Api.Responses;
using PlantOS.Core.Entities;
using PlantOS.Core.Services;

namespace PlantOS.Api.Controllers;

/// <summary>
/// Handles HTTP requests related to PlantEvent entities.
/// 
/// This controller is responsible for translating HTTP requests into application operations and
/// returning appropriate HTTP responses. It should handle request binding, basic input validation,
/// and delegation of work to the PlantEvent service.
/// 
/// Exception handling is managed centrally by ExceptionHandlingMiddleware and should not be implemented
/// directly within controller actions.
/// 
/// Business logic and data access concerns should remain outside of this class.
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class PlantEventsController : ControllerBase
{
    private readonly PlantEventService _service;


    public PlantEventsController(PlantEventService service)
    {
        _service = service;
    }

    [HttpGet("{plantId}/events")]
    public async Task<IActionResult> GetPlantEvents(Guid plantId)
    {
        var plantEvents = await _service.GetPlantEventsAsync(plantId);

        var response = plantEvents.Select(e => new PlantEventResponse
        {
            Id = e.Id,
            EventType = e.EventType,
            Date = e.Date,
            Notes = e.Notes
        });

        return Ok(response);
    }

    [HttpPut("{plantId}/events/{id}")]
    public async Task<IActionResult> UpdatePlantEvent(Guid plantId, Guid id, [FromBody] UpdatePlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.UpdatePlantEventAsync(plantId, id, request.EventType, request.Date, request.Notes);
        return NoContent();
    }

    [HttpDelete("{plantId}/events/{id}")]
    public async Task<IActionResult> DeletePlantEvent(Guid plantId, Guid id)
    {
        await _service.DeletePlantEventAsync(plantId, id);
        return NoContent();
    }

    [HttpPost("{plantId}/water")]
    public async Task<IActionResult> WaterPlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.WaterPlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }

    [HttpPost("{plantId}/fertilise")]
    public async Task<IActionResult> FertilisePlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.FertilisePlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }

    [HttpPost("{plantId}/repot")]
    public async Task<IActionResult> RepotPlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.RepotPlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }

    [HttpPost("{plantId}/prune")]
    public async Task<IActionResult> PrunePlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.PrunePlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }

    [HttpPost("{plantId}/bloom")]
    public async Task<IActionResult> BloomPlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.BloomPlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }

    [HttpPost("{plantId}/new-leaf")]
    public async Task<IActionResult> NewLeafPlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.NewLeafPlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }

    [HttpPost("{plantId}/pest-detection")]
    public async Task<IActionResult> PestDetectionPlant(Guid plantId, [FromBody] AddPlantEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.PestDetectionPlantAsync(plantId, request.OccuredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }
}
