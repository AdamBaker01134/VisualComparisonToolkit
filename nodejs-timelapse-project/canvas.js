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
    model.loadDatasets();
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
function draw() {}

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
    PANNING: "panning",
}
let currentState = STATE.READY;
let timer;
let previousX;
let previousY;

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
            } else {
                hit = model.checkBenchmarkHit(mx, my);
                imodel.highlightConfig(hit);
                /* Only want to highlight annotation if no configs are highlighted */
                hit = hit === null ? model.checkAnnotationHit(mx, my) : null;
                imodel.highlightAnnotation(hit);
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
        case STATE.PANNING:
            if (imodel.selection !== null) {
                let dx = mouseX - previousX;
                let dy = mouseY - previousY;
                imodel.pan(dx, dy);
            }
            previousX = mouseX;
            previousY = mouseY;
            break;
    }
}

function mousePressed(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse pressed at ${mx}, ${my}`);
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (hit = model.checkScrollbarHit(mx, my)) {
                if (imodel.highlightedConfig) {
                    model.loadConfig(imodel.highlightedConfig);
                } else if (imodel.highlightedAnnotation) {
                    model.setIndex(hit, imodel.highlightedAnnotation.index);
                }
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
                    previousX = mouseX;
                    previousY = mouseY;
                    currentState = STATE.PANNING;
                    if (imodel.selection !== hit) imodel.select(hit);
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
                        model.displayPadding + column * (model.displayPadding * 3 + model.displayWidth),
                        model.displayPadding + row * (model.displayPadding * 3 + model.displayHeight + model.displayScrollbarHeight),
                        model.displayWidth,
                        model.displayHeight,
                        model.displayPadding,
                        model.displayScrollbarHeight,
                        imodel.ghost,
                        hit,
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
        case STATE.PANNING:
            currentState = STATE.READY;
            break;
    }
}

function mouseWheel(event, mx = mouseX, my = mouseY) {
    switch (currentState) {
        case STATE.READY:
            let hit;
            if (hit = model.checkImageHit(mx, my)) {
                event.preventDefault();
                event.stopPropagation();
                imodel.zoom(hit, event.delta);
            }
            break;
    }
}

function _attachHeaderListeners() {
    /* Upload header functions */
    document.getElementById("uploadButton")?.addEventListener("click", e => {
        let value = document.getElementById("uploadSelect")?.value;
        model.loadDataset(value, {
            callback: display => imodel.select(display),
        });
    });

    /* Global header functions */
    document.getElementById("loadConfigButton")?.addEventListener("click", e => {
        let configName = document.getElementById("configSelect")?.value;
        let config = model.configs.find(configuration => configuration.name === configName);
        if (!!config) {
            model.loadConfig(config);
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
    document.getElementById("filterSelect").addEventListener("change", e => {
        let value = e.target.value;
        let filterName = e.target.value;
        if (value !== "---" && imodel.selection !== null) {
            let isOverlay = imodel.selection instanceof Overlay;
            let name = isOverlay ? getSecondaryDisplayNameFromId(imodel.selection.id) : getDisplayNameFromId(imodel.selection.id);
            if (value === "Reset") {
                value = model.datasets.find(d => d.name === name).dir;
                filterName = "";
            }
            model.loadDataset(name, {
                dir: value,
                display: imodel.selection,
                filter: filterName,
            });
        }
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
    document.getElementById("loadAnnotationButton")?.addEventListener("click", e => {
        let name = document.getElementById("annotationSelect").value;
        let annotation = imodel?.selection.annotations.find(annotation => annotation.name === name);
        if (!!annotation) {
            model.setIndex(imodel.selection, annotation.index);
        }
    });
    document.getElementById("saveAnnotationButton")?.addEventListener("click", e => {
        imodel.saveAnnotation();
    });
}

function _attachUserEventListeners() {
    document.addEventListener("scroll", e => {
        model.setGlobalScrollbarLocation(0, innerHeight + scrollY - model.headerHeight - model.globalScrollbarHeight);
    });
}