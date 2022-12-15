import { React, useState, useEffect } from 'react';
import p5 from 'p5';

import Timestamp from './Timestamp';
import ImageWindow from './ImageWindow';
import ImageLoader from './ImageLoader';

const _p5 = new p5();

/**
 * Constructs a loading order as an array of indexes
 * @param {String} loadType "fill" or "linear"
 * @param {int} capacity total frames that need to be loaded 
 * @returns an array of indexes, in the order that we want to load the frames
 */
const constructLoadOrder = (loadType="linear", capacity) => {
    let loadOrder = [];
    switch (loadType) {
        case "fill":
            let orderPlaced = Array(capacity).fill(false);
            const assignToLoadOrder = (idx) => {
                loadOrder.push(idx);
                orderPlaced[idx] = true;
            }

            assignToLoadOrder(0);                           // First
            assignToLoadOrder(Math.floor(capacity / 2));    // Middle
            assignToLoadOrder(capacity - 1);                // Last

            // log(n) times through whole array, which is size n,
            // so this selection algorithm is O(n*log(n)).
            let start = 0;
            let end = 1;
            for (let i = 3; i < capacity; i++) {
                if (start >= capacity - 1) start = 0;

                end = start + 1;

                // Calculate start index by finding the next unplaced spot
                while (orderPlaced[end]) {
                    start = end;
                    end++;
                    if (end >= capacity) {
                        start = 0;
                        end = 1;
                    }
                }

                // Calculate end index by finding the next placed spot after start
                while (!orderPlaced[end]) end++;

                assignToLoadOrder(Math.ceil((start + end) / 2));
                start = end;
            }
            break;
        case "linear":
        default:
            for (let i = 0; i < capacity; i++) loadOrder.push(i);
            break;
    }

    return loadOrder;
}

const TimelapseDisplay = (props) => {

    const [frames, setFrames] = useState([]);
    const [loadOrder, setLoadOrder] = useState([]);
    const [loadedImages, setLoadedImages] = useState([]);

    useEffect(() => {
        if (frames.length > 0) {
            setLoadOrder(constructLoadOrder(props.loadType, frames.length));
        }
    }, [props.loadType, frames]);

    useEffect(() => {
        _p5.loadStrings(
            props.timelapseFolder + "/test_summer-day-frames.txt",
            (results) => setFrames(results),
            (err) => console.log("Error: " + err)
        );
    }, [props.timelapseFolder]);

    useEffect(() => {
        console.log(loadedImages);
    }, [loadedImages])

    const onImageLoaded = (img, idx) => {
        setLoadedImages((prevState) => [...prevState, {image: img, index: idx}]);
    }

    return (
        <>
            <Timestamp></Timestamp>
            <ImageLoader loadFolder={props.timelapseFolder + "half/"} frames={frames} loadOrder={loadOrder} onImageLoaded={onImageLoaded}>
                <ImageWindow></ImageWindow>
            </ImageLoader>
        </>
    );
}

export default TimelapseDisplay;