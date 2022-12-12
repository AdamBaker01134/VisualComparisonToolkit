import './App.css';
import { React, useState, useEffect } from 'react';
// import { ReactP5Wrapper } from 'react-p5-wrapper';
import TimelapseDisplay from './Components/TimelapseDisplay/TimelapseDisplay';

// function sketch(p5) {
//   let img;

//   p5.setup = () => {
//     p5.createCanvas(600, 600, p5.WEBGL);
//     img = p5.loadImage("./logo192.png");
//   };

//   p5.updateWithProps = () => {

//   }

//   p5.draw = () => {
//     p5.background(250);
//     p5.normalMaterial();
//     p5.push();
//     p5.rotateZ(p5.frameCount * 0.01);
//     p5.rotateX(p5.frameCount * 0.01);
//     p5.rotateY(p5.frameCount * 0.01);
//     p5.image(img, -100, -100);
//     p5.pop();
//   };
// }

function App() {

  // const [ displays, setDisplays ] = useState([]);

  const displays = [ "test_timelapse1"];

  return (
    <div className="App">
      <header className="App-header">
        <>
          {/* <ReactP5Wrapper sketch={sketch} /> */}
          {displays.map((displayFolder) => {
            <TimelapseDisplay timelapseFolder={displayFolder} />
          })}
        </>
      </header>
    </div>
  );
}

export default App;
