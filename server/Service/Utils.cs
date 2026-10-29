using Infra;

public static class Utils
{
    public static string[] Courses = new[] { "Starter", "MainCourse", "Dessert", "Drink" };

    public static bool IsValidName(string n)
    {
        return n != null && n.Trim().Length > 0 && n.Trim().Length <= Constants.MAX_NAME;
    }

    public static Dictionary<string, object> RecipeToDict(Recipe r)
    {
        var d = new Dictionary<string, object>();
        d["recipeId"] = r.RecipeId;
        d["recipeName"] = r.RecipeName;
        d["cookingMinutes"] = r.CookingMinutes;
        d["course"] = r.Course;
        d["chefId"] = r.ChefId;
        d["chef"] = new Dictionary<string, object>
        {
            { "chefId", r.Chef.ChefId },
            { "chefName", r.Chef.ChefName }
        };
        return d;
    }

    public static string NewId()
    {
        return DateTime.Now.Ticks.ToString();
    }
}
