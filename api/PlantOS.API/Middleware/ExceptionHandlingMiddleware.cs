using PlantOS.Core.Exceptions;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;


    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }


    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (PlantNotFoundException ex)
        {
            context.Response.StatusCode = 404;

            await context.Response.WriteAsJsonAsync(new
            {
                error = ex.Message
            });
        }
        catch (PlantCannotBeNullException ex)
        {
            context.Response.StatusCode = 400;

            await context.Response.WriteAsJsonAsync(new
            {
                error = ex.Message
            });
        }
        catch (PlantEventNotFoundException ex)
        {
            context.Response.StatusCode = 404;

            await context.Response.WriteAsJsonAsync(new
            {
                error = ex.Message
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;

            await context.Response.WriteAsJsonAsync(new
            {
                error = "An unexpected error occurred: " + ex.Message
            });
        }
    }
}
