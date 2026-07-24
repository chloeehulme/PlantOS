using System.ComponentModel.DataAnnotations;

namespace PlantOS.Api.Requests;

public class UpdatePlantRequest
{
    public string? Name { get; set; }

    public string? Species { get; set; }

    [Range(0, int.MaxValue)]
    public int? TileX { get; set; }

    [Range(0, int.MaxValue)]
    public int? TileY { get; set; }
}
