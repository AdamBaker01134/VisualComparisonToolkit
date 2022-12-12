import React from 'react';
import Timestamp from './Timestamp';
import ThumbnailBar from './ThumbnailBar';
import ImageWindow from './ImageWindow';

const TimelapseDisplay = (props) => {
    

    return (
        <div>Timelaspse Display
            <Timestamp></Timestamp>
            <ImageWindow></ImageWindow>
            <ThumbnailBar></ThumbnailBar>
        </div>
    );
}

export default TimelapseDisplay;