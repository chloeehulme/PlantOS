namespace PlantOS.Core.Entities;

public class Plant
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Species { get; private set; } = null!;

    public ICollection<PlantEvent> Events { get; private set; } = [];

    public Plant(Guid id, string name, string species)
    {
        Id = id;
        Name = name;
        Species = species;
    }

    // Convenience constructor for creating a brand new plant: the caller
    // shouldn't need to know or care about Guid generation, so the Id is
    // generated here rather than being supplied by an API client.
    public Plant(string name, string species)
        : this(Guid.NewGuid(), name, species)
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
}
