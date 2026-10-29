import { useRef, useState } from "react";
import { BASE_URL } from "../App";
import { validateName } from "../utils";
import ChefSelect from "./ChefSelect";

export default function RecipeForm(props: any) {
    const [name, setName] = useState("");
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState<any>(null);
    const courseRef = useRef<any>(null);

    async function submit(e: any) {
        e.preventDefault();
        setError(null);
        const msg = validateName(name);
        if (msg) {
            setError(msg);
            return;
        }
        if (!(window as any).chefs?.find((c: any) => c.chefId == props.chefId)) {
            alert("Please pick a chef");
            return;
        }
        const minutes = (document.getElementById("minutes") as HTMLInputElement).value;

        setStatus("saving");
        try {
            const r = await fetch(BASE_URL + "/CreateRecipe", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    RecipeName: name,
                    ChefId: props.chefId,
                    CookingMinutes: parseInt(minutes),
                    Course: courseRef.current.value
                })
            });
            const data = await r.json();
            if (!r.ok) throw data;
            setName("");
            props.onCreated(data);
        } catch (err: any) {
            setError(err.title ?? err.message);
        }
        setStatus("idle");
    }

    return (
        <form aria-label="Create recipe" onSubmit={submit}>
            <label>
                Name
                <input value={name} maxLength={120} onChange={e => setName(e.target.value)} />
            </label>
            <label>
                Minutes
                <input id="minutes" type="number" defaultValue={30} />
            </label>
            <label>
                Chef
                <ChefSelect value={props.chefId} onChange={props.setChefId} />
            </label>
            <label>
                Course
                <select ref={courseRef} defaultValue="MainCourse">
                    <option value="Starter">Starter</option>
                    <option value="MainCourse">Main course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Drink">Drink</option>
                </select>
            </label>
            <button type="submit" disabled={status == "saving"}>Create recipe</button>
            {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
        </form>
    );
}
