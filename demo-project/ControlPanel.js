// Turn on strict mode:
"use strict";

/*
 * Class for providing a control panel to attach to timelapse windows.
 *
 * Button sends a custom "loadOrder" event which contains all the information
 *  reflecting the current state of the input controls.
 */
function ControlPanel(id) {
    // Properties specifying the position of the panel.
    this.id = id;

    // One div to rule them all.
    this.ctrl = createDiv('');
    this.ctrl.class('controller');

    // Heading for the control box.
    this.heading = createElement('h2');
    this.heading.parent(this.ctrl);

    // Boxed up some code for readability.
    this._createCapSlider();
    this._createDistSlider();
    this._createModeSelect();
}

/*
 * Create the slider for setting frame capacity.
 */
ControlPanel.prototype._createCapSlider = function() {
    // Div for the cap slider.
    let capDiv = createDiv('');
    capDiv.class('slideDiv');
    capDiv.parent(this.ctrl);

    // To display the title of the capacity slider.
    let imgCapText = createP('Number of images to load:');
    imgCapText.class('slideText');
    imgCapText.parent(capDiv);

    // A slider for the capacity.
    this.imgCapSlider = createSlider();
    this.imgCapSlider.elt.oninput = this.updateCapacity.bind(this);
    this.imgCapSlider.parent(capDiv);

    // To display the value of the capacity slider.
    this.imgCapVal = createP(this.imgCapSlider.value());
    this.imgCapVal.class('slideVal');
    this.imgCapVal.parent(capDiv);
}

/*
 * Create the slider for setting frame image distance.
 */
ControlPanel.prototype._createDistSlider = function() {
    // Div for the dist slider.
    this.distDiv = createDiv('');
    this.distDiv.class('slideDiv');
    this.distDiv.parent(this.ctrl);

    // To display the title of the distance slider.
    let imgDistText = createP('Time between images in minutes:');
    imgDistText.class('slideText');
    imgDistText.parent(this.distDiv);
    
    // A slider for the temporal image distance (time b/w images).
    this.imgDistSlider = createSlider();
    this.imgDistSlider.elt.oninput = this.updateDistance.bind(this);
    this.imgDistSlider.parent(this.distDiv);

    // To display the value of the distance slider.
    this.imgDistVal = createP(this.imgDistSlider.value());
    this.imgDistVal.class('slideVal');
    this.imgDistVal.parent(this.distDiv);
}

/*
 * Create the mode selection box.
 */
ControlPanel.prototype._createModeSelect = function() {
    // A div for the mode selector.
    let modeDiv = createDiv('');
    modeDiv.parent(this.ctrl);

    // The tile of the mode selector.
    let modeText = createP('Select the load method:');
    modeText.parent(modeDiv);

    // A pulldown select menu to pick modes.
    this.modeSelect = createSelect();
    this.modeSelect.option('linear');
    this.modeSelect.option('fill');
    this.modeSelect.parent(modeDiv);
}

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Disable the distance slider.
 */
ControlPanel.prototype.disableDistance = function() {
    this.distDiv.id('disabled');
    this.imgDistSlider.elt.disabled = true;
}

/*
 * Get the capacity.
 */
ControlPanel.prototype.getCapacity = function() {
    return this.imgCapSlider.value();
}

/*
 * Get the distance.
 */
ControlPanel.prototype.getDistance = function() {
    return this.imgDistSlider.value();
}

/*
 * Get the mode.
 */
ControlPanel.prototype.getMode = function() {
    return this.modeSelect.value();
}

/*
 * Hide the control panel.
 */
ControlPanel.prototype.hide = function() {
    this.ctrl.hide();
}

/*
 * Assign a parent DOM node to this control panel.
 */
ControlPanel.prototype.parent = function(par) {
    this.ctrl.parent(par);
}

/*
 * Collect the current state of the input controls into a custom event
 * and dispatch it to the document.
 */
ControlPanel.prototype.sendLoadOrder = function() {
    document.dispatchEvent( 
        new CustomEvent(
            'loadOrder',
            {
                detail: {
                    id: this.id,
                    cap: this.getCapacity(),
                    dist: this.getDistance(),
                    mode: this.getMode()
                }
            }
        )
    );
}

/*
 * Set up the capacity slider with the given values.
 */
ControlPanel.prototype.setCapacitySliderValues = function(min, max, dft, step) {
    this.imgCapSlider.elt.min = min;
    this.imgCapSlider.elt.max = max;
    this.imgCapSlider.elt.defaultValue = dft;
    this.imgCapSlider.elt.step = step;
    this.updateCapacity();
}

/*
 * Set up the distance slider with the given values.
 */
ControlPanel.prototype.setDistanceSliderValues = function(min, max, dft, step) {
    this.imgDistSlider.elt.min = min;
    this.imgDistSlider.elt.max = max;
    this.imgDistSlider.elt.defaultValue = dft;
    this.imgDistSlider.elt.step = step;
    this.updateDistance();
}

/*
 * Set the heading for the box.
 */
ControlPanel.prototype.setHeading = function(hdg) {
    this.heading.html(hdg);
}

/*
 * Set the value for the mode selector.
 */
ControlPanel.prototype.setModeSelect = function(mode) {
    ensureValidLoadMode(mode);
    this.modeSelect.elt.selected = mode;
    this.modeSelect.elt.value = mode;
}

/*
 * Give this control panel a parent.
 */
ControlPanel.prototype.setParent = function(prt) {
    this.ctrl.setParent(prt);
}

/*
 * Show the control panel (the default).
 */
ControlPanel.prototype.show = function() {
    this.ctrl.show();
}

/*
 * Update the displayed value of the image capacity slider.
 */
ControlPanel.prototype.updateCapacity = function() {
    this.imgCapVal.html(this.imgCapSlider.value());
}

/*
 * Update the displayed value of the image distance slider.
 */
ControlPanel.prototype.updateDistance = function() {
    this.imgDistVal.html(this.imgDistSlider.value());
}

