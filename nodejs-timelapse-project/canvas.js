/*
 * "Main" file for video comparison web app.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let model;
let imodel;
let loader;

/* Constants */
const CANVAS_WIDTH = innerWidth * 0.98;
const CANVAS_HEIGHT = innerHeight * 3;
const HEADER_HEIGHT = 72;
const GLOBAL_SCROLLBAR_HEIGHT = 40;
const MAX_IMAGES = 1000;
const IMG_PATH = "./img/";
const PADDING = 10;
const SCROLLBAR_HEIGHT = 30;
const DISPLAY_WIDTH = 350;
const DISPLAY_HEIGHT = 350;

/* p5.js function that is called to load things before setup is called */
function preload() {
    model = new Model();
    imodel = new iModel();
    loader = new Loader(MAX_IMAGES, IMG_PATH);
    model.setDatasets(loader.loadDatasets());
}

/* p5.js function that is called when the application starts up (after preload) */
function setup() {
    model.setDisplaysPerRow(Math.floor(CANVAS_WIDTH / 380));
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    let view = new View();
    model.addSubscriber(view);
    imodel.addSubscriber(view);
    view.setModel(model);
    view.setInteractionModel(imodel);

    let headerview = new Headerview();
    model.addSubscriber(headerview);
    imodel.addSubscriber(headerview);
    headerview.setModel(model);
    headerview.setInteractionModel(imodel);

    _attachHeaderListeners();
    _attachUserEventListeners();
    _setupGlobalScrollbar();

    noLoop();
}

/* p5.js function that acts as the draw loop */
function draw() {}

/**
 * Construct the global scrollbar.
 */
function _setupGlobalScrollbar() {
    model.setGlobalScrollbar(new GlobalScrollbar(
        0,
        innerHeight + scrollY - HEADER_HEIGHT - GLOBAL_SCROLLBAR_HEIGHT,
        CANVAS_WIDTH,
        GLOBAL_SCROLLBAR_HEIGHT,
        0,
        MAX_IMAGES,
    ));
}

/* Controller */
const STATE = {
    READY: "ready",
    OUT_OF_BOUNDS: "oob",
    FOCUSED: "focused",
    START_FOCUSED: "startFocused",
    END_FOCUSED: "endFocused",
    GHOSTING: "ghosting",
    PREPARE_SELECT: "prepareSelect",
    PREPARE_MOVE: "prepareMove",
    PREPARE_OVERLAY: "prepareOverlay",
}
let currentState = STATE.READY;
let timer;

/* Start an interval timer that continually checks if displays should be moved */
function startTimerInterval() {
    timer = setInterval(() => {
        let hit = null;
        if (!!imodel.ghost && (hit = model.checkImageHit(mouseX, mouseY)) && hit !== imodel.ghost) {
            model.moveDisplay(imodel.ghost, hit);
        }
    }, 2000);
}

function mouseMoved(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse moved at ${mx}, ${my}`)
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (my < scrollY) {
                currentState = STATE.OUT_OF_BOUNDS;
            } else if (hit = model.checkBenchmarkHit(mx, my)) {
                imodel.highlightConfig(hit.name);
            } else {
                imodel.unhighlightConfig();
            }
            break;
        case STATE.OUT_OF_BOUNDS:
            if (my > scrollY) currentState = STATE.READY;
            break;
    }
}

function mouseDragged(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse dragged at ${mx}, ${my}`)
    let hit = null;
    switch (currentState) {
        case STATE.FOCUSED:
            model.setIndexFromMouse(imodel.focused, mx);
            break;
        case STATE.START_FOCUSED:
            model.setStartFromMouse(imodel.focused, mx);
            break;
        case STATE.END_FOCUSED:
            model.setEndFromMouse(imodel.focused, mx);
            break;
        case STATE.PREPARE_SELECT:
            if (hit = model.checkImageHit(mx, my)) {
                imodel.setGhost(hit);
                currentState = STATE.GHOSTING;
                clearInterval(timer);
                startTimerInterval();
            } else {
                currentState = STATE.READY;
            }
            break;
        case STATE.PREPARE_MOVE:
        case STATE.PREPARE_OVERLAY:
            if (!(hit = model.checkImageHit(mx, my))) {
                currentState = STATE.GHOSTING;
            }
            imodel.updateGhost();
            break;
        case STATE.GHOSTING:
            if (hit = model.checkImageHit(mx, my)) {
                if (imodel.ghost instanceof Overlay || hit instanceof Overlay) {
                    currentState = STATE.PREPARE_MOVE;
                } else if (hit instanceof Display) {
                    currentState = STATE.PREPARE_OVERLAY;
                }
            }
            imodel.updateGhost();
            break;
    }
}

function mousePressed(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse pressed at ${mx}, ${my}`);
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (imodel.highlightedConfig) {
                model.loadConfig(imodel.highlightedConfig);
            } else if (hit = model.checkScrollbarHit(mx, my)) {
                imodel.setFocused(hit);
                let startFocused = !imodel.focused.checkMainPositionHit(mx) && imodel.focused.checkStartHit(mx);
                let endFocused = !imodel.focused.checkMainPositionHit(mx) && !imodel.focused.checkStartHit(mx) && imodel.focused.checkEndHit(mx);
                if (startFocused) {
                    currentState = STATE.START_FOCUSED;
                } else if (endFocused) {
                    currentState = STATE.END_FOCUSED;
                } else {
                    currentState = STATE.FOCUSED;
                }
            } else if (hit = model.checkImageHit(mx, my)) {
                if (event.which === 1) {
                    currentState = STATE.PREPARE_SELECT;
                } else if (event.which === 2) {
                    event.preventDefault();
                    console.log("PANNING INITIATED");
                    // currentState = STATE.PANNING;
                    currentState = STATE.READY;
                }
            }
            break;
    }

}

function mouseReleased(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse released at ${mx}, ${my}`);
    let hit = null;
    switch (currentState) {
        case STATE.FOCUSED:
        case STATE.START_FOCUSED:
        case STATE.END_FOCUSED:
            imodel.setFocused(null);
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_SELECT:
            if (hit = model.checkImageHit(mx, my)) {
                imodel.select(hit);
            }
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_MOVE:
            if (hit = model.checkImageHit(mx, my)) {
                if (hit !== imodel.ghost) {
                    model.moveDisplay(imodel.ghost, hit);
                }
            }
            clearInterval(timer);
            imodel.setGhost(null);
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_OVERLAY:
            if (hit = model.checkImageHit(mx, my)) {
                if (hit !== imodel.ghost) {
                    let column = model.displays.length % model.displaysPerRow;
                    let row = Math.floor(model.displays.length / model.displaysPerRow);
                    let overlay = new Overlay(
                        generateOverlayId(model, getDisplayNameFromId(imodel.ghost.id), getDisplayNameFromId(hit.id)),
                        PADDING + column * (PADDING * 3 + DISPLAY_WIDTH),
                        PADDING + row * (PADDING * 3 + DISPLAY_HEIGHT + SCROLLBAR_HEIGHT),
                        DISPLAY_WIDTH,
                        DISPLAY_HEIGHT,
                        PADDING,
                        SCROLLBAR_HEIGHT,
                        imodel.ghost.frames,
                        imodel.ghost.timestamps,
                        imodel.ghost.images,
                        hit.images
                    );
                    model.addOverlay(overlay, hit);
                    imodel.select(overlay);
                }
            }
            clearInterval(timer);
            imodel.setGhost(null);
            currentState = STATE.READY;
        case STATE.GHOSTING:
            clearInterval(timer);
            imodel.setGhost(null);
            currentState = STATE.READY;
            break;
    }
}

function _attachHeaderListeners() {
    /* Upload header functions */
    document.getElementById("uploadButton")?.addEventListener("click", e => {
        let dataset = document.getElementById("uploadSelect")?.value;
        if (!!dataset && dataset !== "---") {
            model.incrementLoading();
            const start = performance.now();
            console.log(`Beginning load of ${dataset}...`);
            loader.initDatasetLoad(
                dataset,
                loadObj => {
                    model.decrementLoading();
                    console.log(
                        `Finished loading ${dataset} in ${Math.floor(performance.now() - start)}ms. \
                        \nLoaded ${loadObj.frames.length} frames. \
                        \nLoaded ${loadObj.timestamps.length} timestamps. \
                        \nLoaded ${loadObj.images.length} images.`);

                    let column = model.displays.length % model.displaysPerRow;
                    let row = Math.floor(model.displays.length / model.displaysPerRow);
                    let display = new Display(
                        generateDisplayId(model, loadObj.name),
                        PADDING + column * (PADDING * 3 + DISPLAY_WIDTH),
                        PADDING + row * (PADDING * 3 + DISPLAY_HEIGHT + SCROLLBAR_HEIGHT),
                        DISPLAY_WIDTH,
                        DISPLAY_HEIGHT,
                        PADDING,
                        SCROLLBAR_HEIGHT,
                        loadObj.frames,
                        loadObj.timestamps,
                        loadObj.images,
                        model.globalScrollbar.index
                    );
                    model.addDisplay(display);
                    imodel.select(display);
                },
                err => {
                    console.error(err);
                    alert("Error: there were issues loading the video, please try again.");
                    model.decrementLoading();
                }
            )
        }
    });

    /* Global header functions */
    document.getElementById("loadConfigButton")?.addEventListener("click", e => {
        let configName = document.getElementById("configSelect")?.value;
        if (!!configName) {
            model.loadConfig(configName);
        }
    });
    document.getElementById("saveConfigButton")?.addEventListener("click", e => {
        model.addConfig();
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
        }
    });
    document.getElementById("opacityInput")?.addEventListener("input", e => {
        if (imodel.selection !== null) {
            imodel.setOpacity(e.target.value);
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
    });
}

function _attachUserEventListeners() {
    document.addEventListener("scroll", e => {
        model.setGlobalScrollbarLocation(0, innerHeight + scrollY - HEADER_HEIGHT - 40);
    });
}