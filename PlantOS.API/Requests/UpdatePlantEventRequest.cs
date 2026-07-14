using PlantOS.Core.Entities;

namespace PlantOS.Api.Requests;

public class UpdatePlantEventRequest
{
    public PlantEventType? EventType { get; set; }

    public DateTime? Date { get; set; }

    public string? Notes { get; set; }
}