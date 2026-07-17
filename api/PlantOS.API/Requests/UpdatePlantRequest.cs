using System.ComponentModel.DataAnnotations;

namespace PlantOS.Api.Requests;

public class UpdatePlantRequest
{
    public string? Name { get; set; }

    public string? Species { get; set; }
}
