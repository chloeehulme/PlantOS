namespace PlantOS.Core.Entities;

public class Plant
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Species { get; private set; }

    public Plant(Guid id, string name, string species)
    {
        Id = id;
        Name = name;
        Species = species;
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
