using System.ComponentModel.DataAnnotations;
using PlantOS.Api.Requests;
using Xunit;

namespace PlantOS.Tests.Requests;

public class AddPlantEventRequestTests
{
    [Fact]
    public void Validate_RejectsOccuredAtMoreThanOneMinuteInTheFuture()
    {
        var request = new AddPlantEventRequest { OccuredAt = DateTime.UtcNow.AddMinutes(2) };

        var validationResults = Validate(request);

        var error = Assert.Single(validationResults);
        Assert.Equal("OccuredAt cannot be in the future.", error.ErrorMessage);
        Assert.Contains(nameof(AddPlantEventRequest.OccuredAt), error.MemberNames);
    }

    [Fact]
    public void Validate_AllowsOccuredAtWithinTheOneMinuteClockSkewTolerance()
    {
        var request = new AddPlantEventRequest { OccuredAt = DateTime.UtcNow.AddSeconds(30) };

        Assert.Empty(Validate(request));
    }

    [Fact]
    public void Validate_AllowsOccuredAtInThePast()
    {
        var request = new AddPlantEventRequest { OccuredAt = DateTime.UtcNow.AddDays(-1) };

        Assert.Empty(Validate(request));
    }

    [Fact]
    public void Validate_AllowsMissingOccuredAt()
    {
        var request = new AddPlantEventRequest();

        Assert.Empty(Validate(request));
    }

    private static List<ValidationResult> Validate(AddPlantEventRequest request)
    {
        var validationResults = new List<ValidationResult>();
        Validator.TryValidateObject(request, new ValidationContext(request), validationResults, validateAllProperties: true);
        return validationResults;
    }
}
