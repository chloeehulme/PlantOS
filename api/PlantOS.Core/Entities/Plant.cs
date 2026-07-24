namespace PlantOS.Core.Entities;

public class Plant
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Species { get; private set; } = null!;
    public int TileX { get; private set; }
    public int TileY { get; private set; }

    public ICollection<PlantEvent> Events { get; private set; } = [];

    public Plant(Guid id, string name, string species, int tileX, int tileY)
    {
        if (tileX < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(tileX), "TileX cannot be negative.");
        }

        if (tileY < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(tileY), "TileY cannot be negative.");
        }

        Id = id;
        Name = name;
        Species = species;
        TileX = tileX;
        TileY = tileY;
    }

    // Convenience constructor for creating a brand new plant: the caller
    // shouldn't need to know or care about Guid generation, so the Id is
    // generated here rather than being supplied by an API client.
    public Plant(string name, string species, int tileX, int tileY)
        : this(Guid.NewGuid(), name, species, tileX, tileY)
    {
    }

    private Plant()
    {
    }

    public void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name cannot be null or whitespace.", nameof(name));
        }

        Name = name;
    }

    public void SetSpecies(string species)
    {
        if (string.IsNullOrWhiteSpace(species))
        {
            throw new ArgumentException("Species cannot be null or whitespace.", nameof(species));
        }

        Species = species;
    }

    public void SetTileX(int tileX)
    {
        if (tileX < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(tileX), "TileX cannot be negative.");
        }

        TileX = tileX;
    }

    public void SetTileY(int tileY)
    {
        if (tileY < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(tileY), "TileY cannot be negative.");
        }

        TileY = tileY;
    }
}
