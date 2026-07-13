using System.ComponentModel.DataAnnotations;

namespace PlantOS.Api.Requests;

public class UpdatePlantSpeciesRequest
{
    [Required]
    public string Species { get; set; } = null!;
}
