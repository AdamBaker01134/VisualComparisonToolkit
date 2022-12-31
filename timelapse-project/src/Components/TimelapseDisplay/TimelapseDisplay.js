import {React, useState, useEffect} from 'react';

import ImageWindow from './ImageWindow';

const TimelapseDisplay = (props) => {

    const [imgIdx, setImgIdx] = useState(0);
    const [images, setImages] = useState([]);

    useEffect(() => {
        props.loader.loadImages(
            props.data.name,
            props.data.frames,
            loadedImages => setImages(loadedImages),
            () => console.log("THERE WAS AN ERROR LOADING IMAGES"),
        );
        setImgIdx(0);
    }, [props.data, props.loader]);

    return (
        <>
            <ImageWindow image={images.length > 0 ? images[imgIdx] : null}></ImageWindow>
        </>
    );
}

export default TimelapseDisplay;