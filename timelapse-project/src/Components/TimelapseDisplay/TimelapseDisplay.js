import { React, useState, useEffect } from 'react';

import Image from './Image';

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

    const updateImageIndex = (e) => {
        e.preventDefault();
        setImgIdx(e.target.value);
    }

    return (
        images.length > 0 ?
            <>
                <Image image={images[imgIdx]} />
                <input type="range" value={imgIdx} onChange={updateImageIndex} max={images.length} />
            </> : null
    );
}

export default TimelapseDisplay;