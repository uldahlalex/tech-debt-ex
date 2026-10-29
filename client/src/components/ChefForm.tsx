import { useState } from "react";
import toast from "react-hot-toast";
import { API, request } from "../utils";

export default function ChefForm() {
    const [chefName, setChefName] = useState("");
    const [busy, setBusy] = useState(0);

    function submit(e: any) {
        e.preventDefault();
        setBusy(1);
        request("POST", API + "CreateChef", { chefName: chefName }, (err, data) => {
            setBusy(0);
            if (err) {
                alert(err.title || err);
                return;
            }
            setChefName("");
            toast.success("Chef " + data.chefName + " created!");
            // give the server a moment before reloading the chef list
            setTimeout(() => window.dispatchEvent(new Event("chefsChanged")), 100);
        });
    }

    return (
        <form aria-label="Create chef" onSubmit={submit}>
            <label>
                Chef name
                <input value={chefName} onChange={e => setChefName(e.target.value)} />
            </label>
            <button type="submit" disabled={busy == 1}>Create chef</button>
        </form>
    );
}
