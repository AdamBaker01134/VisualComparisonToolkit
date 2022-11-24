/*
 * "Main" file for timelapse web app.
 */

/*
TODO:   1. Instantiate Timelapse displays as p5 canvases? Could also do them
            as p5.Graphics elements. (Which are canvases with display="none",
            so could just remove this attribute- call show() on them or else
            directly adjust the attribute).
            - This would probably simplify the resizing operations.
            - Potentially a pretty major rewrite of the code, so only worth it
                if view mode toggling (the only time resizing occurs) is 
                considered essential.
            - Could have benefits for UI as well actually, as user events
                could be tied, at the DOM level, to the individual canvases,
                instead of having to determine where the event took place
                within the one main canvas.
        2. Control thumbnail loading a bit better?
            - After view mode toggle, if in tabbed mode, only load thumbnails
                for current tab?
            - Only worth it if view mode toggling is considered an essential
                feature, and if there's a noticeable performance hit from
                doing all the thumbnail loads at once when toggled.
        3. Convert DOM operations to pure JS, so that p5.dom.js can be removed
            as a dependency. (It can be a bit of a wonky library at times).
        4. Convert *integer* divisions by power of 2 to bitshifts. (Faster op).
        5. Decide whether to get rid of rectMode() and imageMode() & similar 
            calls, replace with initial call in setup() for settings different
            from default.
            - Less robust, as correct rendering would depend on these settings
                not being changed at all- or at least they must be reverted
                immediately after being adjusted.
            - More efficient at runtime though (but maybe only slightly).
        6. Fix buggy thumbnails.
        7. Fix buggy scrollbar render on resize.

** Check contents of all files for more TODO comments, sorry I haven't 
    centralized them all, but it should be an easy search to find them. **
*/

"use strict"; // Turn on Javascript's strict mode.

// Turn off p5's friendly error detection system to boost performance.
// Try commenting out this line when debugging.
p5.disableFriendlyErrors = true;

let canvas; // Variable for holding the canvas object.

// Arrays for holding various entities.
let plots = [];
let files = [];
let timestamps = [];
let displays = [];
let controls = [];
let tabButtons = [];

// Variables to hold the various divs we'll be using.
let setupDiv;
let sketchDiv;
let controlDiv;
let tabButtonDiv;

// The relative path of the images folder currently being used.
const IMG_PATH = './../img/'
let plotPath;
let plotSelect; // Variable for plot selection.

// Define the image dimensions. 
const FULL_WIDTH = 1280;
const FULL_HEIGHT = 720;
const GAP = 10; // The gap between elements.

// Y-axis globals for single window display.
const DISPLAY_TOP = 0;
const DISPLAY_LEFT = 0;
const DISPLAY_WIDTH = FULL_WIDTH;
const DISPLAY_HEIGHT = FULL_HEIGHT + 66; // For scrollbar, thumbnails;
const TIERED_HEIGHT = 1480;

// IDs for the displays.
const QTR_ID = 0;
const HALF_ID = 1;
const FULL_ID = 2;
const DEFAULT_LOAD_MODE = 'fill'; // Default loading scheme.

let mouseIsFocused = false;     // Whether mouse is being dragged.
let displayFocus = -1;          // Which display to show.
let tiered = true;              // Which view mode to use.
let hideControls = false;       // Whether to hide control panels.
let loadOnClick = false;        // Whether to allow load selection.

/*
 * For p5.js, runs first, before setup().
 * Initiates a loading sequence that loads the names of the available plots.
 */
function preload() {
    window.oncontextmenu = doNothing; // disable context menu;
    plots = loadStrings(IMG_PATH + 'plots.txt');
}

/*
 * For p5.js, runs once after preload().
 * For readability, I've separated the various element creation tasks into 
 *  their own functions.
 */
function setup() {
    // NOTE: In general, order of item creation is very deliberate and specific.
    //        - Has to do with HTML elements being written to the page.
    setupDiv = createElementWithID('header', '', 'setupHolder', 'setup');
    _createPlotSelection();
    _createImageInfoButton();
    _createViewModeToggleButton();
    _createHelpButton();
    _createAnnotationPanel(); // Defined in Annotation.js

    sketchDiv = createElementWithID('div', '', 'sketchHolder', 'sketch');
    _createTabButtons();
    _createP5Canvas();
    _createTimelapseDisplays();

    controlDiv = createElementWithID('footer', '', 'controlHolder', 'controls');
    _createControlPanels();

    _attachLoadListeners();
    _attachUserEventListeners();

    // This is just me being lazy about creating the displays. It's easier to
    //  create them all to be the same size, as if in 'tabbed' mode, then let
    //  this toggleViewMode() function handle the sizing.
    // Toggling twice ensures we get back to where we started.
    toggleViewMode();
    toggleViewMode();

    noLoop();   // Make sure draw loop is turned off.
}

/*
 * Attach all the event listeners pertaining to custom image load events.
 */
function _attachLoadListeners() {
    document.addEventListener('imageLoaded', addImageAndDisplay);
    document.addEventListener('loadFinished', displayLoadFinished);
    document.addEventListener('loadOrder', loadNextDisplay);
}

/*
 * Attach all the event listeners pertaining to user interaction events.
 */
function _attachUserEventListeners() {
    // WARNING: The user interactions are kinda split up and gross.
    // - This is partially because of p5, unfortunately, and the way it handles
    //      interaction, which can be weird.
    // -  A possible partial solution might be to switch to 'pointer' events
    //      instead of distinct mouse and touch events that p5 forces together.
    // - This is also because p5's 'mouseDragged' function seems to suck,
    //      so I hacked together a solution based on keeping track of whether
    //      the mouse is held down on an element inside the canvas.
    //      - displayLoadFinished() does some of this work, in addition to the 
    //          functions that more obviously do this, from their name.
    canvas.elt.onmousedown = handleMousePressed;
    window.onmousemove = handleMouseMoved;
    window.onmouseup = handleMouseReleased;
    window.onkeydown = handleKeyDown;
}

/*
 * Create the control panels at the bottom of the screen.
 */
function _createControlPanels() {
    controls[QTR_ID] = new ControlPanel( QTR_ID );
    controls[QTR_ID].setDistanceSliderValues(60, 360, 120, 30);   // min, max, default, step
    controls[QTR_ID].setHeading('Controls: quarter size');
    controls[QTR_ID].disableDistance();
    
    controls[HALF_ID] = new ControlPanel( HALF_ID );
    controls[HALF_ID].setDistanceSliderValues(10, 60, 30, 10);   // min, max, default, step
    controls[HALF_ID].setHeading('Controls: half size');

    controls[FULL_ID] = new ControlPanel( FULL_ID );
    controls[FULL_ID].setDistanceSliderValues(1, 10, 1, 1);
    controls[FULL_ID].setHeading('Controls: full size');

    // Set values that are common to all three control panels.
    controls.forEach( c => {
        c.setCapacitySliderValues(10, 200, 129, 1);
        c.setModeSelect(DEFAULT_LOAD_MODE);
        c.parent(controlDiv);
    });

    if (hideControls) controls.forEach( c => c.hide() );
}

/*
 * Function to create a button that, when clicked, shows a brief help message.
 */
function _createHelpButton() {
    let b = createButton('Help', 'help'); 
    b.parent(setupDiv);
    b.mousePressed( () => alert(
        "Controls:\n" +
        "- Left click to drag around.\n" +
        "- Right click to drag and load into next panel on release.\n" +
        "- ENTER on keyboard to load into next panel.\n" +
        "- With NUMLOCK _ON_ use numpad 4,6 to move left, right in current panel.\n" +
        "***\n" +
        "Annotations:\n" + 
        "- Will (currently) only be saved into you browser's temporary data.\n" +
        "- Created based on panel you're interacting with.\n" +
        "- You will be prompted for a name for the annotation you create.\n" +
        "- Clear button will only affect annotations for current plot.\n" +
        "- Can't load into top panel, as that panel is intended for viewing the\n" +
        "   entire image set.\n" +
        "- To load into bottom panel, click Load Panel 2 then press enter.\n" + 
        "- Loads will (currently) not be accurate near start or end of image set.\n"
    ));
}

/*
 * Function to create a button that allows access to the image information.
 */
function _createImageInfoButton() {
    // Just a simple button for now, alerts with the image data.
    let ib = createButton('Get image data', 'getImageData');
    ib.parent(setupDiv);
    ib.mousePressed( () => alert( displays[displayFocus].getImageInfo() ));
}

/*
 * Create the p5.js canvas.
 */
function _createP5Canvas() {
    canvas = createCanvas(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    canvas.parent(sketchDiv);
}

/*
 * Create the plot selection bar at the top of the screen.
 */
function _createPlotSelection() {
    // A <div> to hold these items.
    let plotDiv = createDiv('');
    plotDiv.class('plotSelection');
    plotDiv.parent(setupDiv);

    // An instruction for the user.
    let plotHeading = createP('Plot:');
    plotHeading.parent(plotDiv);

    // The dropdown menu with all items added from previously loaded list.
    plotSelect = createSelect();
    plotSelect.option('---');
    plots.forEach( p => plotSelect.option(p) );
    plotSelect.parent(plotDiv);

    // A button to begin.
    let startPlotButton = createButton('Start plot', 'startPlot');
    startPlotButton.mousePressed( startNewPlot );
    startPlotButton.parent(setupDiv);
}

/*
 * Create buttons allowing user to select which display to view.
 *
 * NOTE: The style description for these buttons is in 'pheno-timelapse.html'
 */
function _createTabButtons() {
    // A <div> to hold all this junk.
    tabButtonDiv = createDiv('');
    tabButtonDiv.style('width', FULL_WIDTH + 'px');
    tabButtonDiv.class('tabselector');
    tabButtonDiv.parent(sketchDiv);

    // Now the buttons! Whoop whoop!
    tabButtons[QTR_ID] = createButton('Top (1)', 'top');
    tabButtons[HALF_ID] = createButton('Middle (2)', 'mid');
    tabButtons[FULL_ID] = createButton('Bottom (3)', 'bottom');

    tabButtons.forEach( (t, i) => {
        t.mousePressed(assignFocus.bind(undefined, i));
        t.class('tab');
        t.parent(tabButtonDiv);
    });
}

/*
 * Create the timelapse displays.
 */
function _createTimelapseDisplays() {
    // All the displays will be the same size, although the images will be 
    // stretched from a low resolution for the first two displays.
    for (let i = 0; i < 3; i++) {
        displays.push(new TimelapseDisplay(
            DISPLAY_LEFT, DISPLAY_TOP,  // x, y
            FULL_WIDTH, FULL_HEIGHT,    // w, h
            i                           // id
        ));
    }
}

/*
 * Function to create a button that allows the user to switch between tiered
 *  and single pane views.
 */
function _createViewModeToggleButton() {
    let toggleViewButton = createButton('Toggle view mode', 'toggleViewMode');
    toggleViewButton.parent(setupDiv);
    toggleViewButton.mousePressed( toggleViewMode );
}

///////////////////////////////////////////////////////////////////////////////
// Functions in alphabetical order from here on.                             //
///////////////////////////////////////////////////////////////////////////////

/*
 * To be used in "linear" and "fill" loads.
 */
function addImageAndDisplay(e) {
    addImageToFrame(e); // Add the image.
    redrawDisplay(e);   // Redraw the display.
}

/*
 * Function to be called every time an individual image finishes loading.
 * Alerts the scrollbar that the image has loaded.
 */
function addImageToFrame({ detail: { obj, idx } }) {
    if (obj instanceof ImageWindow) {
        displays[obj.id].addSegment(idx);
    } else if (obj instanceof ThumbnailBar) {
        displays[obj.id].renderThumbnail(idx);
    } else {
        console.dir(obj);
        throw "Invalid object loaded.";
    }
}

/*
 * Assign focus to the given display.
 */
function assignFocus(id) {
    if (id > displays.length) throw 'Invalid parameter: ' + id;
    if (displayFocus === id) return;

    /* Code that makes tab switching initiate loads.
    // TODO: Decide whether to turn this feature on or not.
    //       Should only be used when in tabbed mode!!!
    //       ... it really sucks in tiered mode IMO.
    if (!tiered && 
        id > 0 && 
        displayFocus === (id - 1) && 
        displays[displayFocus].isReady()) {
        displayFocus = id;
        controls[id].sendLoadOrder();
    }
    */

    // Update the display focus and load focus.
    displayFocus = id;
    giveLoadFocus(id);
    
    // Show that the tab has been selected.
    tabButtons.forEach( t => t.class('tab') );
    if (id >= 0) tabButtons[id].class('tabSelected');

    // Draw the now-current display, erasing what was there before.
    // While it might at first seem like this is a side-effect, it is in
    //  fact an intrinsic part of this operation, to ensure GUI correctness.
    redrawCurrentDisplay();
}

/*
 * Function to be called when a display has fully finished loading.
 * Restarts the first display it finds that is paused.
 */
function displayLoadFinished({ detail: { obj } }) {
    if (obj instanceof ImageWindow) {
        // If no interaction is happening with a timelapse set,
        // check if any more images need to be loaded,
        // making sure to only load one image, total, at a time.
        //  - Ensures better performance on slower connections or browsers,
        //    while still allowing loads to happen in the background.
        if (!mouseIsFocused) resumeLoadAsNecessary();
    }
}

/*
 * Pause all displays except for the given one.
 */
function giveLoadFocus(displayID) {
    // Special case, no display gets focus, pause everything!
    if (displayID < 0) {
        displays.forEach( d => d.pause() );
        return;
    }

    // NOTE: While it might be tempting to remove the 'if' block inside this
    //       forEach() call, I think this can cause multiple asynchronous threads
    //       to spawn, as it is unlikely that you will successfully interrupt
    //       an asynchronous loading sequence that is already underway if the
    //       given display is the one that is loading. This can cause lag in 
    //       the user interactions.
    displays.forEach( d => { if ( d.id !== displayID ) d.pause(); });

    // Resume the selected display, if necessary.
    displays[displayID].resume();
}

/*
 * Handle keyboard input.
 */
function handleKeyDown(e) {
    let f = displays[displayFocus];
    switch (e.keyCode) {
        case 13:    // Enter
            if (displayFocus === QTR_ID || displayFocus === HALF_ID) {
                controls[displayFocus + 1].sendLoadOrder();
            }
            break;       
        case 49:    // '1' (number row)
            assignFocus(QTR_ID);
            break;
        case 50:    // '2' (number row)
            assignFocus(HALF_ID);
            break;
        case 51:    // '3' (number row)
            assignFocus(FULL_ID);
            break;
        case 83:    // 's'
            console.log('Saving screenshot of canvas.');
            save(canvas, 'screenshot' + Date.now() + '.jpg');
            break;
        case 100:   // numpad left (numlock on).
            if (f && f.isReady()) {
                f.decrementIndex();
                f.draw();
            }
            break;
        case 102:   // numpad right (numlock on).
            if (f && f.isReady()) {
                f.incrementIndex();
                f.draw();
            }
            break;
        case 192:    // '`' (backtick / tilde key)
            mouseIsFocused = false;
            break;
    }
}

/*
 * Define behaviour when the mouse cursor is moved.
 */
function handleMouseMoved(evt, mx = mouseX) {
    if (!mouseIsFocused) return;

    let f = displays[displayFocus];
    let oldIdx = f.getImageIndex();
    let newIdx = f.updateIndexFromMouse(mx);

    // Avoid unneccesary redraws.
    if (newIdx !== oldIdx) f.draw();
}

/*
 * Define behaviour when a mouse button is pressed. 
 *
 * NOTE: This is where displays receive focus!
 */
function handleMousePressed(evt, mx = mouseX, my = mouseY) {
    let { button } = evt;

    // Only support left and right mouse button clicks.
    //  0 === left mouse button
    //  2 === right mouse button
    if (evt && button !== 0 && button !== 2) return;

    // In 'tiered' mode, mouse focus is assigned based on where the user clicks.
    // In 'tabbed' mode, mouse focus is assigned by switching tabs, so where the
    //  user clicks is irrelevant for the moment.
    if (tiered) assignFocus(displays.findIndex(d => d.hasMouseInFrame(mx, my)));

    // Don't do anything if mouse isn't being dragged on a scrollbar.
    if (displayFocus < 0) return;
    
    let f = displays[displayFocus];
    if ( (tiered || f.hasMouseInFrame(mx, my)) && f.isReady() ) {
        mouseIsFocused = true;
        if (loadOnClick) f.setNextLoadFromMouse(mx);
        giveLoadFocus(displayFocus);
        handleMouseMoved(evt, mx);
    } 
}

/*
 * Take away mouse focus from all displays.
 */
function handleMouseReleased(evt) {
    let { button } = evt;

    // Don't do anything for left mouse button.
    if ( (evt && button === 2) &&
        mouseIsFocused &&
        (displayFocus === QTR_ID || displayFocus === HALF_ID) ) {
        controls[displayFocus + 1].sendLoadOrder();
    }
    else {
        resumeLoadAsNecessary();
    }
    mouseIsFocused = false;
}

/*
 * Assign the loaded data to the displays, and initiate loading 
 * of the top display.
 */
function loadFirstDisplay() {
    displays.forEach( (d) => {
        d.setFilenames(files);
        d.setTimestamps(timestamps);
    });
    controls[QTR_ID].sendLoadOrder();
    plotSelect.elt.disabled = false;
}

/*
 * Function to be called when a "loadOrder" event is dispatched.
 */
function loadNextDisplay({ detail: { id, cap, dist, mode } }) {
    if (id >= displays.length || id < 0) throw 'Invalid load ID: ' + id;
    
    let prev = id - 1;
    if (prev > 0 && !displays[prev].isReady()) throw 'Cannot initiate load from unloaded tab';

    // Load the next display.
    let d = displays[id];
    d.setLoadMode( mode );
    d.setCapacity( cap );
    if (id === QTR_ID) {
        d.load(); // No params == load full timespan.
        d.setText('Full Timespan');
    } else {
        d.load( dist, displays[prev].getFileIndex() );
    }

    // Switch the focus (and view) to the next display.
    assignFocus(id);
}

/*
 * Load the timestamps to be used by the current plot display.
 */
function loadTimestamps() {
    timestamps = loadStrings(
        plotPath + 'summer-day-timestamps.txt', 
        loadFirstDisplay, 
        loadError,
        doNothing   // Dodge a p5 bug.
    );
}

/*
 * Draw the current display.
 */
function redrawCurrentDisplay(id = displayFocus) {
    if (id < 0 || id >= displays.length) return;
    
    let f = displays[id];
    if ( mouseIsFocused && id === displayFocus) f.updateIndexFromMouse(mouseX);
    f.syncIndices();
    f.draw();
}

/*
 * Redraws the after an image has loaded.
 */
function redrawDisplay({ detail: { obj } }) {
    // If display is not in the foreground, nothing to be done.
    if (tiered || obj.id === displayFocus) redrawCurrentDisplay(obj.id);
}

/*
 * Reset all the displays.
 */
function resetDisplays() {
    displays.forEach( d => d.reset() );
}
    
/*
 * Checks displays, starting with displays[QTR_ID], to see if any of them 
 * is loading, giving the first such display it finds the load focus.
 */
function resumeLoadAsNecessary() {
    if (displayFocus < QTR_ID || !displays[displayFocus].isLoading()) {
        giveLoadFocus( displays.findIndex( d => d.isLoading() ));
    }
}

/*
 * Function to be called when a new plot is selected for display.
 *
 * NOTE: Loading sequence (controlled by callbacks) goes:
 *        startNewPlot() -> loadTimestamps() -> loadFirstDisplay()
 *  - Guarantees that all data is ready before image loading starts.
 */
function startNewPlot() {
    resetDisplays();
    showAnnotations();

    // Wipe the tiered display if necessary.
    if (tiered) displays.forEach( d => d.draw() );
    if (plotSelect.value() === '---') return;

    // Prevent new plot selection while current one is being initialized.
    // TODO: Figure out a better recovery strategy?
    plotSelect.elt.disabled = true;

    // Inform the user as to what is happening.
    fill(25);
    textAlign(LEFT);
    text('Accessing data...', DISPLAY_LEFT + 10, DISPLAY_TOP + 20);
    
    // Update path values.
    plotPath = IMG_PATH + plotSelect.value() + '/';
    displays[FULL_ID].setImagePath(plotPath + 'full/');
    displays[HALF_ID].setImagePath(plotPath + 'half/');
    displays[QTR_ID].setImagePath(plotPath + 'quarter/');

    // Initiate data loading sequence.
    files = loadStrings(
        plotPath + 'summer-day-frames.txt', 
        loadTimestamps,
        loadError,
        doNothing   // Dodge a p5 bug.
    );
}

/*
 * Toggle between the tiered and single window view modes.
 */
function toggleViewMode() {
    // NOTE for below: Resizing wipes the render, so be careful with it!
    tiered = !tiered;
    if (!tiered) { // Therefore entering 'tabbed' view mode.
        resizeCanvas(DISPLAY_WIDTH, DISPLAY_HEIGHT);
        tabButtonDiv.show();

        displays.forEach( d => d.updateParameters(
            DISPLAY_LEFT,
            DISPLAY_TOP,
            FULL_WIDTH,
            FULL_HEIGHT,
        ));

        displayFocus > 0 ? displays[displayFocus].draw() : displays[QTR_ID].draw();
    } else {
        resizeCanvas(DISPLAY_WIDTH, TIERED_HEIGHT);
        tabButtonDiv.hide();

        let currentY = DISPLAY_TOP;
        displays.forEach( (d, i) => {
            let pow = Math.pow(2, 2 - i);
            d.updateParameters(
                DISPLAY_LEFT,
                currentY,
                FULL_WIDTH / pow,
                FULL_HEIGHT / pow
            );

            if (i < displays.length - 1) {
                currentY += d.height + GAP;
                d.setTimestampPosition( d.x + d.width + GAP + 300, d.y );
                d.setTimestampWipeBackground();
            }

            d.draw();
        });
    }
    assignFocus(displayFocus);
}

// -------------- TOUCH INTERACTION FUNCTIONS --------------- //

/*
 * To be called on 'touchstart' events.
 */
function touchStarted() {
    // Only respond to the first touch.
    if (touches.length === 1) {
        handleMousePressed(undefined, touches[0].x, touches[0].y );
    }
}

/*
 * To be called on 'touchmove' events.
 */
function touchMoved() {
    // Only respond to the first touch.
    handleMouseMoved(undefined, touches[0].x );
}

/*
 * To be called on 'touchend' events.
 */
function touchEnded() {
    // Only respond when there are no more touches.
    if (touches.length <= 0) handleMouseReleased();
}

// Suppress p5 functions to prevent double occurrence on touch devices.
function mousePressed() {}
function mouseMoved() {}
function mouseDragged() {}
function mouseReleased() {}

