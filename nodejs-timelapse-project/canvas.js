/*
 * "Main" file for timelapse web app.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

/* Constants */
const MAX_IMAGES = 200;
const DISPLAY_WIDTH = 350;
const DISPLAY_HEIGHT = 350;

/* Path variables */
const IMG_PATH = "./img/";
let plotPath = "";

/* State data */
let datasets = [];
let displays = [];
let displayCache = {};
let configs = {};
let mouseIsFocused = false;
let mouseIsFocusedOnStart = false;
let mouseIsFocusedOnEnd = false;
let controlsActive = false;
let highlightedConfig = "";

/* DOM variables */
let headerDiv = null;
let controlsDiv = null;
let displaysDiv = null;
let masterScrollbar = null;
let configSelect = null;
let normalizeControl = null;

/* Custom objects */
let loader = null;
let emptyDisplay = null;

/* p5.js function that is called to load things before setup is called */
function preload() {
    headerDiv = createElementWithID("header", "", "setupHolder", "setup");
    controlsDiv = createElementWithID("div", "", "controlsHolder", "controls");
    loader = new Loader(MAX_IMAGES, IMG_PATH);
    datasets = loader.loadDatasets();
}

/* p5.js function that is called when the application starts up (after preload) */
function setup() {
    displaysDiv = createDiv();
    displaysDiv.class("displays");
    displaysDiv.parent(headerDiv);

    _createEmptyDisplay();
    _constructGlobalControls();

    _attachUserEventListeners();

    noCanvas(); /* Multiple canvases being drawn, so no need for default canvas. */
}

/* p5.js function that acts as the draw loop */
function draw() {
    displays.forEach(display => display.draw());
    masterScrollbar.draw();
}

/**
 * Create an empty display object.
 * The header div and datasets array must both be initialized before this happens.
 */
function _createEmptyDisplay() {
    emptyDisplay = new EmptyDisplay(headerDiv, datasets, _createTimelapseDisplay);
}

/**
 * Loads and constructs a dataset object that will be displayed as a TimelapseDisplay.
 * @param {string} dataset name of the dataset that we want to add. If '---', function will return.
 */
function _createTimelapseDisplay(dataset) {
    if (dataset === "---") return;
    emptyDisplay.setErrorState(false);
    emptyDisplay.setLoadState(true);

    /* Improve performance by checking cache for display data that has already been loaded */
    let cacheHit = displayCache[dataset];
    if (!!cacheHit) {
        emptyDisplay.setLoadState(false);
        let newDisplay = _constructDisplayObject(cacheHit.name, cacheHit.frames, cacheHit.timestamps, cacheHit.images);
        displays.push(newDisplay);
        _syncMasterScrollbarMarkers();
        return;
    }

    const start = performance.now();
    /* Load frames and timestamps simultaneously. After that, load images. */
    loader.loadFramesAndTimestamps(
        dataset,
        (frames, timestamps) => {
            console.log(`Successfully loaded ${frames.length} frames and ${timestamps.length} timestamps in ${Math.floor(performance.now() - start)}ms.`);
            /* Load images matching the "frames" names, up to MAX_IMAGES total */
            loader.loadImages(
                dataset,
                frames,
                (images) => {
                    console.log(`Successfully loaded ${images.length} images in ${Math.floor(performance.now() - start)}ms.`);
                    emptyDisplay.setLoadState(false);
                    let newDisplay = _constructDisplayObject(dataset, frames, timestamps, images);
                    displays.push(newDisplay);
                    _cacheDisplay(dataset, frames, timestamps, images);
                    _syncMasterScrollbarMarkers();
                },
                (err) => {
                    console.error(`Error loading images for the ${dataset} dataset.`);
                    console.log(err);
                    emptyDisplay.setErrorState(true);
                    emptyDisplay.setLoadState(false);
                }
            );
        },
        (err) => {
            console.error(`Error loading frames/timestamps for the ${dataset} dataset.`);
            console.log(err);
            emptyDisplay.setErrorState(true);
            emptyDisplay.setLoadState(false);
        },
    );
}

/**
 * 
 * @param {string} dataset name of the dataset
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 */
function _constructDisplayObject(dataset, frames, timestamps, images) {

    let displayCount = 1;
    let duplicates = displays.filter((display) => display.getName() === dataset);
    if (duplicates.length > 0) {
        /* Find the duplicate with the highest id number. */
        let values = duplicates.map((duplicate) => parseInt(duplicate.id.charAt(duplicate.id.length - 1)));
        displayCount = Math.max(...values) + 1;
    }

    return new TimelapseDisplay(
        dataset,
        dataset + "-" + displayCount,
        frames,
        timestamps,
        images,
        displaysDiv,
        DISPLAY_WIDTH,
        DISPLAY_HEIGHT,
        masterScrollbar.getIndex(),
        _removeDisplay,
    );
}

/**
 * Construct DOM elements that act as Global controls for all displays.
 * This includes:
 *  - the master/global scrollbar controlling indexing for all the displays
 *  - the Set All button to set all displays to the current index of the global scrollbar
 *  - the inputs that control saving and loading positions in the global scrollbar
 */
function _constructGlobalControls() {
    let masterControls = createDiv();
    masterControls.class("masterControls");
    masterControls.parent(controlsDiv);

    configSelect = createSelect();
    configSelect.id("configSelect");
    configSelect.option("Select config");
    configSelect.disable("Select config");
    configSelect.parent(masterControls);

    normalizeControl = createCheckbox("Normalize", true);
    normalizeControl.id("normalizeControl");
    normalizeControl.parent(masterControls);

    let loadConfig = createButton("Load Config");
    loadConfig.id("loadConfig");
    loadConfig.mouseClicked((e) => _loadConfiguration(configSelect.elt.value));
    loadConfig.parent(masterControls);

    let saveConfig = createButton("Save Config");
    saveConfig.id("saveConfig");
    saveConfig.mouseClicked(_saveCurrentConfiguration);
    saveConfig.parent(masterControls);

    masterScrollbar = new Scrollbar(DISPLAY_WIDTH * 3, 30, "masterScrollbar", masterControls);
    for (let i = 0; i < MAX_IMAGES; i++) {
        masterScrollbar.addSegment(i);
    }
    masterScrollbar.updateParameters(DISPLAY_WIDTH * 3, 30);
    masterControls.mouseOver(() => controlsActive = true);
    masterControls.mouseOut(() => controlsActive = false);
}

/**
 * Add a new display to the displayCache. Cached item keyed by dataset name.
 * @param {string} dataset name of the dataset
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 */
function _cacheDisplay(name, frames, timestamps, images) {
    displayCache[name] = {
        name: name,
        frames: frames,
        timestamps: timestamps,
        images: images,
    }
}

// /**
//  * Set the current index of each display to a specific index.
//  * @param {number} newIndex new index to set each display to
//  */
// function _setAllDisplayIndexes(newIndex) {
//     if (newIndex < 0 || newIndex > MAX_IMAGES || displays.length === 0) {
//         return;
//     }
//     displays.forEach(display => display.setIndex(newIndex));
//     console.log("Successfully set all display indexes to [" + newIndex + "].");
// }

/**
 * Update each of the timelapse displays with a new offset.
 * To be utilized only by the master scrollbar.
 * @param {number} newOffset new offset for each of the displays
 */
function _updateDisplaysWithMaster(newOffset) {
    /* Calculate the start-end range of the master scrollbar. */
    let masterStart = masterScrollbar.getStart();
    let masterEnd = masterScrollbar.getEnd();
    let masterRange = masterEnd - masterStart;
    if (newOffset < masterStart || newOffset > masterEnd) {
        return;
    }
    displays.forEach(display => {
        /* Calculate the start-end range of each display. */
        let start = display.getStart();
        let end = display.getEnd();
        let range = end - start;
        /* Step the displays index by a factor of range/masterRange. */
        let stepRatio = 1;
        if (normalizeControl.checked()) {
            stepRatio = range / masterRange;
        }
        display.setIndexFromMaster(newOffset - masterStart, stepRatio);
    });
}

/**
 * Sync the master scrollbar's start, end, and index markers to the display with the smallest
 * start-end range.
 */
function _syncMasterScrollbarMarkers() {
    let start = -1;
    let end = -1;
    displays.forEach((display) => {
        if ((start < 0 || end < 0) || ((end - start) > (display.getEnd() - display.getStart()))) {
            start = display.getStart();
            end = display.getEnd();
        }
    });

    if (start >= 0 && end >= start) {
        masterScrollbar.setStart(start);
        masterScrollbar.setEnd(end);
    }
}

/**
 * Attempts to find a display within the displays array with the given array and remove it.
 * @param {string} displayID id of display to be removed
 */
function _removeDisplay(displayID) {
    console.log("Attempting to remove timelapse display with id: " + displayID);

    let displayIdx = displays.findIndex(display => display.getId() === displayID);
    if (displayIdx > -1) {
        displays[displayIdx].remove();
        displays.splice(displayIdx, 1); /* Remove display at index displayIdx */
        console.log("Successfully removed timelapse display with id: " + displayID);
    } else {
        console.error("Removal Error: could not locate timelapse display with id" + displayID);
    }

    _syncMasterScrollbarMarkers();
}

/**
 * Save the current configuration of the system.
 * (i.e. save the current index of each display in a JSON)
 * Structure of configs JSON array:
 *  [
 *      configName: {
 *          displays: {
 *              displayId: { 
 *                  index: displayIdx,
 *                  start: startPos,
 *                  end: endPos,
 *              }
 *              ...
 *          }
 *          masterControls: { index: masterIdx }
 *      },
 *      ...
 *  ]
 */
function _saveCurrentConfiguration() {
    let config = {
        displays: {},
        masterControls: {},
    };

    let configName = prompt("Please entered a name for this configuration", `config-${Object.keys(configs).length}`);
    if (!!configName) {
        let colourTint = 32 * Object.keys(configs).length;
        let colour = `rgb(${colourTint},${colourTint},${colourTint})`;

        displays.forEach(display => {
            let displayIdx = display.getIndex();
            let startPos = display.getStart();
            let endPos = display.getEnd();
            config.displays[display.getId()] = { 
                index: displayIdx,
                start: startPos,
                end: endPos, 
            };
            display.addDot(configName, displayIdx, colour);
        });
        let masterIdx = masterScrollbar.getIndex();
        config.masterControls = { index: masterIdx };
        masterScrollbar.addDot(configName, masterIdx, colour);

        configs[configName] = config;
        configSelect.option(configName);
        configSelect.value(configName);
        console.log(`Successfully saved the [${configName}] configuration.`);
    }
}

/**
 * Load a saved configuration.
 * @param {string} config name of the configuration we want to load.
 */
function _loadConfiguration(config) {
    let configuration = configs[config];
    if (!!configuration) {
        let configDisplays = Object.keys(configuration.displays);
        configDisplays.forEach(id => {
            let display = displays.find((display) => display.getId() === id);
            /* IMPORTANT: Must set start/end positions before the index! */
            display.setStart(configuration.displays[id].start);
            display.setEnd(configuration.displays[id].end);
            display.setIndex(configuration.displays[id].index);
        });
        /* IMPORTANT: Likewise, must sync master scrollbar markers before setting index! */
        _syncMasterScrollbarMarkers();
        masterScrollbar.setIndex(configuration.masterControls.index);
        console.log(`Succesfully loaded the [${config}] configuration.`)
    }
}

/**
 * Highlight a saved configuration.
 * @param {string} config name of the configuration we want to highlight.
 */
function _highlightConfiguration(config) {
    let configuration = configs[config];
    if (!!configuration) {
        let configDisplays = Object.keys(configuration.displays);
        configDisplays.forEach(id => {
            let display = displays.find((display) => display.getId() === id);
            display.highlightDotAtIndex(configuration.displays[id].index);
        });
        masterScrollbar.highlightDotAtIndex(configuration.masterControls.index);
        highlightedConfig = config;
    }
}

/**
 * Unhighlight all dots in each display.
 */
function _unhighlightConfigurations() {
    displays.forEach((display) => display.unhighlightConfigs());
    masterScrollbar.unhighlightConfigs();
    highlightedConfig = "";
}

//// User Event Handling ////

/**
 * Attach following event listeners to the document:
 *  - mousemove event
 *  - mousedown event
 *  - mouseup event
 */
function _attachUserEventListeners() {
    document.addEventListener("mousemove", handleMouseMoved);
    document.addEventListener("mousedown", handleMousePressed);
    document.addEventListener("mouseup", handleMouseReleased);
}

/**
 * Mouse moved event handler.
 * @param {Event} e
 * @param {number} mx x coordinate of the cursor
 */
function handleMouseMoved(e, mx = mouseX) {
    if (!mouseIsFocused) {
        // If the mouse is not focused in a display/scrollbar, check for highlighting configs
        let hoverDot = null;
        for (let i = 0; i <= displays.length; i++) {
            // Check if hovering over display/master scrollbar configs
            if (i < displays.length && (hoverDot = displays[i].getDotOnMouse(mx)) ||
                 i === displays.length && (hoverDot = masterScrollbar.getDotOnMouse(mx))) break;
        }
        if (hoverDot !== null) {
            // If hovering over a dot in any display/scrollbar, highlight all configs
            let configName = hoverDot.configName;
            _highlightConfiguration(configName);
        } else if (highlightedConfig !== "") {
            // If moved out of the dot, unhighlight all displays/scrollbar dots
            _unhighlightConfigurations();
        }
        return;
    };

    // First check if the controls bar is active (overwrites other behaviour)
    if (controlsActive) {
        if (masterScrollbar.hasMouseInScrollbar()) {
            let index = masterScrollbar.setIndexFromMouse(mx);
            if (index >= 0) {
                _updateDisplaysWithMaster(index);
            }
        }
        return;
    }

    // Then, check if display is focused
    let focusedDisplay = displays.find((display) => display.hasMouseInScrollbar());
    if (focusedDisplay instanceof TimelapseDisplay) {
        focusedDisplay.handleMouseEvent(mx, mouseIsFocusedOnStart, mouseIsFocusedOnEnd);
        if (mouseIsFocusedOnStart || mouseIsFocusedOnEnd) {
            _syncMasterScrollbarMarkers();
        }
    }
}

/**
 * Mouse pressed event handler.
 * @param {Event} e
 * @param {number} mx x coordinate of the cursor
 */
function handleMousePressed(e, mx = mouseX) {
    let focusedDisplay = displays.find((display) => display.hasMouseInScrollbar());
    if (controlsActive || focusedDisplay instanceof TimelapseDisplay) {
        mouseIsFocused = true;
        if (focusedDisplay instanceof TimelapseDisplay) {
            mouseIsFocusedOnStart = focusedDisplay.hasMouseFocusedOnStart(mx);
            mouseIsFocusedOnEnd = focusedDisplay.hasMouseFocusedOnEnd(mx);
        }
        if (!(mouseIsFocusedOnStart || mouseIsFocusedOnEnd) && highlightedConfig !== "") {
            /* Giving start/end positions mouse priority over configurations. */
            _loadConfiguration(highlightedConfig);
        }
        handleMouseMoved(e, mx);
    }
}

/**
 * Mouse released event handler.
 */
function handleMouseReleased() {
    mouseIsFocused = false;
    mouseIsFocusedOnStart = false;
    mouseIsFocusedOnEnd = false;
}