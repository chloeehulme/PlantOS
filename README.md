# PlantOS

## Purpose

PlantOS is a personal plant care tracker built as a practical way to keep better track of plants and plant-care events. The project is also a hands-on way to continue learning and improving with C# and ASP.NET Core while growing the application over time.

## Project Structure

The solution is organised into a small layered architecture:

- PlantOS.API: ASP.NET Core Web API entry point and controller layer
- PlantOS.Core: domain entities, services, interfaces, and business logic
- PlantOS.Infrastructure: Entity Framework Core data access, repositories, and persistence concerns
- PlantOS.Tests: unit tests for services and repository behaviour

The solution file at the root, PlantOS.slnx, brings these projects together.

## Branching Strategy

The project uses a simple Git flow-style approach:

- main is the stable branch for completed work
- feature branches are used for isolated changes or new capabilities
- work should be merged back into main once it is tested and reviewed

This keeps development focused and makes it easier to experiment without disrupting the main line of progress.

## Project Direction

PlantOS is currently being shaped as a solid foundation for a useful plant-care tool. The near-term focus is on reliability, structure, and maintainability, with longer-term goals including richer care workflows, reminders, automation, and eventually broader gardening or nature-focused features.
