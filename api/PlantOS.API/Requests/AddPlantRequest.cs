using System.ComponentModel.DataAnnotations;

namespace PlantOS.Api.Requests;

// Used by POST /api/plants. Deliberately excludes Id - the server generates
// a new Guid for every plant (see Plant's (name, species) constructor) so
// clients never need to invent one.
public class AddPlantRequest
{
    [Required]
    public string Name { get; set; } = null!;

    [Required]
    public string Species { get; set; } = null!;

    [Range(0, int.MaxValue)]
    public int TileX { get; set; }

    [Range(0, int.MaxValue)]
    public int TileY { get; set; }
}
