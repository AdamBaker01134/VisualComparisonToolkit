// Turn on strict mode:
"use strict";

// For annotations:
let annotationSelect;

/*
 * With apologies...
 * This is where I've done most of the work slapping together a crude
 *  annotation system. If I had more time, I'd have done a more clean
 *  job. I'm really sorry if this (and the rest of the code, TBH) is
 *  an impenetrable mess.
 *
 * Other annotations code to look for:
 *  showAnnotations() call in startNewPlot()
 */
function Annotation(id, type, plot, filename, fileindex, timestamp) {
    this.id = id; // Needs to be set to something unique;
    this.type = type;
    this.plot = plot;
    this.filename = filename;
    this.fileindex = fileindex;
    this.timestamp = timestamp;
    this.name = "" + this.id + ": " + this.type + ": " + this.timestamp;
}

/*
 * One-time use function to create the panel that provides annotation
 *  interaction.
 */
function _createAnnotationPanel() {
    // Div to hold everything.
    let div = createDiv('');
    div.class('annotation');

    // Paregraph to use as descriptor for user.
    let h = createP('Saved annotations:');
    h.parent(div);

    // Pull-down menu.
    annotationSelect = createSelect();
    annotationSelect.parent(div);
    //annotationSelect.option('---');
    showAnnotations();
    
    // Apologies for the out of order numbering.
    let b4 = createButton('Load Panel 2', 'loadFromAnnotation');
    b4.parent(div);
    b4.mousePressed( loadFromAnnotation );

    // Some buttons!
    let b = createButton('Create annotation', 'saveAnnotation');
    b.parent(div);
    b.mousePressed( saveAnnotation );
    
    let b2 = createButton('Clear annotations', 'clearAnnotations');
    b2.parent(div);
    b2.mousePressed( clearAnnotations );
    
    let b3 = createButton('Remove selected', 'removeAnnotation');
    b3.parent(div);
    b3.mousePressed( removeAnnotation );
}

/*
 * Clear all the annotations pertaining to the current plot.
 */
function clearAnnotations() {
    // Get all the annotations.
    let aold = JSON.parse(localStorage.getItem("annotations")) || [];

    // Remove all the annotations for this plot.
    let p = plotSelect.value();
    let anew = aold.filter( a => a.plot !== p );
    if (anew.length > 0) {
        localStorage.setItem("annotations", JSON.stringify(anew));
    } else {
        localStorage.removeItem("annotations");
    }

    clearAnnotationSelect();
}

/*
 * Clear the list of options under the annotation selector.
 */
function clearAnnotationSelect() {
    // (1) because want to leave '---'.
    // TODO: Is it really a good idea to have '---' at all?
    while (annotationSelect.elt.length > 0) annotationSelect.elt.remove(0);
}

/*
 * Loads the current annotation into the top panel.
 */
function loadFromAnnotation() {
    let id = parseAnnotationID();
    if (id) {
        // Lookup the annotation and retrieve the fileindex.
        let ans = JSON.parse(localStorage.getItem("annotations"));
        let fidx = ans.find( a => a.id === id ).fileindex;
        
        // Make sure we're up to date with the control panel, then load.
        // NOTE: Loading into HALF panel, because first panel should
        //          always display the full timespan, so a reload will
        //          not display the annotation image.
        let d = displays[HALF_ID];
        let c = controls[HALF_ID];
        d.setLoadMode( c.getMode() );
        d.setCapacity( c.getCapacity() );
        d.load( c.getDistance(), fidx );
        assignFocus(HALF_ID);
    }
}

/*
 * Parse the id from the current annotation.
 */
function parseAnnotationID() {
    let val = annotationSelect.value();
    if (val) {
        return parseInt(val.substr(0, val.indexOf(':')));
    }
    return undefined;
}

/*
 * Create and save a new annotation.
 */
function saveAnnotation() {
    if (displayFocus < 0) return;

    // Gather data.
    let type = prompt("Type of annotation:");
    if (!type) return; // This means the user clicked "cancel".
    let d = displays[displayFocus];
    let plot = plotSelect.value();
    let fname = d.getFilename();
    let fidx = d.getFileIndex();
    let ts = d.getCurrentTimestamp();

    // Retrieve saved annotations.
    // TODO: find a more efficient way of doing this?
    //      - Currently could be slow once lots of annotations have
    //          been generated.
    let alist = JSON.parse(localStorage.getItem("annotations")) || [];

    // Find a unique id.
    let id = 1;
    while ( alist.find( a => a.id === id ) ) id++;

    // Build the annotation and add it.
    let anew = new Annotation(id, type, plot, fname, fidx, ts);
    alist.push(anew);

    // Store the data and add the new annotation to the available list.
    localStorage.setItem("annotations", JSON.stringify(alist));
    annotationSelect.option(anew.name);
}

/*
 * Show only annotations pertaining to the current plot.
 */
function showAnnotations() {
    // Start fresh, just in case...
    clearAnnotationSelect();

    // Get the annotations and add them to the pull-down menu. 
    let ans = JSON.parse(localStorage.getItem("annotations"));
    let p = plotSelect.value();
    if (ans !== null) {
        ans.forEach( (a) => {
            if (a.plot === p) annotationSelect.option(a.name);
        });
    }
}

/*
 * Delete only the currently selected annotation.
 */
function removeAnnotation() {
    // Parse the annotation string from the list for the id.
    let id = parseAnnotationID();
    if (id) {
        // Remove the selected annotation from the saved data.
        let aold = JSON.parse(localStorage.getItem("annotations"));
        let anew = aold.filter( a => a.id !== id );
        localStorage.setItem("annotations", JSON.stringify(anew));

        // Remove the selected annotation from the UI list.
        annotationSelect.elt.remove(annotationSelect.elt.selectedIndex);
    }
}

