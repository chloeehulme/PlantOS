namespace PlantOS.Api.Requests;

public class WaterPlantRequest
{
    /// <summary>
    /// Optional date and time the watering occurred.
    /// If omitted, the current UTC time will be used.
    /// </summary>
    public DateTime? WateredAt { get; set; }

    /// <summary>
    /// Optional notes about the watering event.
    /// </summary>
    public string? Notes { get; set; }
}