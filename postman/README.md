# Postman setup for PlantOS

1. Start the API locally:
   - dotnet run --project PlantOS.API/PlantOS.API.csproj
2. In Postman, import the collection file and environment file from this folder.
3. Select the PlantOS Local environment.
4. Run the collection in order.

The collection:

- creates a plant and stores the generated plant id in variables,
- exercises the happy path for each plant endpoint,
- creates event records and stores generated event ids for follow-up requests,
- includes automated tests for the expected success responses.
