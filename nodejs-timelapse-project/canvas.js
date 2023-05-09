/*
 * "Main" file for timelapse web app.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let model;
let imodel;
let view;
let loader;

/* Constants */
const MAX_IMAGES = 1000;
// const DISPLAY_WIDTH = 350;
// const DISPLAY_HEIGHT = 350;
// const OVERLAY_WIDTH = 700;
// const OVERLAY_HEIGHT = 700;
// const VIEW_TYPES = {
//     displays: "displays",
//     overlay: "overlay",
// }

/* Path variables */
// const IMG_PATH = "./img/";
// let plotPath = "";

/* State data */
// let currentView = VIEW_TYPES.displays;
// let displays = [];
// let overlays = [];
// let selectedDisplays = [];
// let displayCache = {};
// let configs = {};
// let mouseIsFocused = false;
// let mouseIsFocusedOnStart = false;
// let mouseIsFocusedOnEnd = false;
// let controlsActive = false;
// let highlightedConfig = "";

/* DOM variables */
// let headerDiv = null;
// let overlayButton = null;
// let bodyDiv = null;
// let controlsDiv = null;
// let overlayDiv = null;
// let displaysDiv = null;
// let masterScrollbar = null;
// let configSelect = null;
// let normalizeControl = null;

/* Custom objects */
// let loader = null;
// let emptyDisplay = null;

/* p5.js function that is called to load things before setup is called */
function preload() {
    // headerDiv = createElementWithID("header", "", "headerContainer", "container");
    // bodyDiv = createElementWithID("div", "", "displayContainer", "container");
    // controlsDiv = createElementWithID("div", "", "controlsHolder", "controls");
    // overlayDiv = createElementWithID("div", "", "overlayContainer", "container");
    // overlayDiv.addClass("hidden");
    model = new Model();
    imodel = new iModel();
    loader = new Loader(model.maxImages, model.imagePath);
    model.setDatasets(loader.loadDatasets());
}

/* p5.js function that is called when the application starts up (after preload) */
function setup() {
    model.setDisplaysPerRow(Math.floor(windowWidth / 380));
    createCanvas(windowWidth, windowHeight * 3);
    // displaysDiv = createDiv();
    // displaysDiv.class("displays");
    // displaysDiv.parent(bodyDiv);
    view = new View();
    model.addSubscriber(view);
    imodel.addSubscriber(view);
    view.setModel(model);
    view.setInteractionModel(imodel);

    _setupHeader();
    _setupGlobalScrollbar();

    // _attachUserEventListeners();

    // noCanvas(); /* Multiple canvases being drawn, so no need for default canvas. */
    noLoop();
}

/* p5.js function that acts as the draw loop */
function draw() {
    // if (currentView === VIEW_TYPES.displays) {
    //     displays.forEach(display => display.draw());
    //     masterScrollbar.draw();
    // } else if (currentView === VIEW_TYPES.overlay) {
    //     overlays.forEach(overlay => overlay.draw());
    // }
}

/**
 * Populate the header DOM object with essential elements and functionality.
 */
function _setupHeader() {
    // let displayButton = createButton("Displays");
    // overlayButton = createButton("Overlay (0/2)");
    // displayButton.mouseClicked(_loadDisplaysView);
    // overlayButton.mouseClicked(_loadOverlayView);
    // overlayButton.elt.disabled = true;
    // displayButton.parent(headerDiv);
    // overlayButton.parent(headerDiv);
    let uploadSelect = document.getElementById("uploadSelect");
    model.datasets.forEach(dataset => {
        let option = document.createElement("option");
        option.text = dataset;
        uploadSelect.add(option);
    });
    _attachHeaderListeners();
}

/**
 * Loads and constructs a dataset object that will be displayed as a TimelapseDisplay.
 * @param {string} dataset name of the dataset that we want to add. If '---', function will return.
 * @param {string} directory name of the directory to look for images
 */
function _createTimelapseDisplay(dataset, directory) {
    // if (dataset === "---") return;
    // emptyDisplay.setErrorState(false);

    // /* Improve performance by checking cache for display data that has already been loaded */
    // let cacheHit = displayCache[dataset];
    // if (!!cacheHit && cacheHit.directory === directory) {
    //     let newDisplay = _constructDisplayObject(cacheHit.name, cacheHit.frames, cacheHit.timestamps, cacheHit.images);
    //     displays.push(newDisplay);
    //     _syncMasterScrollbarMarkers();
    //     return;
    // }

    // let tempDisplay = new TempDisplay(displaysDiv, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    // const start = performance.now();
    // /* Load frames and timestamps simultaneously. After that, load images. */
    // loader.loadFramesAndTimestamps(
    //     dataset,
    //     (frames, timestamps) => {
    //         console.log(`Successfully loaded ${frames.length} frames and ${timestamps.length} timestamps in ${Math.floor(performance.now() - start)}ms.`);
    //         /* Load images matching the "frames" names, up to MAX_IMAGES total */
    //         loader.loadImages(
    //             dataset,
    //             frames,
    //             (images) => {
    //                 console.log(`Successfully loaded ${images.length} images in ${Math.floor(performance.now() - start)}ms.`);
    //                 tempDisplay.remove();
    //                 let newDisplay = _constructDisplayObject(dataset, frames, timestamps, images);
    //                 displays.push(newDisplay);
    //                 _cacheDisplay(dataset, directory, frames, timestamps, images);
    //                 _syncMasterScrollbarMarkers();
    //             },
    //             (err) => {
    //                 console.error(`Error loading images for the ${dataset} dataset.`);
    //                 console.log(err);
    //                 tempDisplay.remove();
    //                 emptyDisplay.setErrorState(true);
    //             },
    //             directory,
    //         );
    //     },
    //     (err) => {
    //         console.error(`Error loading frames/timestamps for the ${dataset} dataset.`);
    //         console.log(err);
    //         tempDisplay.remove();
    //         emptyDisplay.setErrorState(true);
    //     },
    // );
}

/**
 * Reconstructs an overlay object that will be displayed as an OverlayDisplay.
 */
function _reconstructOverlayDisplay() {
    // overlays = [];
    // let display1 = displayCache[selectedDisplays[0].getName()];
    // let display2 = displayCache[selectedDisplays[1].getName()];

    // let tempDisplay = new TempDisplay(overlayDiv, OVERLAY_WIDTH, OVERLAY_HEIGHT);

    // const start = performance.now();
    // /* Load monochrome images for one of the two selected displays. */
    // loader.loadMonochromes(
    //     display2.name,
    //     display2.frames,
    //     (monochromes) => {
    //         console.log(`Successfully loaded ${monochromes.length} monochrome images in ${Math.floor(performance.now() - start)}ms.`);
    //         tempDisplay.remove();
    //         overlays.push(new OverlayDisplay(
    //             `overlay-${display1.name}-${display2.name}`,
    //             display1.images,
    //             monochromes,
    //             overlayDiv,
    //             OVERLAY_WIDTH,
    //             OVERLAY_HEIGHT,
    //         ));
    //     },
    //     (err) => {
    //         console.error(`Error loading monochrome images for the ${display2.name} dataset.`);
    //         console.log(err);
    //         tempDisplay.remove();
    //     },
    // );
}

/**
 * 
 * @param {string} dataset name of the dataset
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 */
function _constructDisplayObject(dataset, frames, timestamps, images) {

    // let displayCount = 1;
    // let duplicates = displays.filter((display) => display.getName() === dataset);
    // if (duplicates.length > 0) {
    //     /* Find the duplicate with the highest id number. */
    //     let values = duplicates.map((duplicate) => parseInt(duplicate.id.charAt(duplicate.id.length - 1)));
    //     displayCount = Math.max(...values) + 1;
    // }

    // return new TimelapseDisplay(
    //     dataset,
    //     dataset + "-" + displayCount,
    //     frames,
    //     timestamps,
    //     images,
    //     displaysDiv,
    //     DISPLAY_WIDTH,
    //     DISPLAY_HEIGHT,
    //     masterScrollbar.getIndex(),
    //     _removeDisplay,
    // );
}

/**
 * Construct DOM elements that act as Global controls for all displays.
 * This includes:
 *  - the master/global scrollbar controlling indexing for all the displays
 *  - the Set All button to set all displays to the current index of the global scrollbar
 *  - the inputs that control saving and loading positions in the global scrollbar
 */
function _setupGlobalScrollbar() {
    // let masterControls = createDiv();
    // masterControls.class("masterControls");
    // masterControls.parent(controlsDiv);

    // configSelect = createSelect();
    // configSelect.id("configSelect");
    // configSelect.option("Select config");
    // configSelect.disable("Select config");
    // configSelect.parent(masterControls);

    // normalizeControl = createCheckbox("Normalize", true);
    // normalizeControl.id("normalizeControl");
    // normalizeControl.parent(masterControls);

    // let loadConfig = createButton("Load Config");
    // loadConfig.id("loadConfig");
    // loadConfig.mouseClicked((e) => _loadConfiguration(configSelect.elt.value));
    // loadConfig.parent(masterControls);

    // let saveConfig = createButton("Save Config");
    // saveConfig.id("saveConfig");
    // saveConfig.mouseClicked(_saveCurrentConfiguration);
    // saveConfig.parent(masterControls);

    // masterScrollbar = new Scrollbar(DISPLAY_WIDTH * 3, 30, "masterScrollbar", masterControls);
    // for (let i = 0; i < MAX_IMAGES; i++) {
    //     masterScrollbar.addSegment(i);
    // }
    // masterScrollbar.updateParameters(DISPLAY_WIDTH * 3, 30);
    // masterControls.mouseOver(() => controlsActive = true);
    // masterControls.mouseOut(() => controlsActive = false);
    model.setGlobalScrollbar(new GlobalScrollbar(
        0,
        0,
        400,
        30,
        10,
        model.maxImages
    ));
}

/**
 * Add a new display to the displayCache. Cached item keyed by dataset name.
 * @param {string} dataset name of the dataset
 * @param {string} directory name of the image directory
 * @param {Array<string>} frames array of strings, each representing a frame in the dataset
 * @param {Array<string>} timestamps array of strings, each representing a timestamp in the dataset
 * @param {Array<p5.Image>} images array of loaded p5 images
 */
function _cacheDisplay(name, directory, frames, timestamps, images) {
    // displayCache[name] = {
    //     name: name,
    //     directory: directory,
    //     frames: frames,
    //     timestamps: timestamps,
    //     images: images,
    // }
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
    // let masterStart = masterScrollbar.getStart();
    // let masterEnd = masterScrollbar.getEnd();
    // let masterRange = masterEnd - masterStart;
    // if (newOffset < masterStart || newOffset > masterEnd) {
    //     return;
    // }
    // displays.forEach(display => {
    //     /* Calculate the start-end range of each display. */
    //     let start = display.getStart();
    //     let end = display.getEnd();
    //     let range = end - start;
    //     /* Step the displays index by a factor of range/masterRange. */
    //     let stepRatio = 1;
    //     if (normalizeControl.checked()) {
    //         stepRatio = range / masterRange;
    //     }
    //     display.setIndexFromMaster(newOffset - masterStart, stepRatio);
    // });
}

/**
 * Sync the master scrollbar's start, end, and index markers to the display with the smallest
 * start-end range.
 */
function _syncMasterScrollbarMarkers() {
    // let start = -1;
    // let end = -1;
    // displays.forEach((display) => {
    //     if ((start < 0 || end < 0) || ((end - start) > (display.getEnd() - display.getStart()))) {
    //         start = display.getStart();
    //         end = display.getEnd();
    //     }
    // });

    // if (start >= 0 && end >= start) {
    //     masterScrollbar.setStart(start);
    //     masterScrollbar.setEnd(end);
    // }
}

/**
 * Attempts to find a display within the displays array with the given array and remove it.
 * @param {string} displayID id of display to be removed
 */
function _removeDisplay(displayID) {
    // console.log("Attempting to remove timelapse display with id: " + displayID);

    // let displayIdx = displays.findIndex(display => display.getId() === displayID);
    // if (displayIdx > -1) {
    //     let selectedIdx = selectedDisplays.findIndex(selectedDisplay => selectedDisplay.getId() === displayID);
    //     if (selectedIdx > -1) {
    //         selectedDisplays.splice(selectedIdx, 1); /* Remove selected display at index selectedIdx */
    //     }
    //     displays[displayIdx].remove();
    //     displays.splice(displayIdx, 1); /* Remove display at index displayIdx */
    //     console.log("Successfully removed timelapse display with id: " + displayID);
    // } else {
    //     console.error("Removal Error: could not locate timelapse display with id" + displayID);
    // }

    // _syncMasterScrollbarMarkers();
}

/**
 * Add selected display to the array of 2 selected displays.
 * Remove oldest selected display if 2 displays already selected.
 * @param {TimelapseDisplay} display display to select
 */
function _selectDisplay(display) {
    /* If display is already selected, unselect it and return */
    // let selectedIdx = selectedDisplays.findIndex((selectedDisplay) => selectedDisplay.getId() === display.getId());
    // if (selectedIdx >= 0) {
    //     selectedDisplays.splice(selectedIdx, 1);
    //     display.toggleSelected();
    // } else {
    //     /* Reduce the selected displays to 1 or less */
    //     while (selectedDisplays.length >= 2) {
    //         selectedDisplays[0].toggleSelected();
    //         selectedDisplays.shift();
    //     }
    //     selectedDisplays.push(display);
    //     display.toggleSelected();
    // }
    // /* Edit HTML values of header overlay button */
    // if (selectedDisplays.length === 2) {
    //     overlayButton.elt.disabled = false;
    // } else {
    //     overlayButton.elt.disabled = true;
    // }
    // overlayButton.elt.innerText = `Overlay (${selectedDisplays.length}/2)`;
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
    // let config = {
    //     displays: {},
    //     masterControls: {},
    // };

    // let configName = prompt("Please entered a name for this configuration", `config-${Object.keys(configs).length}`);
    // if (!!configName) {
    //     let colourTint = 32 * Object.keys(configs).length;
    //     let colour = `rgb(${colourTint},${colourTint},${colourTint})`;

    //     displays.forEach(display => {
    //         let displayIdx = display.getIndex();
    //         let startPos = display.getStart();
    //         let endPos = display.getEnd();
    //         config.displays[display.getId()] = {
    //             index: displayIdx,
    //             start: startPos,
    //             end: endPos,
    //         };
    //         display.addDot(configName, displayIdx, colour);
    //     });
    //     let masterIdx = masterScrollbar.getIndex();
    //     config.masterControls = { index: masterIdx };
    //     masterScrollbar.addDot(configName, masterIdx, colour);

    //     configs[configName] = config;
    //     configSelect.option(configName);
    //     configSelect.value(configName);
    //     console.log(`Successfully saved the [${configName}] configuration.`);
    // }
}

/**
 * Load a saved configuration.
 * @param {string} config name of the configuration we want to load.
 */
function _loadConfiguration(config) {
    // let configuration = configs[config];
    // if (!!configuration) {
    //     let configDisplays = Object.keys(configuration.displays);
    //     configDisplays.forEach(id => {
    //         let display = displays.find((display) => display.getId() === id);
    //         /* IMPORTANT: Must set start/end positions before the index! */
    //         display.setStart(configuration.displays[id].start);
    //         display.setEnd(configuration.displays[id].end);
    //         display.setIndex(configuration.displays[id].index);
    //     });
    //     /* IMPORTANT: Likewise, must sync master scrollbar markers before setting index! */
    //     _syncMasterScrollbarMarkers();
    //     masterScrollbar.setIndex(configuration.masterControls.index);
    //     console.log(`Succesfully loaded the [${config}] configuration.`)
    // }
}

/**
 * Highlight a saved configuration.
 * @param {string} config name of the configuration we want to highlight.
 */
function _highlightConfiguration(config) {
    // let configuration = configs[config];
    // if (!!configuration) {
    //     let configDisplays = Object.keys(configuration.displays);
    //     configDisplays.forEach(id => {
    //         let display = displays.find((display) => display.getId() === id);
    //         display.highlightDotAtIndex(configuration.displays[id].index);
    //     });
    //     masterScrollbar.highlightDotAtIndex(configuration.masterControls.index);
    //     highlightedConfig = config;
    // }
}

/**
 * Unhighlight all dots in each display.
 */
function _unhighlightConfigurations() {
    // displays.forEach((display) => display.unhighlightConfigs());
    // masterScrollbar.unhighlightConfigs();
    // highlightedConfig = "";
}

//// Switching Views ////

/**
 * Hide all currentView-specific elements in the DOM.
 */
function _clearView() {
    // if (currentView === VIEW_TYPES.displays) {
    //     bodyDiv.addClass("hidden");
    //     controlsDiv.addClass("hidden");
    // } else if (currentView === VIEW_TYPES.overlay) {
    //     overlayDiv.addClass("hidden");
    //     overlayDiv.elt.innerHTML = "";
    // }
}

/**
 * Set the currently displayed view to the displays view.
 */
function _loadDisplaysView() {
    // if (currentView === VIEW_TYPES.displays) return;
    // _clearView();
    // console.log("Loading displays view...");
    // bodyDiv.removeClass("hidden");
    // controlsDiv.removeClass("hidden");
    // currentView = VIEW_TYPES.displays;
}

/**
 * Set the currently displayed view to the overlay view.
 */
function _loadOverlayView() {
    // if (currentView === VIEW_TYPES.overlay) return;
    // _clearView();
    // console.log("Loading overlay view...");
    // overlayDiv.removeClass("hidden");
    // currentView = VIEW_TYPES.overlay;
    // _reconstructOverlayDisplay();
}

/**
 * Mouse moved event handler.
 * @param {Event} e
 * @param {number} mx x coordinate of the cursor
 */
function handleMouseMoved(e, mx = mouseX) {
    // if (currentView === VIEW_TYPES.displays) {
    //     if (!mouseIsFocused) {
    //         // If the mouse is not focused in a display/scrollbar, check for highlighting configs
    //         let hoverDot = null;
    //         for (let i = 0; i <= displays.length; i++) {
    //             // Check if hovering over display/master scrollbar configs
    //             if (i < displays.length && (hoverDot = displays[i].getDotOnMouse(mx)) ||
    //                 i === displays.length && (hoverDot = masterScrollbar.getDotOnMouse(mx))) break;
    //         }
    //         if (hoverDot !== null) {
    //             // If hovering over a dot in any display/scrollbar, highlight all configs
    //             let configName = hoverDot.configName;
    //             _highlightConfiguration(configName);
    //         } else if (highlightedConfig !== "") {
    //             // If moved out of the dot, unhighlight all displays/scrollbar dots
    //             _unhighlightConfigurations();
    //         }
    //         return;
    //     };

    //     // First check if the controls bar is active (overwrites other behaviour)
    //     if (controlsActive) {
    //         if (masterScrollbar.hasMouseInScrollbar()) {
    //             let index = masterScrollbar.setIndexFromMouse(mx);
    //             if (index >= 0) {
    //                 _updateDisplaysWithMaster(index);
    //             }
    //         }
    //         return;
    //     }

    //     // Then, check if display is focused
    //     let focusedDisplay = displays.find((display) => display.hasMouseInScrollbar());
    //     if (focusedDisplay instanceof TimelapseDisplay) {
    //         focusedDisplay.handleMouseEvent(mx, mouseIsFocusedOnStart, mouseIsFocusedOnEnd);
    //         if (mouseIsFocusedOnStart || mouseIsFocusedOnEnd) {
    //             _syncMasterScrollbarMarkers();
    //         }
    //     }
    // } else if (currentView === VIEW_TYPES.overlay) {
    //     if (mouseIsFocused) {
    //         // Check if overlay scrollbar is focused
    //         let focusedDisplay = overlays.find((overlay) => overlay.hasMouseInScrollbar());
    //         if (focusedDisplay instanceof OverlayDisplay) {
    //             focusedDisplay.setIndexFromMouse(mx);
    //         }
    //     }
    // }
}

/**
 * Mouse pressed event handler.
 * @param {Event} e
 * @param {number} mx x coordinate of the cursor
 */
function handleMousePressed(e, mx = mouseX) {
    // if (currentView === VIEW_TYPES.overlay) {
    //     /* Handle overlay mouse pressed events */
    //     mouseIsFocused = overlays[0].hasMouseInScrollbar();
    //     handleMouseMoved(e, mx);
    //     return;
    // }
    // /* Handle mouse over scrollbar events */
    // let focusedDisplay = displays.find((display) => display.hasMouseInScrollbar());
    // if (controlsActive || focusedDisplay instanceof TimelapseDisplay) {
    //     mouseIsFocused = true;
    //     if (focusedDisplay instanceof TimelapseDisplay) {
    //         mouseIsFocusedOnStart = focusedDisplay.hasMouseFocusedOnStart(mx);
    //         mouseIsFocusedOnEnd = focusedDisplay.hasMouseFocusedOnEnd(mx);
    //     }
    //     if (!(mouseIsFocusedOnStart || mouseIsFocusedOnEnd) && highlightedConfig !== "") {
    //         /* Giving start/end positions mouse priority over configurations. */
    //         _loadConfiguration(highlightedConfig);
    //     } else {
    //         handleMouseMoved(e, mx);
    //     }
    //     return;
    // }
    // /* Handle mouse over image events */
    // focusedDisplay = displays.find((display) => display.hasMouseOnImage());
    // if (focusedDisplay instanceof TimelapseDisplay) {
    //     _selectDisplay(focusedDisplay);
    // }
}

/**
 * Mouse released event handler.
 */
function handleMouseReleased() {
    // mouseIsFocused = false;
    // mouseIsFocusedOnStart = false;
    // mouseIsFocusedOnEnd = false;
}

/* Controller */
function mouseMoved(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse moved at ${mx}, ${my}`)
}

function mouseDragged(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse dragged at ${mx}, ${my}`)
    if (imodel.focused) {
        model.setIndexFromMouse(imodel.focused, mx);
    }
}

function mousePressed(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse pressed at ${mx}, ${my}`);
    let display = null;
    if (display = model.checkImageHit(mx, my)) {
        imodel.select(display);
        updateDisplayControls();
    }
    if (display = model.checkScrollbarHit(mx, my)) {
        imodel.setFocused(display);
    }
}

function mouseReleased(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse released at ${mx}, ${my}`);
    imodel.setFocused(null);
}

function _attachHeaderListeners() {
    /* Upload header functions */
    document.getElementById("uploadButton")?.addEventListener("click", e => {
        let dataset = document.getElementById("uploadSelect")?.value;
        if (!!dataset && dataset !== "---") {
            model.incrementLoading();
            document.getElementById("loading-spinner").style.display = model.loading ? "block" : "none";
            const start = performance.now();
            console.log(`Beginning load of ${dataset}...`);
            loader.initDatasetLoad(
                dataset,
                loadObj => {
                    model.decrementLoading();
                    document.getElementById("loading-spinner").style.display = model.loading ? "block" : "none";
                    console.log(
                        `Finished loading ${dataset} in ${Math.floor(performance.now() - start)}ms. \
                        \nLoaded ${loadObj.frames.length} frames. \
                        \nLoaded ${loadObj.timestamps.length} timestamps. \
                        \nLoaded ${loadObj.images.length} images.`);

                    const PADDING = 10;
                    const SCROLLBAR_HEIGHT = 30;
                    const DISPLAY_WIDTH = 350;
                    let column = model.displays.length % model.displaysPerRow;
                    let row = Math.floor(model.displays.length / model.displaysPerRow);
                    model.addDisplay(new Display(
                        generateDisplayId(model, loadObj.name),
                        PADDING + column * (PADDING * 3 + DISPLAY_WIDTH),
                        PADDING + row * (PADDING * 3 + DISPLAY_WIDTH + SCROLLBAR_HEIGHT),
                        DISPLAY_WIDTH,
                        DISPLAY_WIDTH,
                        PADDING,
                        SCROLLBAR_HEIGHT,
                        loadObj.frames,
                        loadObj.timestamps,
                        loadObj.images)
                    );
                },
                err => {
                    console.error(err);
                    alert("Error: there were issues loading the video, please try again.");
                    model.decrementLoading();
                    document.getElementById("loading-spinner").style.display = model.loading ? "block" : "none";
                }
            )
        }
    });

    /* Global header functions */
    document.getElementById("loadConfigButton")?.addEventListener("click", e => {
        let config = document.getElementById("configSelect")?.value;
        if (!!config) {
            console.log(`Loading configuration ${config}`);
        }
    });
    document.getElementById("saveConfigButton")?.addEventListener("click", e => {
        console.log(`Saving configuration`);
    });
    document.getElementById("normalizeCheckbox")?.addEventListener("change", e => {
        model.setNormalized(e.target.checked);
    });

    /* Individual display header functions */
    document.getElementById("lockCheckbox").addEventListener("change", e => {
        let checked = e.target.checked;
        imodel.setLocked(checked);
    });
    document.getElementById("removeButton")?.addEventListener("click", e => {
        if (imodel.selection !== null) {
            console.log(`Removing ${imodel.selection.id}...`);
            model.removeDisplay(imodel.selection);
            imodel.select(imodel.selection); /* Need to unselect display */
            updateDisplayControls();
        }
    });
    document.getElementById("loadFrameButton")?.addEventListener("click", e => {
        let name = document.getElementById("frameSelect").value;
        let frame = imodel?.selection.savedFrames.find(savedFrame => savedFrame.name === name);
        if (!!frame) {
            model.setIndex(imodel.selection, frame.index);
        }
    });
    document.getElementById("saveFrameButton")?.addEventListener("click", e => {
        imodel.saveFrame();
        setSavedFrames();
    });
}

/***  Header HTML manipulation functions ***/

/**
 * Set the display controls as hidden or visible to the user
 * depending on the selection.
 */
function updateDisplayControls () {
    let displayControls = document.getElementById("displayControls");
    if (imodel.selection !== null) {
        displayControls?.classList.remove("hidden");
        document.getElementById("lockCheckbox").checked = imodel.selection.locked;
    } else {
        displayControls?.classList.add("hidden");
    }
    setSavedFrames();
}

/**
 * Set the saved frames selection element to the saved frames of the
 * selected display.
 */
function setSavedFrames () {
    let frameSelect = document.getElementById("frameSelect");
    frameSelect.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.text = "Select Frame";
    defaultOption.disabled = true;
    frameSelect.add(defaultOption);
    imodel.selection?.savedFrames.forEach(savedFrame => {
        let option = document.createElement("option");
        option.text = savedFrame.name;
        frameSelect.add(option);
    });
}