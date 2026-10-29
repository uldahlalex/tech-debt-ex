using Facet;
using Infra;

[Facet(sourceType:typeof(Recipe), exclude: [nameof(Recipe.Chef), nameof(Recipe.RecipeId)]) ]
public partial class CreateRecipeRequestDto;
