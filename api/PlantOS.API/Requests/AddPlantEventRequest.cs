using System.ComponentModel.DataAnnotations;

namespace PlantOS.Api.Requests;

public class AddPlantEventRequest : IValidatableObject
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

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Small tolerance for clock skew between client and server.
        if (OccuredAt.HasValue && OccuredAt.Value.ToUniversalTime() > DateTime.UtcNow.AddMinutes(1))
        {
            yield return new ValidationResult("OccuredAt cannot be in the future.", new[] { nameof(OccuredAt) });
        }
    }
}
