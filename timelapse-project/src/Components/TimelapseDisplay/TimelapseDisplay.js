import { React, useState } from 'react';

import Image from './Image';

const TimelapseDisplay = (props) => {

    const [imgIdx, setImgIdx] = useState(0);

    const updateImageIndex = (e) => {
        e.preventDefault();
        setImgIdx(e.target.value);
    }

    let images = props.data.images || [];

    return (
        images.length > 0 ?
            <div className="display">
                <div className="titleBar">
                    <div className="title">{props.data.name}</div>
                    <div className="timestamp">{props.data.timestamps[imgIdx]}</div>
                </div>
                <Image image={images[imgIdx]} />
                <input className="slider" type="range" value={imgIdx} onChange={updateImageIndex} max={images.length - 1} />
            </div> : null
    );
}

export default TimelapseDisplay;