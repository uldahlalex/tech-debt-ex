using Infra;
using LinqToDB;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Cookbook") ?? "Data Source=" + Constants.DB_PATH;
var options = new DataOptions<MyDatabaseConnection>(
    new DataOptions().UseSQLite(connectionString));

builder.Services.AddScoped<MyDatabaseConnection>(_ => 
    new MyDatabaseConnection(options));

builder.Services.AddScoped<CookbookService>();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument();
builder.Services.AddCors();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<MyExceptionHandler>();


var app = builder.Build();

Console.WriteLine("Using database " + Constants.DB_PATH);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MyDatabaseConnection>();
    db.CreateTable<Recipe>(tableOptions:TableOptions.CreateIfNotExists);
    db.CreateTable<Chef>(tableOptions:TableOptions.CreateIfNotExists);
    if (db.Chefs.Count() == 0)
    {
        db.Insert(new Chef()
        {
            ChefId = "1",
            ChefName = "alice"
            
        });
    }
    if (db.Recipes.Count() == 0)
    {
           db.Insert(new Recipe()
            {
                RecipeId = "1",
                RecipeName = "pancakes",
                CookingMinutes = 20,
                ChefId = "1",
                Course = "Dessert"
            });
    }
   
}

app.UseExceptionHandler();
app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_ => true));
app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();
app.Run();
