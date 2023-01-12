import './App.css';
import { React, useState } from 'react';
import TimelapseDisplay from './Components/TimelapseDisplay/TimelapseDisplay';
import Loader from './Modules/Loader';
import EmptyDisplay from './Components/EmptyDisplay';

const CAPACITY = 100;
const IMAGE_PATH = "./test_img";

/*
  TODO:
    - Add a remove button to be able to remove datasets
    - Add master slider to control all the datasets at once
*/

const App = () => {

  const [dataCache, setDataCache] = useState([]);
  const [loader] = useState(new Loader(CAPACITY, IMAGE_PATH));
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(false);

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
    setLoading(false);
  }

  const loadImages = (dataset, frames, timestamps) => {
    loader.loadImages(
      dataset,
      frames,
      loadedImages => onPlotInit(dataset, frames, timestamps, loadedImages),
      loadError,
    );
  }

  const onNewDataset = (dataset) => {
    let cacheHit = dataCache.find(data => data.name === dataset);
    setInputError(false);
    setLoading(true);
    if (!!cacheHit) {
      onPlotInit(cacheHit.name, cacheHit.frames, cacheHit.timestamps, cacheHit.images);
    } else {
      loader.initDataset(dataset, loadImages, loadError);
    }
  };

  const loadError = (err) => {
    console.log("Error loading dataset..." );
    setInputError(true);
    setLoading(false);
  }

  return (
    <div className="App">
      <header className="App-header">
        {
          dataCache.map((dataObj, idx) => {
            return <TimelapseDisplay key={"display-" + idx} data={dataObj} />
          })
        }
        <EmptyDisplay onSubmit={onNewDataset} loading={loading} error={inputError} />
      </header>
    </div>
  );
}

export default App;
