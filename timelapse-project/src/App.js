import './App.css';
import { React, useState } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';

import AnnotationPanel from './Components/AnnotationPanel';
import ControlPanel from './Components/ControlPanel';

function sketch(p5) {
  p5.setup = () => p5.createCanvas(600, 600, p5.WEBGL);

  p5.draw = () => {
    p5.background(250);
    p5.normalMaterial();
    p5.push();
    p5.rotateZ(p5.frameCount * 0.01);
    p5.rotateX(p5.frameCount * 0.01);
    p5.rotateY(p5.frameCount * 0.01);
    p5.plane(100);
    p5.pop();
  };
}

function App() {
  const [controlValues, setControlValues] = useState({
    capacity: 129,
    distance: 1,
    mode: "fill",
  });

  return (
    <div className="App">
      <header className="App-header">
        <>
          <AnnotationPanel
            load={(fileindex) => console.log("Loading: " + fileindex)}
          />
          <ReactP5Wrapper sketch={sketch} />
          <ControlPanel
            onSubmit={(capacity, distance, mode) => setControlValues({
              capacity: capacity,
              distance: distance,
              mode: mode,
            })}
            capacity={controlValues.capacity}
            distance={controlValues.distance}
            mode={controlValues.mode}
          />
        </>
      </header>
    </div>
  );
}

export default App;
