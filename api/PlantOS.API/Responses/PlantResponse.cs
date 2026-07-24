namespace PlantOS.Api.Responses;

public class PlantResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Species { get; set; } = null!;

    public int TileX { get; set; }

    public int TileY { get; set; }
}
