namespace PlantOS.Core.Exceptions;

public class PlantNotFoundException : Exception
{
    public PlantNotFoundException(Guid id)
        : base($"Plant with id {id} was not found.")
    {
    }
}