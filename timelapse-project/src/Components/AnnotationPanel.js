import { React, useState, useEffect } from "react";

const plotPlaceholder = "Plot Placeholder";

const AnnotationPanel = (props) => {

    const [ annotations, setAnnotations ] = useState(props.annotations || []);
    const [ currAnnotation, setCurrAnnotation ] = useState(undefined);

    /**
     * Creates an annotation object for storing collections of annotation data.
     * @param {int} id 
     * @param {string} type 
     * @param {string} plot 
     * @param {string} filename 
     * @param {int} fileIndex 
     * @param {string} timestamp 
     * @returns An object holding all the input annotation data.
     */
    const createAnnotationObj = (id, type, plot, filename, fileIndex, timestamp) => {
        return {
            id: id,
            type: type,
            plot: plot,
            filename: filename,
            fileIndex: fileIndex,
            timestamp: timestamp,
            name: "" + id + ": " + type + ": " + timestamp,
        }
    }

    /**
     * Parse the id from the current annotation.
     * @returns the annotation id or undefined.
     */
    const parseAnnotationID = () => {
        if (currAnnotation) {
            return parseInt(currAnnotation.substr(0, currAnnotation.indexOf(':')));
        }
        return undefined;
    }

    /**
     * Loads the current annotation into the top panel.
     */
    const loadFromAnnotation = () => {
        let id = parseAnnotationID();
        if (id) {
            // Lookup the annotation and retrieve the fileIndex. 
            let savedAnnotations = JSON.parse(localStorage.getItem("annotations")) || [];
            let fileIndex = savedAnnotations.find(annotation => annotation.id === id)?.fileIndex;

            // Make sure we're up to date with the control panel, then load.
            props.load(fileIndex);
        }
    }

    /**
     * Create and save a new annotation.
     */
    const saveAnnotation = () => {
        // Gather data.
        let type = prompt("Type of annotation: ");
        if (!type) return;

        let plot = plotPlaceholder;
        let fileName = "Filename Placeholder";
        let fileIndex = 45; /* Placeholder */
        let timestamp = "Timestamp Placeholder";

        // Retrieve saved annotations.
        let savedAnnotations = JSON.parse(localStorage.getItem("annotations")) || [];

        // Find a unique id.
        let id = 1;
        while ( savedAnnotations.find(annotation => annotation.id === id)) id++;

        // Build the annotation and add it.
        let newAnnotation = createAnnotationObj(id, type, plot, fileName, fileIndex, timestamp);
        setAnnotations(prevState => [...prevState, newAnnotation],);
        setCurrAnnotation(newAnnotation.name);
    }

    /**
     * Clear all the annotations pertaining to the current plot.
     */
    const clearAnnotations = () => {
        setAnnotations([]);
        setCurrAnnotation(undefined);
    }

    /**
     * Delete only the currently selected annotation.
     */
    const removeAnnotation = () => {
        // Parse the annotation string from the list for the id.
        let id = parseAnnotationID();
        if (id) {
            // Remove the selected annotation.
            let updatedAnnotations = annotations.filter(annotation => annotation.id != id);
            setAnnotations(updatedAnnotations);
        }
    }

    /**
     * Update annotations and current state if the annotation props changes.
     */
    useEffect(() => {
        // Start fresh just in case
        setAnnotations([]);
        setCurrAnnotation(undefined);

        // Get the annotations and add them to the pull-down menu.
        let savedAnnotations = JSON.parse(localStorage.getItem("annotations"));
        let plot = plotPlaceholder;
        let count = 0;
        if (savedAnnotations) {
            savedAnnotations.forEach((annotation) => {
                if (annotation.plot === plot) {
                    if (count == 0) setCurrAnnotation(annotation.name);
                    setAnnotations(prevState => [...prevState, annotation]);
                    count++;
                }
            })
        }
    }, [props.annotations]);

    /**
     * Update local storage whenever the annotations state changes.
     */
    useEffect(() => {
        // Get all the currently stored annotations.
        let oldAnnotations = JSON.parse(localStorage.getItem("annotations")) || [];

        // Store the updated data.
        let newAnnotations = [...annotations, ...oldAnnotations.filter(annotation => annotation.plot !== plotPlaceholder)];
        if (newAnnotations.length > 0) {
            localStorage.setItem("annotations", JSON.stringify(newAnnotations));
        } else {
            localStorage.removeItem("annotations");
        }
    }, [annotations]);
    
    return (
        <div className="annotation">
            <p>Saved annotations:</p>
            <select onChange={(e) => setCurrAnnotation(e.target.value)}>
                {annotations.map((annotation, index) => 
                    <option value={annotation.name} key={index}>{annotation.name}</option>)}
            </select>
            <button onClick={loadFromAnnotation}>Load</button>
            <button onClick={saveAnnotation}>Create Annotation</button>
            <button onClick={clearAnnotations}>Clear Annotations</button>
            <button onClick={removeAnnotation}>Remove Selected</button>
        </div>
    )
}

export default AnnotationPanel;