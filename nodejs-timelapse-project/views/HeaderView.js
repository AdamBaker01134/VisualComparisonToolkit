/* Application Header View */
"use strict";
function Headerview () {
    /* Snapshot arrays to avoid redrawing select elements and improve performance */
    this.datasetSnapshot = [];
    this.configSnapshot = [];
    this.frameSnapshot = [];
    this.filterSnapshot = [];
}

/**
 * Set the application model in the header view
 * @param {Model} model application model
 */
Headerview.prototype.setModel = function (model) {
    this.model = model;
}

/**
 * Set the application interaction model in the header view
 * @param {iModel} imodel application interaction model
 */
Headerview.prototype.setInteractionModel = function (imodel) {
    this.imodel = imodel;
}

/**
 * "Draw"/Update all header HTML elements with values from the models
 */
Headerview.prototype.draw = function () {
    this.updateLoadingSpinner();
    this.updateNormalized();
    this.updateLocked();
    this.updateOpacitySlider();
    this.updateDisplayControlVisibility();

    if (this.datasetSnapshot !== this.model.datasets) {
        this.updateUploadSelect();
    }
    if (this.configSnapshot !== this.model.configs) {
        this.updateConfigSelect();
    }
    if (!!this.imodel.selection && this.frameSnapshot !== this.imodel.selection.savedFrames) {
        this.updateFrameSelect();
    }
    if (!!this.imodel.selection && this.filterSnapshot !== this.imodel.selection.filters) {
        this.updateFilterSelect();
    }
}

/**
 * Update the state of the loading spinner.
 * If the system is loading, set it to visible.
 * If the system finished loading, set it to invisible.
 */
Headerview.prototype.updateLoadingSpinner = function () {
    document.getElementById("loading-spinner").style.display = this.model.loading ? "block" : "none";
}

/**
 * Update the state of the normalize checkbox if it has changed.
 */
Headerview.prototype.updateNormalized = function () {
    let normalized = this.model.normalized;
    let checkbox = document.getElementById("normalizeCheckbox");
    if (checkbox?.checked !== normalized) checkbox.checked = normalized;
}

/**
 * Update the state of the locked checkbox if it has changed.
 */
Headerview.prototype.updateLocked = function () {
    let locked = this.imodel.selection?.locked;
    let checkbox = document.getElementById("lockCheckbox");
    if (checkbox?.checked !== locked) checkbox.checked = locked;
}

/**
 * Update the value of the opacity slider if it has changed.
 */
Headerview.prototype.updateOpacitySlider = function () {
    let opacity = this.imodel.selection?.opacity;
    let opacityInput = document.getElementById("opacityInput");
    if (opacityInput?.value !== opacity) opacityInput.value = opacity;
}

/**
 * Update the visibility of the display controls.
 * If a display is selected, it should be visible.
 */
Headerview.prototype.updateDisplayControlVisibility = function () {
    /* Regular display controls visibility control */
    let visible = this.imodel.selection !== null;
    let controls = document.getElementById("displayControls");
    if (visible && controls?.classList.contains("hidden")) {
        controls.classList.remove("hidden");
    } else if (!visible && controls?.classList.contains("hidden") === false) {
        controls.classList.add("hidden");
    }

    /* Opacity container visibility control */
    let overlay = this.imodel.selection instanceof Overlay;
    let opacity = document.getElementById("opacityContainer");
    if (overlay && opacity?.classList.contains("hidden")) {
        opacity.classList.remove("hidden");
    } else if (!overlay && opacity?.classList.contains("hidden") === false) {
        opacity.classList.add("hidden");
    }
}

/**
 * Update the upload select element with datasets from the model.
 */
Headerview.prototype.updateUploadSelect = function () {
    let uploadSelect = document.getElementById("uploadSelect");
    uploadSelect.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.text = "---";
    uploadSelect.add(defaultOption);
    this.model.datasets.forEach(dataset => {
        let option = document.createElement("option");
        option.text = dataset.name;
        uploadSelect.add(option);
    });
    this.datasetSnapshot = [...this.model.datasets];
}

/**
 * Update the config select element with cofigs from the imodel.
 */
Headerview.prototype.updateConfigSelect = function () {
    let configSelect = document.getElementById("configSelect");
    configSelect.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.text = "Select Config";
    defaultOption.disabled = true;
    configSelect.add(defaultOption);
    this.model.configs.forEach(config => {
        let option = document.createElement("option");
        option.text = config.name;
        configSelect.add(option);
    });
    this.configSnapshot = [...this.model.configs];
}

/**
 * Update the frame select element with saved frames from the selected display in the imodel.
 */
Headerview.prototype.updateFrameSelect = function () {
    if (this.imodel.selection !== null) {
        let frameSelect = document.getElementById("frameSelect");
        frameSelect.innerHTML = "";
        let defaultOption = document.createElement("option");
        defaultOption.text = "Select Frame";
        defaultOption.disabled = true;
        frameSelect.add(defaultOption);
        this.imodel.selection.savedFrames.forEach(savedFrame => {
            let option = document.createElement("option");
            option.text = savedFrame.name;
            frameSelect.add(option);
        });
        this.frameSnapshot = [...this.imodel.selection.savedFrames];
    }
}

/**
 * Update the filter select element with filters from the selected display in the imodel.
 */
Headerview.prototype.updateFilterSelect = function() {
    if (this.imodel.selection !== null) {
        let filterSelect = document.getElementById("filterSelect");
        filterSelect.innerHTML = "";
        let defaultOption = document.createElement("option");
        defaultOption.text = "---";
        filterSelect.add(defaultOption);
        this.imodel.selection.filters.forEach(filterName => {
            let option = document.createElement("option");
            option.text = filterName;
            filterSelect.add(option);
        });
        let resetOption = document.createElement("option");
        resetOption.text = "Reset";
        filterSelect.add(resetOption);
        this.filterSnapshot = [...this.imodel.selection.filters];
    }
}

/* Model interface function */
Headerview.prototype.modelChanged = function () {
    this.draw();
}