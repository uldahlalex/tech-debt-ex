using System.ComponentModel.DataAnnotations;
using Infra;
using LinqToDB;
using LinqToDB.DataProvider.SQLite;

public class CookbookService(MyDatabaseConnection db)
{

    public List<Dictionary<string, object>> GetRecipes(int page, int resultsPerPage)
    {
        if (page < 1)
            throw new ValidationException("Page must be 1 or higher");
        if (resultsPerPage < 1)
            throw new ValidationException("Must have 1 or more result per page");
        if (resultsPerPage > 50)
            throw new ValidationException("Too many results per page");

        var recipes = db.Recipes
            .LoadWith(r => r.Chef)
            .OrderBy(r => r.RecipeName)
            .ThenBy(r => r.RecipeId)
            .Skip((page - 1) * resultsPerPage)
            .Take(resultsPerPage)
            .ToList();

        var result = new List<Dictionary<string, object>>();
        foreach (var r in recipes)
        {
            result.Add(Utils.RecipeToDict(r));
        }
        return result;
    }

    //public List<RecipeDto> GetRecipesOld(int page, int resultsPerPage)
    //{
    //    return db.Recipes
    //        .LoadWith(r => r.Chef)
    //        .ThenLoad(c => c.RecipesByChef)
    //        .Take(resultsPerPage)
    //        .Skip((page - 1) * resultsPerPage)
    //        .Select(r => new RecipeDto(r)
    //    {
    //        Chef = new ChefDto(r.Chef)
    //    })
    //        .ToList();
    //}

    public RecipeDto CreateRecipe(CreateRecipeRequestDto dto)
    {
        if (dto.RecipeName == null || dto.RecipeName.Trim() == "")
        {
            throw new ValidationException("Name is required");
        }
        if (dto.RecipeName.Trim().Length > 100)
        {
            throw new ValidationException("Name must be at most 100 characters");
        }
        if (dto.CookingMinutes<1)
        {
            throw new ValidationException("Cooking time must be 1 minute or more");
        }
        if (dto.CookingMinutes > 1440)
        {
            throw new ValidationException("A recipe can't take more than a day");
        }
        if (dto.Course != "Starter" && dto.Course != "MainCourse" && dto.Course != "Dessert" && dto.Course != "Drink")
        {
            throw new ValidationException("Unknown course: " + dto.Course);
        }

        var chef = db.Chefs.FirstOrDefault(c => c.ChefId == dto.ChefId);
        if (chef == null)
        {
            throw new Exception("Chef does not exist");
        }
        
        var r = new Recipe()
        {
            CookingMinutes = dto.CookingMinutes,
            RecipeName = dto.RecipeName.Trim(),
            RecipeId = Guid.NewGuid().ToString(),
            ChefId = dto.ChefId,
            Course = dto.Course
        };
        db.Insert(r);
        var result = new RecipeDto(r);
        result.Chef = new ChefDto(chef);
        return result;
    }
}
