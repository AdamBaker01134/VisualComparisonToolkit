import { React, useEffect } from 'react';
import p5 from 'p5';

const _p5 = new p5();

const ImageLoader = (props) => {

    const loadNextImage = (curr = 0) => {
        if (curr >= props.frames.length) {
            return;
        }
        _p5.loadImage(props.loadFolder + props.frames[props.loadOrder[curr]], (img) => {
            // console.log("Loaded image with index: " + props.loadOrder[curr]);
            props.onImageLoaded(img, curr);
            loadNextImage(curr + 1);
        });
    }

    useEffect(() => {

        if (props.frames.length > 0 && props.frames.length === props.loadOrder.length) {
            loadNextImage();
        }
    }, [props.frames, props.loadOrder])

    return (
        <>
            <div>
                ImageLoader
                {props.children}
            </div>
        </>
    )
}

export default ImageLoader;