using Microsoft.EntityFrameworkCore;
using PlantOS.Core.Interfaces;
using PlantOS.Core.Services;
using PlantOS.Infrastructure.Data;
using PlantOS.Infrastructure.Repositories;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddScoped<IPlantRepository, EfPlantRepository>();

builder.Services.AddScoped<PlantService>();

builder.Services.AddControllers();

builder.Services.AddDbContext<PlantOSDbContext>(options =>
{
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.MapControllers();

app.Run();