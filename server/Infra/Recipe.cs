using LinqToDB.Mapping;

namespace Infra;

public class Recipe
{
    [PrimaryKey] public string RecipeId { get; set; } 
    public string RecipeName { get; set; } 
    public long CookingMinutes { get; set; }
    public string ChefId { get; set; }
    // Starter, MainCourse, Dessert or Drink
    public string Course { get; set; }
    [Association(ThisKey = nameof(ChefId), OtherKey = nameof(Chef.ChefId))]
    public Chef Chef { get; set; }
}

public class Chef
{
    [PrimaryKey]public string ChefId { get; set; }
    public string ChefName { get; set; }
    [Association(ThisKey = nameof(ChefId), OtherKey = nameof(Recipe.ChefId))]
    public List<Recipe> RecipesByChef { get; set; }
}
