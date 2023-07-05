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
    model.loadSnapshots();
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
    RESIZING: "resizing",
}
let currentState = STATE.READY;
let moveTimer, cycleTimer;
let cycling = false;
let previousX;
let previousY;

/* Start an interval timer that continually checks if displays should be moved */
function startTimedMoveInterval() {
    clearInterval(moveTimer);
    moveTimer = setInterval(() => {
        let hit = null;
        if (!!imodel.ghost && (hit = model.checkGridCellHit(mouseX, mouseY)) >= 0 && hit !== imodel.ghost) {
            model.moveDisplay(imodel.ghost, hit);
        }
    }, 2000);
}

/* Start an interval timer that continually checks if displays  */
function startAutoCycleInterval() {
    clearInterval(cycleTimer);
    cycling = true;
    cycleTimer = setInterval(() => {
        console.log("Cycled!");
    }, 1000);
}

function mouseMoved(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse moved at ${mx}, ${my}`)
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (my < scrollY) {
                currentState = STATE.OUT_OF_BOUNDS;
            } else {
                hit = model.checkCornerHit(mx, my)
                imodel.setCursor(hit ? "nwse-resize" : "default");
                hit = model.checkBenchmarkHit(mx, my);
                imodel.highlightSnapshot(hit);
                /* Only want to highlight annotation if no benchmarks are highlighted */
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
                startTimedMoveInterval();
            } else {
                currentState = STATE.READY;
            }
            break;
        case STATE.PREPARE_OVERLAY:
            if (!(hit = model.checkImageHit(mx, my))) {
                currentState = STATE.GHOSTING;
            }
            imodel.updateGhost();
            break;
        case STATE.GHOSTING:
            if (hit = model.checkImageHit(mx, my)) {
                if (hit instanceof Display && !(hit instanceof Overlay) && !(imodel.ghost instanceof Overlay)) {
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
        case STATE.RESIZING:
            if (imodel.selection !== null) {
                let dx = mouseX - previousX;
                let dy = mouseY - previousY;
                if (dx + imodel.selection.width + imodel.selection.padding * 2 > model.cellWidth) dx = 0;
                if (dy + imodel.selection.height + imodel.selection.padding * 2 + imodel.selection.scrollbarHeight * imodel.selection.scrollbars.length > model.cellHeight) dy = 0;
                imodel.resize(dx, dy);
            }
            previousX = mouseX;
            previousY = mouseY;
            break;
    }
    /* Highlighted objects are unhighlighted on drag */
    imodel.highlightSnapshot(null);
    imodel.highlightAnnotation(null);
}

function mousePressed(event, mx = mouseX, my = mouseY) {
    // console.log(`Mouse pressed at ${mx}, ${my}`);
    let hit = null;
    switch (currentState) {
        case STATE.READY:
            if (hit = model.checkScrollbarHit(mx, my)) {
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
            } else if (hit = model.checkCornerHit(mx, my)) {
                previousX = mouseX;
                previousY = mouseY;
                currentState = STATE.RESIZING;
                if (imodel.selection !== hit) imodel.select(hit);
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
            if (hit = model.checkScrollbarHit(mx, my)) {
                if (imodel.highlightedSnapshot) {
                    model.loadSnapshot(imodel.highlightedSnapshot);
                } else if (imodel.highlightedAnnotation) {
                    imodel.loadAnnotation(hit, imodel.highlightedAnnotation.name);
                }
            }
            imodel.setFocused(null);
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_SELECT:
            if (hit = model.checkImageHit(mx, my)) {
                imodel.select(hit);
            }
            currentState = STATE.READY;
            break;
        case STATE.PREPARE_OVERLAY:
            if (hit = model.checkImageHit(mx, my)) {
                if (hit !== imodel.ghost) {
                    model.addOverlay(hit.id, imodel.ghost.id, hit.filter, imodel.ghost.filter)
                        .then(overlay => imodel.select(overlay));
                }
            }
            clearInterval(moveTimer);
            imodel.setGhost(null);
            currentState = STATE.READY;
        case STATE.GHOSTING:
            if (!!imodel.ghost && (hit = model.checkGridCellHit(mx, my)) >= 0) {
                model.moveDisplay(imodel.ghost, hit);
            }
            clearInterval(moveTimer);
            imodel.setGhost(null);
            currentState = STATE.READY;
            break;
        case STATE.PANNING:
        case STATE.RESIZING:
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

function windowResized(event) {
    model.updateCanvas();
}

function keyPressed(event) {
    switch (currentState) {
        case STATE.READY:
            if (imodel.selection !== null && imodel.selection instanceof Overlay) {
                if (keyCode === TAB) {
                    if (cycling) {
                        clearInterval(cycleTimer);
                        cycling = false;
                    } else if (event.shiftKey) {
                        startAutoCycleInterval();
                    } else {
                        console.log("Cycled!");
                    }
                    return false;
                }
            }
    }
}

function _attachHeaderListeners() {
    /* Upload header functions */
    document.getElementById("uploadButton")?.addEventListener("click", e => {
        let value = document.getElementById("uploadSelect")?.value;
        model.addDisplay(value, "").then(display => imodel.select(display));
    });

    /* Global header functions */
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
            if (value === "Reset") {
                filterName = "";
            }
            model.filterImages(imodel.selection, filterName);
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
        if (imodel.selection !== null) {
            imodel.loadAnnotation(imodel.selection.getMainScrollbar(), name);
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