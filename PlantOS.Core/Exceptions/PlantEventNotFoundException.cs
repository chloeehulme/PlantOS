namespace PlantOS.Core.Exceptions;

public class PlantEventNotFoundException : Exception
{
    public PlantEventNotFoundException(Guid id)
        : base($"Plant event with id {id} was not found.")
    {
    }
}