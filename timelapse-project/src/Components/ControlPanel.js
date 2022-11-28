import { React, useState } from "react";

const ControlPanel = (props) => {
    const [capacity, setCapacity] = useState(props.capacity);
    const [distance, setDistance] = useState(props.distance);
    const [mode, setMode] = useState(props.mode);

    const submitControlValues = (e) => {
        props.onSubmit(capacity, distance, mode);
        e.preventDefault();
    }

    return (
        <form onSubmit={submitControlValues}>
            <div className="controller">
                <h2>Controls</h2>
                <div className="slideDiv">
                    <p className="slideText">Number of images to load:</p>
                    <input
                        type="range"
                        onChange={e => setCapacity(e.target.value)}
                        min={10}
                        max={200}
                        step={1}
                        value={capacity}
                    />
                    <p className="slideVal">{capacity}</p>
                </div>
                <div className="slideDiv">
                    <p className="slideText">Time between images in minutes:</p>
                    <input
                        type="range"
                        onChange={e => setDistance(e.target.value)}
                        min={1}
                        max={10}
                        step={1}
                        value={distance}
                    />
                    <p className="slideVal">{distance}</p>
                </div>
                <div>
                    <p>Select the load method:</p>
                    <select value={mode} onChange={e => setMode(e.target.value)}>
                        <option>fill</option>
                        <option>linear</option>
                    </select>
                </div>
                <button type="submit">Submit</button>
            </div>
        </form>

    )
}

export default ControlPanel;