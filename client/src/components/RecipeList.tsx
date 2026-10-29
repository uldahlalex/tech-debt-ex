export default function RecipeList(props: any) {
    return (
        <ul aria-label="Recipes">
            {props.recipes.map((r: any, i: number) => {
                let label;
                switch (r.course) {
                    case "Starter":
                        label = "Starter";
                        break;
                    case "MainCourse":
                        label = "Main course";
                        break;
                    case "Dessert":
                        label = "Dessert";
                        break;
                    default:
                        label = r.course;
                }
                return <li key={i}>{r.recipeName} by {r.chef.chefName} · {r.cookingMinutes} min · {label}</li>
            })}
        </ul>
    );
}
