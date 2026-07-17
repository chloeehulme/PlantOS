using PlantOS.Api.Responses;

namespace PlantOS.Api.Responses;

public class PlantDetailedResponse : PlantResponse
{
    public IEnumerable<PlantEventResponse> Events { get; set; } = [];
}
