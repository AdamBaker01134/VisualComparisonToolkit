import React from "react";

import Sketch from 'react-p5';

const Image = (props) => {

    let x = 0, y =0;
    let width = 350, height = 350;

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
    }

    const draw = (p5) => {
        if (props.image) {
            p5.noStroke();
            p5.fill(255);
            p5.image(
                props.image,
                x,
                y,
                width,
                height,
            );
        }
    }

    return (
        <Sketch setup={setup} draw={draw} />
    );
}

export default Image;