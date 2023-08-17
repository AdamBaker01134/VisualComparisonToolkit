/* Application Header View */
"use strict";
function Headerview() {
    /* Snapshot arrays to avoid redrawing select elements and improve performance */
    this.datasetSnapshot = [];
    this.snapshotSnapshot = [];
    this.annotationSnapshot = [];
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
    this.updateCursor();
    this.updateLoadingSpinner();
    this.updateLayoutType();
    this.updateNormalized();
    this.updateLocked();
    this.updateTimestamped();
    this.updateOpacityElements();
    this.updateDisplayControlVisibility();
    this.updateHelpVisibility();

    if (this.datasetSnapshot !== this.model.datasets) {
        this.updateUploadSelect();
    }
    if (this.snapshotSnapshotSnapshot !== this.model.snapshots) {
        this.updateSnapshotSelect();
    }
    if (!!this.imodel.selection && this.annotationSnapshot !== this.imodel.selection.getMainScrollbar().annotations) {
        this.updateAnnotationSelect();
    }
    if (!!this.imodel.selection && this.filterSnapshot !== this.imodel.selection.getLayerFilters()) {
        this.updateFilterSelect();
    }
}

/**
 * Update the style of cursor in the canvas.
 */
Headerview.prototype.updateCursor = function () {
    let cursor = this.imodel.cursor;
    let canvas = document.getElementById("defaultCanvas0");
    if (canvas.style.cursor !== cursor) canvas.style.cursor = cursor;
}

/**
 * Update the state of the loading spinner.
 * If the system is loading, set it to visible.
 * If the system finished loading, set it to invisible.
 */
Headerview.prototype.updateLoadingSpinner = function () {
    let displayValue = this.model.loading ? "block" : "none";
    let spinner = document.getElementById("loading-spinner");
    if (spinner.style.display !== displayValue) spinner.style.display = displayValue;
}

/**
 * Update the state of the layout type checkboxes.
 */
Headerview.prototype.updateLayoutType = function () {
    let layoutType = this.model.layoutType;
    let staticLayoutCheckbox = document.getElementById("staticLayoutCheckbox");
    let dynamicLayoutCheckbox = document.getElementById("dynamicLayoutCheckbox");
    if (dynamicLayoutCheckbox.checked && staticLayoutCheckbox.checked) {
        if (layoutType === "dynamic") {
            staticLayoutCheckbox.checked = false;
        } else {
            dynamicLayoutCheckbox.checked = false;
        }
    }
    if (!dynamicLayoutCheckbox.checked && !staticLayoutCheckbox.checked) {
        if (layoutType === "dynamic") {
            dynamicLayoutCheckbox.checked = true;
        } else {
            staticLayoutCheckbox.checked = true;
        }
    }
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
 * Update the state of the timestamp checkbox if it has changed.
 */
Headerview.prototype.updateTimestamped = function () {
    let timestamped = this.imodel.selection?.timestamped;
    let checkbox = document.getElementById("stampCheckbox");
    if (checkbox?.checked !== timestamped) checkbox.checked = timestamped;
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
Headerview.prototype.updateOpacityElements = function () {
    if (this.imodel.selection !== null && this.imodel.selection instanceof Overlay) {
        const opacity = this.imodel.selection.getLayerOpacity(this.imodel.selection.layers.length - 1);
        const opacityInput = document.getElementById("opacityInput");
        if (opacityInput?.value !== opacity) opacityInput.value = opacity;
        const opacityText = `Opacity: ${Math.floor(opacity / 255 * 100)}%`;
        const opacityLabel = document.getElementById("opacityLabel");
        if (opacityLabel?.innerHTML !== opacityText) opacityLabel.innerHTML = opacityText
    }
}

/**
 * Update the visibility of the display controls.
 * If a display is selected, it should be visible.
 */
Headerview.prototype.updateDisplayControlVisibility = function () {
    /* Regular display controls visibility control */
    const visible = this.imodel.selection !== null;
    const displayControls = document.getElementById("displayControls");
    if (visible && displayControls?.classList.contains("hidden")) {
        displayControls.classList.remove("hidden");
    } else if (!visible && displayControls?.classList.contains("hidden") === false) {
        displayControls.classList.add("hidden");
    }

    const isOverlay = this.imodel.selection instanceof Overlay;
    /* Opacity container visibility control */
    const opacityContainer = document.getElementById("opacityContainer");
    if (isOverlay && opacityContainer?.classList.contains("hidden")) {
        opacityContainer.classList.remove("hidden");
    } else if (!isOverlay && opacityContainer?.classList.contains("hidden") === false) {
        opacityContainer.classList.add("hidden");
    }
}

/**
 * Update the visibility of the help section.
 */
Headerview.prototype.updateHelpVisibility = function () {
    const header = document.getElementsByTagName("header")[0];
    const main = document.getElementsByTagName("main")[0];
    const helpButton = document.getElementById("help");
    const helpSection = document.getElementById("helpSection");
    const helpState = this.model.help;
    if (helpState && helpSection?.classList.contains("hidden")) {
        header?.classList.add("hidden");
        main?.classList.add("hidden");
        helpSection.classList.remove("hidden");
        helpButton.innerText = "Done";
    } else if (!helpState && helpSection?.classList.contains("hidden") === false) {
        header?.classList.remove("hidden");
        main?.classList.remove("hidden");
        helpSection.classList.add("hidden");
        helpButton.innerText = "Help";
    }
}

/**
 * Update the upload select element with datasets from the model.
 */
Headerview.prototype.updateUploadSelect = function () {
    let uploadSelect = document.getElementById("uploadSelect");
    uploadSelect.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.text = "Select dataset";
    uploadSelect.add(defaultOption);
    /* Collect datasets into a hierarchy and a list of standalone datasets */
    const hierarchy = {};
    const standalones = [];
    this.model.datasets.forEach(dataset => {
        if (!dataset.containsImages) hierarchy[dataset.dir] = [];
        let standalone = true;
        Object.keys(hierarchy).forEach(key => {
            if (dataset.dir.startsWith(key)) {
                hierarchy[key].push(dataset);
                standalone = false;
            }
        });
        if (standalone) standalones.push(dataset);
    });
    /* Add hierarchy to select element using optgroups and options */
    Object.keys(hierarchy).forEach(key => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = key.slice(1);
        hierarchy[key].forEach(dataset => {
            const option = document.createElement("option");
            option.text = dataset.dir;
            optgroup.appendChild(option);
        });
        uploadSelect.add(optgroup);
    });
    /* Add an additional optgroup for standalones and add all standalone datasets to that optgroup */
    if (standalones.length > 0) {
        const standaloneOptGroup = document.createElement("optgroup");
        standaloneOptGroup.label = "standalones";
        standalones.forEach(standalone => {
            const option = document.createElement("option");
            option.text = standalone.dir;
            standaloneOptGroup.appendChild(option);
        });
        uploadSelect.add(standaloneOptGroup);
    }
    this.datasetSnapshot = [...this.model.datasets];
}

/**
 * Update the snapshot select element with cofigs from the imodel.
 */
Headerview.prototype.updateSnapshotSelect = function () {
    let snapshotSelect = document.getElementById("snapshotSelect");
    snapshotSelect.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.text = "Select snapshot";
    snapshotSelect.add(defaultOption);
    this.model.snapshots.forEach(snapshot => {
        let option = document.createElement("option");
        option.text = snapshot.name;
        snapshotSelect.add(option);
    });
    this.snapshotSnapshot = [...this.model.snapshots];
}

/**
 * Update the annotation select element with annotations from the selected display in the imodel.
 */
Headerview.prototype.updateAnnotationSelect = function () {
    if (this.imodel.selection !== null) {
        let annotationSelect = document.getElementById("annotationSelect");
        annotationSelect.innerHTML = "";
        let defaultOption = document.createElement("option");
        defaultOption.text = "Select annotation";
        annotationSelect.add(defaultOption);
        let scrollbar = this.imodel.selection.getMainScrollbar();
        scrollbar.annotations.forEach(annotation => {
            let option = document.createElement("option");
            option.text = annotation.name;
            annotationSelect.add(option);
        });
        this.annotationSnapshot = [...scrollbar.annotations];
    }
}

/**
 * Update the filter select element with filters from the selected display in the imodel.
 */
Headerview.prototype.updateFilterSelect = function () {
    let selection = this.imodel.selection;
    if (selection !== null) {
        let filterSelect = document.getElementById("filterSelect");
        filterSelect.innerHTML = "";

        const filters = selection.getLayerFilters(selection.layers.length - 1);
        const selectedFilter = selection.getLayerFilter(selection.layers.length - 1);

        if (selectedFilter !== "") {
            let currentOption = document.createElement("option");
            currentOption.text = selectedFilter;
            filterSelect.add(currentOption);
            filters.filter(name => name !== selectedFilter)
                .forEach(filterName => {
                    let option = document.createElement("option");
                    option.text = filterName;
                    option.disabled = selection.locked;
                    filterSelect.add(option);
                });
            let resetOption = document.createElement("option");
            resetOption.text = "Reset";
            resetOption.disabled = selection.locked;
            filterSelect.add(resetOption);
        } else {
            let defaultOption = document.createElement("option");
            defaultOption.text = "Select filter";
            filterSelect.add(defaultOption);
            filters.forEach(filterName => {
                let option = document.createElement("option");
                option.text = filterName;
                option.disabled = selection.locked;
                filterSelect.add(option);
            });
        }
        this.filterSnapshot = [...filters];
    }
}

/* Model interface function */
Headerview.prototype.modelChanged = function () {
    this.draw();
}