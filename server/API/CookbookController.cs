using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Infra;
using LinqToDB;
using Microsoft.AspNetCore.Mvc;

[ApiController]
public class CookbookController(CookbookService service, MyDatabaseConnection db) : ControllerBase
{
    [HttpGet(nameof(GetRecipes))]
    public List<Dictionary<string, object>> GetRecipes(int page, int resultsPerPage)
    {
        if (page <= 0)
            throw new ValidationException("page must be positive");
        if (resultsPerPage > 50)
            throw new ValidationException("max 50 per page");
        return service.GetRecipes(page, resultsPerPage);
    }

    [HttpPost(nameof(CreateRecipe))]
    public RecipeDto CreateRecipe(CreateRecipeRequestDto dto)
    {
        if (dto.CookingMinutes > 24 * 60)
            throw new ValidationException("Max cooking time is 24 hours");
        return service.CreateRecipe(dto);
    }

    [HttpGet(nameof(GetChefs))]
    public IActionResult GetChefs()
    {
        var chefs = db.Chefs.OrderBy(c => c.ChefName).ToList();
        return Ok(chefs.Select(c => new { chefId = c.ChefId, chefName = c.ChefName }));
    }

    [HttpPost(nameof(CreateChef))]
    public IActionResult CreateChef([FromBody] JsonElement body)
    {
        string name;
        try
        {
            name = body.GetProperty("chefName").GetString();
        }
        catch
        {
            return BadRequest(new { title = "Chef name is required" });
        }

        if (name == null || name.Trim() == "")
            return BadRequest(new { title = "Chef name is required" });
        name = name.Trim();
        if (name.Length > 60)
            return BadRequest(new { title = "Chef name is too long" });

        var id = Utils.NewId();
        db.Insert(new Chef { ChefId = id, ChefName = name });
        return Ok(new { chefId = id, chefName = name });
    }
}
