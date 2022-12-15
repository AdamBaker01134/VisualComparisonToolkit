import './App.css';
import { React } from 'react';
import TimelapseDisplay from './Components/TimelapseDisplay/TimelapseDisplay';

function App() {

  // const [ displays, setDisplays ] = useState(["test_timelapse1", "test_timelapse2"]);

  // const displays = ["test_timelapse1", "test_timelapse2"];
  const displays = ["test_timelapse1"]

  return (
    <div className="App">
      <header className="App-header">
        {displays.map((displayFolder, idx) => {
          return <TimelapseDisplay key={"TimelapseDisplay-" + idx} timelapseFolder={"./test_img/"+displayFolder+"/"} loadType={"fill"} />
        })}
      </header>
    </div>
  );
}

export default App;
