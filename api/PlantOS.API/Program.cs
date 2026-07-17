using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Interfaces;
using PlantOS.Core.Services;
using PlantOS.Infrastructure.Data;
using PlantOS.Infrastructure.Repositories;


var builder = WebApplication.CreateBuilder(args);

// Allows the local Vite dev server (ui/) to call this API from the browser.
// Wide open on purpose - this is a local POC, not a deployed service.
const string DevCorsPolicy = "DevCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddScoped<IPlantRepository, EfPlantRepository>();
builder.Services.AddScoped<IPlantEventRepository, EfPlantEventRepository>();

builder.Services.AddScoped<PlantService>();
builder.Services.AddScoped<PlantEventService>();

builder.Services.AddControllers();

builder.Services.AddDbContext<PlantOSDbContext>(options =>
{
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

app.UseCors(DevCorsPolicy);
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.MapControllers();

app.Run();
