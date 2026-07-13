using System.ComponentModel.DataAnnotations;

namespace PlantOS.Api.Requests;

public class UpdatePlantNameRequest
{
    [Required]
    public string Name { get; set; } = null!;
}
