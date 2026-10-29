import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import {Api} from "../Api.ts";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";
import { courseName } from "./utils";
import { store } from "./store";
import RecipeList from "./components/RecipeList";
import Pager from "./components/Pager";
import RecipeForm from "./components/RecipeForm";
import ChefForm from "./components/ChefForm";

const MyApi = new Api();
export const BASE_URL = "http://localhost:5150";

export function App() {

    const [recipes, setRecipes] = useState<any[]>([])
    const [page, setPage] = useState(store.page)
    const [hasNext, setHasNext] = useState(false)
    const [loading, setLoading] = useState(false)
    const [chefId, setChefId] = useState("1")

    useEffect(() => {
        setLoading(true)
        MyApi.getRecipes.cookbookGetRecipes({page: page,
        resultsPerPage: 5}).then(r => {
            setRecipes(r.data);
            store.recipes = r.data;
            setLoading(false)
        }).catch(() => toast("Could not load recipes"))
    }, [page]);

    useEffect(() => {
        setHasNext(recipes.length >= 5)
    }, [recipes]);

    function onCreated(recipe: any) {
        const duplicate = [...recipes, recipe];
        setRecipes(duplicate);
        toast.success("Created " + recipe.recipeName + " (" + courseName(recipe.course) + ")")
    }

    return (
    <main className="app">
        <h1>Cookbook</h1>
        {loading ? <p>Loading...</p> : null}
        <RecipeList recipes={recipes} />
        <Pager page={page} hasNext={hasNext} onChange={setPage} />
        <RecipeForm chefId={chefId} setChefId={setChefId} onCreated={onCreated} />
        <ChefForm />
    </main>
  );
}

export default App;
