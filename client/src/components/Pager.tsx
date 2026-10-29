import { store } from "../store";

export default function Pager(props: any) {
    return (
        <nav className="pagination">
            <button disabled={store.page == 1} onClick={() => { store.page--; props.onChange(store.page) }}>Previous</button>
            <span>Page {props.page}</span>
            <button disabled={!props.hasNext} onClick={() => { store.page++; props.onChange(store.page) }}>Next</button>
        </nav>
    );
}
