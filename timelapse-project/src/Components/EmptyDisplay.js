import { React, useState } from "react";

const EmptyDisplay = (props) => {

    const [value, setValue] = useState("");

    const submit = (e) => {
        e.preventDefault();
        setValue("");
        props.onSubmit(value);
    }

    return <div className="emptyDisplay">
        {
            props.loading ? (
                <div className="loader"></div>
            ) : (
                <form onSubmit={submit}>
                    <label>Input Dataset Directory: </label>
                    <input className={props.error ? "error" : "dataInput"}
                        type={"text"}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    {props.error && <div className="loadErrMsg">Error loading dataset, please try again.</div>}
                </form>
            )
        }
    </div>
}

export default EmptyDisplay;