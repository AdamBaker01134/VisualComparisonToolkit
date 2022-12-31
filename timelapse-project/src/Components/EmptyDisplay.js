import { React, useState } from "react";

const EmptyDisplay = (props) => {

    const [value, setValue] = useState("");

    const submit = (e) => {
        e.preventDefault();
        props.onSubmit(value);
    }

    return <form onSubmit={submit}>
        <label>Type Something</label>
        <input type={"text"} onChange={(e) => setValue(e.target.value)} />
    </form>
}

export default EmptyDisplay;