import { useEffect, useState } from "react";
import { API, request } from "../utils";

export default function ChefSelect(props: any) {
    const [chefs, setChefs] = useState<any>([]);

    function load() {
        request("GET", API + "GetChefs", null, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            (window as any).chefs = data;
            setChefs(data);
        });
    }

    useEffect(() => {
        load();
        window.addEventListener("chefsChanged", load);
    }, []);

    return (
        <select value={props.value} onChange={e => props.onChange(e.target.value)}>
            {chefs.map((c: any) => <option key={c.chefId} value={c.chefId}>{c.chefName}</option>)}
        </select>
    );
}
