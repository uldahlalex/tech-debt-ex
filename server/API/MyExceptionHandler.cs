using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public class MyExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext,
        Exception exception, CancellationToken cancellationToken)
    {
        if (exception.GetType().Name == "ValidationException" || exception.Message.Contains("does not exist"))
            httpContext.Response.StatusCode = 400;
        else
            httpContext.Response.StatusCode = 500;

        await httpContext.Response.WriteAsJsonAsync(
            new ProblemDetails()
            {
                Title = exception.Message,
                Detail = exception.StackTrace
            });
        return true;
    }
}
