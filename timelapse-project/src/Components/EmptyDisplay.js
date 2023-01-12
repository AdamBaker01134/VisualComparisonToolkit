import { React, useState } from "react";

const EmptyDisplay = (props) => {

    const [value, setValue] = useState("");
    const [hasError, setHasError] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setValue("");
        setHasError(false);
        props.onSubmit(value);
    }

    return <div className="emptyDisplay">
        {
            props.loading ? (
                <div className="loader"></div>
            ) : (
                <form onSubmit={submit}>
                    <label>Input Dataset Directory: </label>
                    <input className={hasError ? "error" : "dataInput"}
                        type={"text"}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </form>
            )
        }
    </div>
}

export default EmptyDisplay;