namespace PlantOS.Core.Exceptions;

public class PlantCannotBeNullException : Exception
{
    public PlantCannotBeNullException()
        : base("Plant cannot be null.")
    {
    }
}