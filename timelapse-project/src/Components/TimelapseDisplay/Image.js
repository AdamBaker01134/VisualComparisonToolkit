import React from "react";

import Sketch from 'react-p5';

const Image = (props) => {

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(200, 200).parent(canvasParentRef);
    }

    const draw = (p5) => {
        if (props.image) {
            p5.image(
                props.image,
                50,
                50,
                0,
                0,
            );
        } else {
            p5.fill(188, 212, 230);
            p5.rectMode(p5.CORNER);
            p5.noStroke();
            p5.rect(50, 50, 50, 50);
        }
    }

    return (
        <Sketch setup={setup} draw={draw} />
    );
}

export default Image;