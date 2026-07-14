namespace PlantOS.Core.Entities;

public class PlantEvent
{
    public Guid Id { get; private set; }

    // Foreign Key
    public Guid PlantId { get; private set; }

    // Navigation property
    public Plant Plant { get; private set; } = null!;

    public PlantEventType EventType { get; private set; }

    public DateTime Date { get; private set; }

    public string? Notes { get; private set; }

    public PlantEvent(Guid id, Guid plantId, PlantEventType eventType, DateTime dateTime, string? notes)
    {
        Id = id;
        PlantId = plantId;
        EventType = eventType;
        Date = dateTime;
        Notes = notes;
    }

    private PlantEvent()
    {
    }
}

