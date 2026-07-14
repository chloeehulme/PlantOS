using Microsoft.AspNetCore.Mvc;
using PlantOS.Api.Requests;
using PlantOS.Core.Services;

namespace PlantOS.Api.Controllers;

/// <summary>
/// 
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

    // [HttpGet("{id}")]
    // public async Task<IActionResult> GetPlantById(Guid id)
    // {
    //     var plant = await _service.GetPlantByIdAsync(id);
    //     return Ok(plant);
    // }

    [HttpGet("{plantId}")]
    public async Task<IActionResult> GetPlantEvents(Guid plantId)
    {
        var plantEvents = await _service.GetPlantEventsAsync(plantId);

        return Ok(plantEvents);

        
    }

    [HttpPost("{plantId}/water")]
    public async Task<IActionResult> WaterPlant(Guid plantId, [FromBody] WaterPlantRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await _service.WaterPlantAsync(plantId, request.WateredAt ?? DateTime.UtcNow, request.Notes);
        return Ok();
    }
}
