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

/* p5.js function that is called to load things before setup is called */
function preload() {
    model = new Model();
    imodel = new iModel();
    model.loadDatasets().then(() => model.loadSnapshots()).then(() => _setupTutorials());
}

/* p5.js function that is called when the application starts up (after preload) */
function setup() {
    createCanvas(model.canvasWidth, model.canvasHeight);

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

    noLoop();
}

/* p5.js function that acts as the draw loop */
function draw() { }

/* Setup the tutorials sidebar depending on the tutorial we are currently in. */
function _setupTutorials() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tutorial = urlParams.get("tutorial");
    const tutorialContent = document.getElementById("tutorialContent");
    const snapshot = model.snapshots.find(snapshot => snapshot.name === `tutorial-${tutorial}`);
    if (snapshot) model.loadSnapshot(snapshot);
    switch (tutorial) {
        case "1":
            tutorialContent.innerHTML = tutorial1;
            model.toggleTutorials();
            pinoLog("info", "Beginning tutorial 1");
            break;
        case "2":
            tutorialContent.innerHTML = tutorial2;
            model.toggleTutorials();
            pinoLog("info", "Beginning tutorial 2");
            break;
        case "3":
            tutorialContent.innerHTML = tutorial3;
            model.toggleTutorials();
            pinoLog("info", "Beginning tutorial 3");
            break;
        case "4":
            tutorialContent.innerHTML = tutorial4;
            model.toggleTutorials();
            pinoLog("info", "Beginning tutorial 4");
            break;
        default:
            tutorialContent.innerHTML = tutorial0;
            pinoLog("info", "Opened home page with no tutorial set");
            break;
    }
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
    PREPARE_OVERLAY: "prepareOverlay",
    PANNING: "panning",
    SCALING: "scaling",
    COMPARE_SLIDING: "compareSliding",
    USING_MAGIC: "usingMagic",
    SHADOW_MARKER: "shadowMarker",
    COINCIDENT_POINTING: "coincidentPointing",
    UNPADDED: "unpadded",
    NO_RIGHT_CLICK: "noRightClick",
}
let currentState = STATE.READY;
let moveTimer;
let cyclingTimers = {};
let playingTimers = {};
let previousX;
let previousY;

let savedSelection = null;

/* Start an interval timer that continually checks if displays should be moved */
function startTimedMoveInterval() {
    clearInterval(moveTimer);
    moveTimer = setInterval(() => {
        let hit = null;
        if (!!imodel.ghost && (hit = model.checkGridCellHit(mouseX, mouseY)) >= 0 && hit !== imodel.ghost) {
            model.moveDisplay(imodel.ghost, hit);
            pinoLog("trace", "Two second timer fired, moving display");
        }
    }, 2000);
}

/* Start an interval timer that continually checks if displays  */
function startAutoCycleInterval(overlay) {
    clearInterval(cyclingTimers[overlay.id]);
    cyclingTimers[overlay.id] = setInterval(() => {
        switch (currentState) {
            case STATE.READY:
            case STATE.UNPADDED:
                model.cycleLayers(overlay);
                break;
        }
    }, 1000);
}

/* Start an interval timer that "plays" the selected. */
function startPlayInterval(scrollbar) {
    clearInterval(playingTimers[scrollbar.id]);
    const frameRate = 30;
    const msFrameRate = 1000 / frameRate;
    playingTimers[scrollbar.id] = setInterval(() => {
        switch (currentState) {
            case STATE.READY:
            case STATE.COMPARE_SLIDING:
            case STATE.USING_MAGIC:
            case STATE.UNPADDED:
            case STATE.OUT_OF_BOUNDS:
                if (scrollbar.index + 1 === scrollbar.getSize()) {
                    clearInterval(playingTimers[scrollbar.id]);
                    delete playingTimers[scrollbar.id];
                } else {
                    model.setIndex(scrollbar, scrollbar.index + 1);
                }
                break;
        }
    }, Math.floor(msFrameRate / model.playSpeed));
}

/* Clear all playing interval timers and empty the timer object */
function clearAllPlayingIntervals() {
    Object.keys(playingTimers).forEach(id => clearInterval(playingTimers[id]));
    playingTimers = {};
}

function mouseMoved(event, mx = mouseX, my = mouseY) {
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (my < scrollY) {
                currentState = STATE.OUT_OF_BOUNDS;
            } else {
                if (hit = model.checkCornerHit(mx, my)) {
                    imodel.setCursor("nwse-resize");
                } else if (hit = model.checkComparisonSliderHit(mx, my)) {
                    imodel.setCursor(hit.mode === "horizontal" ? "ns-resize" : "ew-resize");
                } else {
                    imodel.setCursor("default");
                }
                hit = model.checkScrollbarHit(mx, my);
                imodel.highlightScrollbar(hit);
                if (hit !== null) {
                    model.findAllScrollbars().forEach(scrollbar => {
                        if (scrollbar.links.includes(hit)) imodel.highlightScrollbar(scrollbar, true);
                    });
                }
                hit = model.checkBenchmarkHit(mx, my);
                imodel.highlightSnapshot(hit);
                /* Only want to highlight annotation if no benchmarks are highlighted */
                hit = hit === null ? model.checkAnnotationHit(mx, my) : null;
                imodel.highlightAnnotation(hit);
            }
            break;
        case STATE.OUT_OF_BOUNDS:
            if (my > scrollY) {
                if (model.unpadded) {
                    currentState = STATE.UNPADDED;
                } else {
                    currentState = STATE.READY;
                }
            }
            break;
    }
}

function mouseDragged(event, mx = mouseX, my = mouseY) {
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
                model.setGridActive(true);
                startTimedMoveInterval();
            } else {
                currentState = STATE.READY;
            }
            break;
        case STATE.PREPARE_OVERLAY:
            if (!(hit = model.checkImageHit(mx, my))) {
                currentState = STATE.GHOSTING;
                model.setGridActive(true);
            }
            imodel.updateGhost();
            break;
        case STATE.GHOSTING:
            if (hit = model.checkImageHit(mx, my)) {
                if (hit instanceof Display && !(imodel.ghost instanceof Overlay) && (!hit.mode || hit.mode === "overlay")) {
                    currentState = STATE.PREPARE_OVERLAY;
                }
            }
            imodel.updateGhost();
            break;
        case STATE.PANNING:
            if (imodel.selection !== null) {
                let dx = mouseX - previousX;
                let dy = mouseY - previousY;
                if (event.ctrlKey) model.panAll(dx, dy);
                else imodel.pan(dx, dy);
            }
            previousX = mouseX;
            previousY = mouseY;
            break;
        case STATE.SCALING:
            if (imodel.selection !== null) {
                let scaleFactor = (imodel.selection.width + (mouseX - previousX)) / imodel.selection.width;
                if (model.layoutType === "static") {
                    if ((imodel.selection.width + imodel.selection.padding * 2) * scaleFactor > model.cellWidth ||
                        (imodel.selection.height + imodel.selection.padding * 2 + imodel.selection.scrollbarHeight * imodel.selection.scrollbars.length) * scaleFactor > model.cellHeight) {
                            scaleFactor = 1;
                        }
                }
                if (event.ctrlKey) model.scaleAll(scaleFactor);
                else imodel.scale(scaleFactor);
                model.updateCanvas();
            }
            previousX = mouseX;
            previousY = mouseY;
            break;
        case STATE.COMPARE_SLIDING:
            if (imodel.selection !== null) {
                imodel.setComparisonSliderValue(mouseX, mouseY);
            }
            break;
        case STATE.USING_MAGIC:
            if (imodel.selection !== null) {
                imodel.setMagicLensLocation(mouseX, mouseY);
            }
            break;
    }
    /* Highlighted objects are unhighlighted on drag */
    imodel.highlightSnapshot(null);
    imodel.highlightAnnotation(null);
}

function mousePressed(event, mx = mouseX, my = mouseY) {
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (hit = model.checkScrollbarHit(mx, my)) {
                imodel.setFocused(hit);
                /* Clear playing timers when scrubbing */
                clearAllPlayingIntervals();
                let startFocused = !imodel.focused.checkMainPositionHit(mx) && imodel.focused.checkStartHit(mx);
                let endFocused = !imodel.focused.checkMainPositionHit(mx) && !imodel.focused.checkStartHit(mx) && imodel.focused.checkEndHit(mx);
                if (startFocused) {
                    currentState = STATE.START_FOCUSED;
                    if (event.which === 3) {
                        model.setStart(imodel.focused, imodel.focused.index);
                        imodel.setFocused(null);
                        currentState = STATE.NO_RIGHT_CLICK;
                        pinoLog("trace", "Snapped start position to video position");
                    } else {
                        model.setStartFromMouse(imodel.focused, mx);
                        pinoLog("trace", "Adjusting start position");
                    }
                } else if (endFocused) {
                    currentState = STATE.END_FOCUSED;
                    if (event.which === 3) {
                        model.setEnd(imodel.focused, imodel.focused.index);
                        imodel.setFocused(null);
                        currentState = STATE.NO_RIGHT_CLICK;
                        pinoLog("trace", "Snapped end position to video position");
                    } else {
                        model.setEndFromMouse(imodel.focused, mx);
                        pinoLog("trace", "Adjusting end position");
                    }
                } else {
                    if (event.which === 3) {
                        imodel.setFocused(null);
                        currentState = STATE.NO_RIGHT_CLICK;
                    } else {
                        currentState = STATE.FOCUSED;
                        model.setIndexFromMouse(imodel.focused, mx);
                        pinoLog("trace", "Scrubbing video");
                    }
                }
            } else if (event.which === 1 && (hit = model.checkImageHit(mx, my))) {
                if (event.altKey) {
                    event.preventDefault();
                    previousX = mouseX;
                    previousY = mouseY;
                    currentState = STATE.PANNING;
                    if (imodel.selection !== hit) imodel.select(hit);
                    pinoLog("trace", "Panning display viewport");
                } else {
                    if (model.checkComparisonSliderHit(mx, my)) {
                        currentState = STATE.COMPARE_SLIDING;
                        if (imodel.selection !== hit) imodel.select(hit);
                        pinoLog("trace", "Adjusting comparison slider location");
                    } else if (model.checkMagicLensHit(mx, my)) {
                        currentState = STATE.USING_MAGIC;
                        if (imodel.selection !== hit) imodel.select(hit);
                        pinoLog("trace", "Adjusting magic lens location");
                    } else {
                        currentState = STATE.PREPARE_SELECT;
                    }
                }
            } else if (hit = model.checkCornerHit(mx, my)) {
                previousX = mouseX;
                previousY = mouseY;
                currentState = STATE.SCALING;
                model.setGridActive(true);
                if (imodel.selection !== hit) imodel.select(hit);
                pinoLog("trace", "Scaling display size");
            }
            break;
        case STATE.SHADOW_MARKER:
            if (hit = model.checkImageHit(mx, my)) {
                imodel.addShadowMarker({
                    widthRatio: (mx - (hit.x + hit.padding)) / hit.width,
                    heightRatio: (my - (hit.y + hit.padding)) / hit.height,
                });
                pinoLog("trace", `Added a shadow marker at width ratio: ${widthRatio} and height ratio: ${heightRatio}`);
            }
            break;
        case STATE.COINCIDENT_POINTING:
            if (hit = model.checkImageHit(mx, my)) {
                imodel.addCoincidentPoint(hit, mx, my);
                pinoLog("trace", `Added coincident point at (${mx},${my})`);
            }
            break;
    }

}

function mouseReleased(event, mx = mouseX, my = mouseY) {
    let hit = null;
    switch (currentState) {
        case STATE.FOCUSED:
        case STATE.START_FOCUSED:
        case STATE.END_FOCUSED:
            if (hit = model.checkScrollbarHit(mx, my)) {
                if (imodel.highlightedSnapshot) {
                    pinoLog("trace", `Loading snapshot: ${imodel.highlightSnapshot.name}`);
                    model.loadSnapshot(imodel.highlightedSnapshot);
                } else if (imodel.highlightedAnnotation) {
                    pinoLog("trace", `Loading annotation at index ${imodel.highlightedAnnotation.index} from scrollbar: ${hit.id}`);
                    imodel.loadAnnotation(hit, imodel.highlightedAnnotation);
                }
            }
            imodel.setFocused(null);
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_SELECT:
            if (hit = model.checkImageHit(mx, my)) {
                imodel.select(hit);
                pinoLog("trace", `Selected display: ${hit.id}`);
            }
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_OVERLAY:
            if (hit = model.checkImageHit(mx, my)) {
                if (hit !== imodel.ghost) {
                    if (hit instanceof Overlay) {
                        model.addLayer(hit, imodel.ghost);
                        pinoLog("trace", "Added new layer to overlay");
                    } else {
                        pinoLog("trace", "Generating new overlay video");
                        model.addOverlay(hit.id, imodel.ghost.id, hit.getLayerFilter(), imodel.ghost.getLayerFilter())
                            .then(overlay => imodel.select(overlay));
                    }
                }
            }
            clearInterval(moveTimer);
            imodel.setGhost(null);
            currentState = STATE.READY;
        case STATE.GHOSTING:
            if (!!imodel.ghost && (hit = model.checkGridCellHit(mx, my)) >= 0) {
                model.moveDisplay(imodel.ghost, hit);
                pinoLog("trace", "Moved display to empty cell");
            }
            clearInterval(moveTimer);
            imodel.setGhost(null);
            model.setGridActive(false);
            currentState = STATE.READY;
            break;
        case STATE.SCALING:
            currentState = STATE.READY;
            model.setGridActive(false);
            break;
        case STATE.NO_RIGHT_CLICK:
        case STATE.SHADOW_MARKER:
        case STATE.COINCIDENT_POINTING:
        case STATE.UNPADDED:
            break;
        default:
            currentState = STATE.READY;
            break;
    }
}

function mouseWheel(event, mx = mouseX, my = mouseY) {
    switch (currentState) {
        case STATE.READY:
            let hit;
            if (event.altKey && (hit = model.checkImageHit(mx, my))) {
                event.preventDefault();
                event.stopPropagation();
                if (event.ctrlKey) model.zoomAll(event.delta);
                else imodel.zoom(hit, event.delta);
                if (event.ctrlKey) pinoLog("trace", `Zoomed all displays with delta ${event.delta}`);
                else pinoLog("trace", `Zoomed display with delta ${event.delta}`);
                return false;
            }
            break;
    }
}

function windowResized(event) {
    model.updateCanvas();
    pinoLog("trace", `Window resized, new dimensions: ${windowWidth, windowHeight}`);
}

function keyPressed(event, mx = mouseX, my = mouseY) {
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (keyCode === TAB) {
                /* Handle tab key pressed events */
                if (imodel.selection instanceof Overlay) {
                    const overlay = imodel.selection;
                    if (Object.keys(cyclingTimers).includes(overlay.id)) {
                        clearInterval(cyclingTimers[overlay.id]);
                        delete cyclingTimers[overlay.id];
                        pinoLog("trace", "Stopped an auto-cycling interval");
                    } else {
                        if (event.shiftKey) {
                            startAutoCycleInterval(overlay);
                            pinoLog("trace", "Began new auto-cycling interval");
                        } else {
                            model.cycleLayers(overlay);
                            pinoLog("trace", "Cycled overlay layers");
                        }
                    }
                    return false;
                }
            } else if (keyCode === 189) {
                /* Handle dash key pressed events */
                if (imodel.selection instanceof Overlay) {
                    const mode = imodel.selection.mode === "horizontal" ? "overlay" : "horizontal";
                    imodel.setMode(mode);
                    pinoLog("trace", `Switched overlay display to ${mode} mode`);
                    return false;
                }
            } else if (keyCode === 220) {
                /* Handle backslash key pressed events */
                if (imodel.selection instanceof Overlay) {
                    const mode = imodel.selection.mode === "vertical" ? "overlay" : "vertical";
                    imodel.setMode(mode);
                    pinoLog("trace", `Switched overlay display to ${mode} mode`);
                    return false;
                }
            } else if (keyCode === 48) {
                /* Handle '0' key pressed events */
                if (imodel.selection instanceof Overlay) {
                    const mode = imodel.selection.mode === "magic_lens" ? "overlay" : "magic_lens";
                    imodel.setMode(mode);
                    pinoLog("trace", `Switched overlay display to ${mode} mode`);
                    return false;
                }
            } else if (keyCode === 32) {
                /* Handle spacebar key pressed events */
                let scrollbar = model.globalScrollbar;
                let playingIds = Object.keys(playingTimers);
                if (imodel.selection !== null && !event.ctrlKey && !playingIds.includes(model.globalScrollbar.id)) {
                    scrollbar = imodel.selection.getMainScrollbar();
                } else if (!playingIds.includes(scrollbar.id)) {
                    /* Ensure no other timers are running when the global scrollbar starts playing */
                    clearAllPlayingIntervals();
                }
                if (playingIds.includes(scrollbar.id)) {
                    clearInterval(playingTimers[scrollbar.id]);
                    delete playingTimers[scrollbar.id];
                    pinoLog("trace", `Stopped auto-playing scrollbar with id: ${scrollbar.id}`);
                } else {
                    if (scrollbar.index === scrollbar.getSize() - 1) model.setIndex(scrollbar, 0);
                    startPlayInterval(scrollbar);
                    pinoLog("trace", `Began new auto-playing interval on scrollbar with id: ${scrollbar.id}`)
                }
                return false;
            } else if (keyCode === DELETE) {
                /* Handle delete key pressed events */
                if (imodel.highlightedAnnotation && (hit = model.checkScrollbarHit(mx, my))) {
                    imodel.removeAnnotation(hit, imodel.highlightedAnnotation);
                    pinoLog("trace", `Removed annotation at index ${imodel.highlightedAnnotation.index} from scrollbar: ${hit.id}`);
                    return false;
                } else if (imodel.selection !== null) {
                    model.removeDisplay(imodel.selection);
                    pinoLog("trace", `Removed display with id ${imodel.selection.id}`);
                    imodel.select(imodel.selection); /* Need to unselect display */
                    return false;
                }
            } else if (keyCode === 190) {
                /* Handle period key pressed events */
                imodel.setCursor("crosshair");
                currentState = STATE.SHADOW_MARKER;
                pinoLog("trace", "Entered shadow marker mode");
                return false;
            } else if (keyCode === 188) {
                /* Handle comma key pressed events */
                imodel.setCursor("pointer");
                currentState = STATE.COINCIDENT_POINTING;
                pinoLog("trace", "Entered coincident pointing mode");
                return false;
            } else if (keyCode === 82) {
                /* Handle 'r' key pressed events */
                clearAllPlayingIntervals();
                model.setIndex(model.globalScrollbar, 0);
                model.displays.forEach(display => model.setIndex(display.getMainScrollbar(), 0));
            } else if (keyCode >= 49 && keyCode <= 56) {
                /* Handle 1-8 key pressed events */
                const colour = getAnnotationColour(keyCode);
                if (hit = model.checkScrollbarHit(mx, my)) {
                    if (imodel.highlightedAnnotation) {
                        imodel.updateAnnotation(hit, imodel.highlightedAnnotation, colour);
                        pinoLog("trace", `Updated annotation at index ${imodel.highlightedAnnotation.index} in scrollbar: ${hit.id}`);
                    } else if (hit.checkMainPositionHit(mx)) {
                        if (imodel.addAnnotation(hit, colour)) {
                            pinoLog("trace", `Created annotation at current position in scrollbar: ${hit.id}`);
                        } else {
                            pinoLog("error", `Error: could not create annotation at current position in scrollbar: ${hit.id}`)
                        }
                    } else {
                        const index = model.getIndexFromMouse(hit, mx);
                        if (imodel.addAnnotation(hit, colour, index)) {
                            pinoLog("trace", `Created annotation at index ${index} in scrollbar: ${hit.id}`);
                        } else {
                            pinoLog("error", `Error: could not create annotation at index ${index} in scrollbar: ${hit.id}`)
                        }
                    }
                }
                return false;
            } else if (keyCode === 69) {
                /* Handle 'e' key pressed events */
                model.togglePadding();
                currentState = STATE.UNPADDED;
                if (imodel.selection !== null) {
                    savedSelection = imodel.selection;
                    imodel.select(imodel.selection);
                }
                pinoLog("trace", `Toggled display padding ${model.unpadded ? "off" : "on"}`);
                return false;
            }
            break;
        case STATE.UNPADDED:
            if (keyCode === 32) {
                /* Handle unpadded spacebar key pressed events */
                let scrollbar = model.globalScrollbar;
                const playingIds = Object.keys(playingTimers);
                if (!playingIds.includes(scrollbar.id)) {
                    /* Ensure no other timers are running when the global scrollbar starts playing */
                    clearAllPlayingIntervals();
                }
                if (playingIds.includes(scrollbar.id)) {
                    clearInterval(playingTimers[scrollbar.id]);
                    delete playingTimers[scrollbar.id];
                    pinoLog("trace", `Stopped auto-playing scrollbar with id: ${scrollbar.id}`);
                } else {
                    if (scrollbar.index === scrollbar.getSize() - 1) model.setIndex(scrollbar, 0);
                    startPlayInterval(scrollbar);
                    pinoLog("trace", `Began new auto-playing interval on scrollbar with id: ${scrollbar.id}`)
                }
                return false;
            } else if (keyCode === 82) {
                /* Handle unpadded 'r' key pressed events */
                clearAllPlayingIntervals();
                model.setIndex(model.globalScrollbar, 0);
                model.displays.forEach(display => model.setIndex(display.getMainScrollbar(), 0));
            } else if (keyCode === 69) {
                /* Handle unpadded 'e' key pressed events */
                model.togglePadding();
                currentState = STATE.READY;
                if (savedSelection !== null) {
                    imodel.select(savedSelection);
                    savedSelection = null;
                }
                pinoLog("trace", `Toggled display padding ${model.unpadded ? "off" : "on"}`);
                return false;
            }
            break;
        case STATE.SHADOW_MARKER:
            if (keyCode === 190) {
                /* Handle shadow marker period key pressed events */
                imodel.setCursor("default");
                currentState = STATE.READY;
                pinoLog("trace", "Exited shadow marker mode");
                return false;
            } else if (keyCode === 188) {
                /* Handle shadow marker comma key pressed events */
                imodel.setCursor("pointer");
                currentState = STATE.COINCIDENT_POINTING;
                pinoLog("trace", "Entered coincident pointing mode via shadow marker mode");
                return false;
            } else if (keyCode === DELETE) {
                /* Handle shadow marker delete key pressed events */
                imodel.clearShadowMarkers();
                pinoLog("trace", "Cleared shadow markers");
                return false;
            }
            break;
        case STATE.COINCIDENT_POINTING:
            if (keyCode === 188) {
                /* Handle coincident points comma key pressed events */
                imodel.setCursor("default");
                imodel.clearCoincidentPoints();
                currentState = STATE.READY;
                pinoLog("trace", "Exited coincident pointing mode");
                return false;
            } else if (keyCode === 190) {
                /* Handle coincident points period key pressed events */
                imodel.setCursor("crosshair");
                currentState = STATE.SHADOW_MARKER;
                pinoLog("trace", "Exited shadow marker mode");
                return false;
            } else if (keyCode === DELETE) {
                /* Handle coincident points delete key pressed events */
                imodel.clearCoincidentPoints();
                pinoLog("trace", "Cleared coincident points");
                return false;
            }
    }
}

function _attachHeaderListeners() {
    /* Upload header functions */
    document.getElementById("uploadButton")?.addEventListener("click", async e => {
        let value = document.getElementById("uploadSelect")?.value;
        if (value.includes(" ***")) value = value.replace(" ***", "");
        const datasets = model.datasets.filter(dataset => dataset.containsImages && dataset.dir.startsWith(value));
        for (let i = 0; i < datasets.length; i++) {
            await model.addDisplay(datasets[i], "").then(display => imodel.select(display));
        }
    });

    /* Global header functions */
    document.getElementById("dynamicLayoutCheckbox")?.addEventListener("click", e => {
        model.setLayoutType("dynamic");
        pinoLog("trace", "Switched to dynamic layout mode");
    });
    document.getElementById("staticLayoutCheckbox")?.addEventListener("click", e => {
        model.setLayoutType("static");
        pinoLog("trace", "Switched to static layout mode");
    });
    document.getElementById("loadSnapshotButton")?.addEventListener("click", e => {
        let snapshotName = document.getElementById("snapshotSelect")?.value;
        let snapshot = model.snapshots.find(snapshot => snapshot.name === snapshotName);
        if (!!snapshot) {
            model.loadSnapshot(snapshot);
        }
    });
    document.getElementById("saveSnapshotButton")?.addEventListener("click", e => {
        model.addSnapshot();
    });
    document.getElementById("normalizeCheckbox")?.addEventListener("change", e => {
        model.setNormalized(e.target.checked);
        pinoLog("trace", `Toggled normalization ${model.normalized ? "on" : "off"}`)
    });
    document.getElementsByClassName("speedInput")?.forEach(speedInput => speedInput.addEventListener("click", e => {
        let playSpeed = 1.0;
        switch (e.target.id) {
            case "speedInput1":
                playSpeed = 0.5;
                break;
            case "speedInput2":
                playSpeed = 1.0;
                break;
            case "speedInput3":
                playSpeed = 1.5;
                break;
            case "speedInput4":
                playSpeed = 2.0;
                break;
            default:
                break;
        }
        model.setPlaySpeed(playSpeed);
        model.findAllScrollbars().forEach(scrollbar => {
            if (Object.keys(playingTimers).includes(scrollbar.id)) startPlayInterval(scrollbar);
        });
        pinoLog("trace", `Set play speed to ${playSpeed}`);
    }));

    /* Individual display header functions */
    document.getElementById("stampCheckbox").addEventListener("change", e => {
        model.toggleTimestamps();
        pinoLog("trace", `Toggled timestamps ${model.showTimestamps ? "on" : "off"}`)
    })
    document.getElementById("lockCheckbox").addEventListener("change", e => {
        let checked = e.target.checked;
        imodel.setLocked(checked);
        if (imodel.selection !== null) pinoLog("trace", `Locked display: ${imodel.selection.id}`);
    });
    document.getElementById("filterSelect").addEventListener("change", e => {
        let value = e.target.value;
        let filterName = e.target.value;
        if (value !== "Select filter" && imodel.selection !== null) {
            if (value === "Reset") {
                filterName = "";
            }
            model.filterImages(imodel.selection, filterName);
            pinoLog("trace", `Filtered video display: ${imodel.selection.id} with filter: ${value}`);
        }
    });
    document.getElementById("removeButton")?.addEventListener("click", e => {
        if (imodel.selection !== null) {
            model.removeDisplay(imodel.selection);
            pinoLog("trace", `Removed display with id ${imodel.selection.id}`);
            imodel.select(imodel.selection); /* Need to unselect display */
        }
    });
    document.getElementById("opacityInput")?.addEventListener("input", e => {
        if (imodel.selection !== null) {
            imodel.setOpacity(e.target.value);
        }
    });
    document.getElementById("opacityInput")?.addEventListener("mouseup", e => {
        pinoLog("trace", "Adjusted opacity input");
    });
    document.getElementById("tutorialSidebar")?.addEventListener("click", e => {
        model.toggleTutorials();
        pinoLog("trace", `${model.tutorialsOpen ? "Opened" : "Closed"} tutorials tab`);
    });
    document.getElementById("defaultCanvas0")?.addEventListener("contextmenu", e => {
        switch (currentState) {
            case STATE.NO_RIGHT_CLICK:
                e.preventDefault();
                currentState = STATE.READY;
                break;
        }
    });
}

function _attachUserEventListeners() {
    document.addEventListener("scroll", e => {
        model.setGlobalScrollbarLocation(0, innerHeight + scrollY - model.headerHeight - model.globalScrollbarHeight);
    });
}