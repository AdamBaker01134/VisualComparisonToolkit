import './App.css';
import { React, useState } from 'react';
import TimelapseDisplay from './Components/TimelapseDisplay/TimelapseDisplay';
import Loader from './Modules/Loader';
import EmptyDisplay from './Components/EmptyDisplay';

const CAPACITY = 100;
const IMAGE_PATH = "./test_img";

const App = () => {

  const [data, setData] = useState([]);
  const [loader] = useState(new Loader(CAPACITY, IMAGE_PATH));

  const onPlotInit = (dataset, frames, timestamps) => {
    setData(
      prevState => [
        ...prevState,
        {
          name: dataset,
          frames: frames,
          timestamps: timestamps
        }
      ]
    );
  }

  const onNewDataset = (dataset) => {
    loader.initDataset(dataset, onPlotInit, () => console.log("THERE WAS AN ERROR LOADING."))
  };

  return (
    <div className="App">
      <header className="App-header">
        {
          data.map((dataObj, idx) => {
            return <TimelapseDisplay key={"display-" + idx} data={dataObj} loader={loader} />
          })
        }
        <EmptyDisplay onSubmit={onNewDataset} />
      </header>
    </div>
  );
}

export default App;
