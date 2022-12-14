import './App.css';
import { React } from 'react';
import TimelapseDisplay from './Components/TimelapseDisplay/TimelapseDisplay';

function App() {

  // const [ displays, setDisplays ] = useState(["test_timelapse1", "test_timelapse2"]);

  const displays = ["test_timelapse1", "test_timelapse2"];

  return (
    <div className="App">
      <header className="App-header">
        {displays.map((displayFolder, idx) => {
          return <TimelapseDisplay key={"TimelapseDisplay-" + idx} timelapseFolder={displayFolder} />
        })}
      </header>
    </div>
  );
}

export default App;
