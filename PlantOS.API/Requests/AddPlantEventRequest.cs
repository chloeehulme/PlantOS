namespace PlantOS.Api.Requests;

public class AddPlantEventRequest
{
    /// <summary>
    /// Optional date and time the plant event occurred.
    /// If omitted, the current UTC time will be used.
    /// </summary>
    public DateTime? OccuredAt { get; set; }

    /// <summary>
    /// Optional notes about the plant event.
    /// </summary>
    public string? Notes { get; set; }
}
