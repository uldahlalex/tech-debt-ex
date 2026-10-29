using Facet;
using Infra;

[Facet(sourceType:typeof(Chef), exclude:nameof(Chef.RecipesByChef))]
public partial class ChefDto;

[Facet(sourceType: typeof(Recipe), exclude: nameof(Recipe.Chef))]
public partial class RecipeDto
{
    public ChefDto Chef { get; set; }
}
