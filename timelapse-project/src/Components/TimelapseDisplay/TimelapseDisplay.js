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
                <Image image={images[imgIdx]} />
                <input className="slider" type="range" value={imgIdx} onChange={updateImageIndex} max={images.length} />
            </div> : null
    );
}

export default TimelapseDisplay;