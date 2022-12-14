import { React, useState } from 'react';
import Sketch from 'react-p5';

import Timestamp from './Timestamp';
import ThumbnailBar from './ThumbnailBar';
import ImageWindow from './ImageWindow';

const TimelapseDisplay = (props) => {

    const [frames, setFrames] = useState([]);

    const preload = (p5) => {
        p5.loadStrings(
            "./test_img/" + props.timelapseFolder + "/test_summer-day-frames.txt",
            (results) => setFrames(results),
            (err) => console.log("Error: " + err)
        )
    };

    /* TODO: Remove dependency on react-p5 'Sketch' here. Load images another way. */
    return (
        <>
            <Sketch setup={() => { }} preload={preload} />
            <Timestamp></Timestamp>
            <ImageWindow images={frames}></ImageWindow>
            <ThumbnailBar></ThumbnailBar>
        </>
    );
}

export default TimelapseDisplay;