using PlantOS.Core.Entities;

namespace PlantOS.Api.Responses;

public class PlantEventResponse
{
    public Guid Id { get; set; }

    public PlantEventType EventType { get; set; }

    public DateTime Date { get; set; }

    public string? Notes { get; set; }
}
