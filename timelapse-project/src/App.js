import './App.css';
import { React, useState } from 'react';
import TimelapseDisplay from './Components/TimelapseDisplay/TimelapseDisplay';
import Loader from './Modules/Loader';
import EmptyDisplay from './Components/EmptyDisplay';

const CAPACITY = 100;
const IMAGE_PATH = "./test_img";

const App = () => {

  const [dataCache, setDataCache] = useState([]);
  const [loader] = useState(new Loader(CAPACITY, IMAGE_PATH));

  const onPlotInit = (dataset, frames, timestamps, images) => {
    setDataCache(
      prevState => [
        ...prevState,
        {
          name: dataset,
          id: dataset + "-" + prevState.length + 1,
          frames: frames,
          timestamps: timestamps,
          images: images,
        }
      ]
    );
  }

  const loadImages = (dataset, frames, timestamps) => {
    loader.loadImages(
      dataset,
      frames,
      loadedImages => onPlotInit(dataset, frames, timestamps, loadedImages),
      () => console.log("THERE WAS AN ERROR LOADING IMAGES"),
    );
  }

  const onNewDataset = (dataset) => {
    let cacheHit = dataCache.find(data => data.name === dataset);
    if (!!cacheHit) {
      onPlotInit(cacheHit.name, cacheHit.frames, cacheHit.timestamps, cacheHit.images);
    } else {
      loader.initDataset(dataset, loadImages, () => console.log("THERE WAS AN ERROR LOADING PLOT."));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {
          dataCache.map((dataObj, idx) => {
            return <TimelapseDisplay key={"display-" + idx} data={dataObj} />
          })
        }
        <EmptyDisplay onSubmit={onNewDataset} />
      </header>
    </div>
  );
}

export default App;
