/* Global Application Scrollbar */
"use strict";
function Scrollbar(id, x, y, width, height, size, annotations = [], children = []) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.size = size;
    this.index = 0;

    this.start = 0;
    this.end = this.getSize() - 1;

    this.locked = false;

    /* Need to make a copy of each annotation to keep them disconnected */
    this.annotations = annotations.map(annotation => {
        let copy = JSON.parse(JSON.stringify(annotation));
        copy.id = generateAnnotationId(annotation.name);
        return copy;
    });

    this.links = [];            // deals with annotations & ranges
    this.children = children;   // deals with index updating & normalization
}

/* Get the number of segments in the scrollbar */
Scrollbar.prototype.getSize = function () {
    return this.size;
}

/* Get the start -> end range of the scrollbar */
Scrollbar.prototype.getRange = function () {
    if (this.children.length > 0) return this.getSize();
    return this.end - this.start;
}

/* Get the line gap between segments in the scrollbar */
Scrollbar.prototype.getLineGap = function () {
    return this.width / this.getSize();
}

/**
 * Get the x-coordinate of an index within the scrollbar
 * @param {number} index index within the scrollbar
 */
Scrollbar.prototype.getPositionOfIndex = function (index) {
    return this.getLineGap() * (0.5 + index) + this.x;
}

/**
 * Check to see if mouse is in the scrollbar.
 * @param {number} mx x coordinate of the cursor
 * @param {number} my y coordinate of the cursor
 * @returns {boolean}
 */
Scrollbar.prototype.checkScrollbarHit = function (mx, my) {
    return mx > this.x - 5 && my > this.y &&
        mx < this.x + this.width + 5 && my < this.y + this.height;
}

/* Get the index position x-coordinate of the scrollbar in the canvas */
Scrollbar.prototype.getMainPosition = function () {
    return this.getPositionOfIndex(this.index);
}

/**
 * Check to see if the mouse is on the main position arrow
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
Scrollbar.prototype.checkMainPositionHit = function (mx) {
    let pos = this.getMainPosition();
    return mx > pos - 5 && mx < pos + 5;
}

/* Get the start position x-coordinate of the scrollbar in the canvas */
Scrollbar.prototype.getStartPosition = function () {
    if (this.children.length > 0) return -999;
    return this.getPositionOfIndex(this.start);
}

/**
 * Check to see if the mouse is on the start position arrow or within the left empty area
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
Scrollbar.prototype.checkStartHit = function (mx) {
    if (this.children.length > 0) return false;
    let pos = this.getStartPosition();
    return mx > this.x - 5 && mx < pos + 5;
}

/* Get the end position x-coordinate of the scrollbar in the canvas */
Scrollbar.prototype.getEndPosition = function () {
    if (this.children.length > 0) return -999;
    return this.getPositionOfIndex(this.end);
}

/**
 * Check to see if the mouse is on the end position arrow or within the right empty area
 * @param {number} mx x coordinate of cursor
 * @returns {boolean}
 */
Scrollbar.prototype.checkEndHit = function (mx) {
    if (this.children.length > 0) return false;
    let pos = this.getEndPosition();
    return mx > pos - 5 && mx < this.x + this.width + 5;
}

/**
 * Set the index in the scrollbar
 * @param {number} index new scrollbar index
 * @param {boolean} normalize whether or not to normalize children
 */
Scrollbar.prototype.setIndex = function (index, normalize) {
    if (this.locked) return;

    let saved = this.index;
    this.index = index;
    if (this.index < this.start) {
        this.index = this.start;
    } else if (this.index > this.end) {
        this.index = this.end;
    }
    if (this.index < 0) {
        this.index = 0;
    } else if (this.index >= this.getSize()) {
        this.index = this.getSize() - 1;
    }

    let step = this.index - saved;
    this.children.forEach(child => {
        let stepRatio = 1;
        if (normalize) stepRatio = child.getRange() / this.getRange();
        child.setIndex(child.index + (step * stepRatio), normalize);
    });
}

/**
 * Set the start position
 * @param {number} index new start index
 */
Scrollbar.prototype.setStart = function (index) {
    if (this.children.length > 0 || this.locked) return;

    this.start = index;
    if (this.start < 0) this.start = 0;
    if (this.start >= this.end) this.start = this.end - 1;
    if (this.start > this.index) this.index = this.start;
}

/**
 * Set the end position
 * @param {number} index new end index
 */
Scrollbar.prototype.setEnd = function (index) {
    if (this.children.length > 0 || this.locked) return;

    this.end = index;
    if (this.end >= this.getSize()) this.end = this.getSize() - 1;
    if (this.end <= this.start) this.end = this.start + 1;
    if (this.end < this.index) this.index = this.end;
}

/**
 * Set the locked state of the scrollbar.
 * @param {boolean} locked whether or not the scrollbar is locked
 */
Scrollbar.prototype.setLocked = function (locked) {
    this.locked = locked;
}

/**
 * Update the dimensions of the scrollbar.
 * @param {number} newWidth new width for the scrollbar
 * @param {number} newHeight new height for the scrollbar
 */
Scrollbar.prototype.setDimensions = function (newWidth, newHeight) {
    this.width = newWidth;
    this.height = newHeight;
}

/**
 * Update the location parameters in the scrollbar.
 * @param {number} newX new x coordinate for the scrollbar
 * @param {number} newY new y coordinate for the scrollbar
 */
Scrollbar.prototype.setLocation = function (newX, newY) {
    this.x = newX;
    this.y = newY;
}

/**
 * Update the number of segments displayed in the scrollbar.
 * @param {number} size number of segments
 */
Scrollbar.prototype.setSize = function (size) {
    this.size = size;
}

/**
 * Add a linked scrollbar to this scrollbar
 * @param {Scrollbar} link linked scrollbar
 */
Scrollbar.prototype.addLink = function (link) {
    this.links.push(link);
}

/**
 * Remove a linked scrollbar from this scrollbar
 * @param {Scrollbar} link linked scrollbar to remove
 */
Scrollbar.prototype.removeLink = function (link) {
    const index = this.links.findIndex(linked => linked.id === link.id);
    if (index >= 0) {
        this.links.splice(index, 1);
    }
}

/**
 * Add a child scrollbar to this scrollbar
 * @param {Scrollbar} child child scrollbar
 */
Scrollbar.prototype.addChild = function (child) {
    this.children.push(child);
}

/**
 * Remove a child scrollbar from this scrollbar
 * @param {Scrollbar} child child scrollbar to remove
 */
Scrollbar.prototype.removeChild = function (child) {
    const index = this.children.findIndex(knownChild => knownChild.id === child.id);
    if (index >= 0) {
        this.children.splice(index, 1);
    }
}

/**
 * Add an annotation to this scrollbar
 * @param {string} id id of the annotation
 * @param {Array<number>} colour array of numbers representing an hsl colour value
 * @param {number?} opt_index optionally set index for the annotation (otherwise current index is used)
 */
Scrollbar.prototype.addAnnotation = function (id, colour, opt_index) {
    const index = opt_index || this.index;
    const preExisting = this.annotations.find(annotation => annotation.index === index);
    if (preExisting) {
        this.updateAnnotation(preExisting.id, preExisting.index, colour);
        return true;
    } else if (index >= 0 && index < this.getSize()) {
        this.annotations.push({
            id: id,
            index: index,
            colour: colour,
        });
        /* Linked scrollbars receive identical annotation colours/index but are disconnected */
        this.links.forEach(link => link.addAnnotation(generateAnnotationId(), colour, index));
        /* Child scrollbars receive identical annotations, but not necessarily same index */
        this.children.forEach(child => {
            if (opt_index) {
                child.addAnnotation(id, colour, Math.floor(opt_index / this.getSize() * child.getSize()));
            } else {
                child.addAnnotation(id, colour);
            }
        });
        return true;
    }
    return false;
}

/**
 * Update an annotation colour and its linked/child annotations
 * @param {string} id id of the annotation
 * @param {number} index index of the annotation
 * @param {Array<number>} colour new colour for the annotation
 */
Scrollbar.prototype.updateAnnotation = function (id, index, colour) {
    let annotation = null;
    if (annotation = this.annotations.find(anno => anno.id === id)) {
        /* Found annotation with identical id within the scrollbar, change its colour */
        annotation.colour = colour;
        this.links.forEach(link => link.updateAnnotation(id, index, colour));
        this.children.forEach(child => child.updateAnnotation(id, index, colour));
    } else if (annotation = this.annotations.find(anno => anno.index === index)) {
        /* Found annotation with identical index within the scrollbar, change its colour */
        annotation.colour = colour;
        this.links.forEach(link => link.updateAnnotation(id, index, colour));
        this.children.forEach(child => child.updateAnnotation(id, index, colour));
    }
}

/**
 * Load in an annotation from the scrollbar
 * @param {string} id id of the annotation to load in
 */
Scrollbar.prototype.loadAnnotation = function (id) {
    if (this.locked) return;

    const annotation = this.annotations.find(annotation => annotation.id === id);
    if (annotation) {
        const index = annotation.index;
        this.index = index;
        if (this.index < this.start) {
            this.index = this.start;
        } else if (this.index > this.end) {
            this.index = this.end;
        }
        if (this.index < 0) {
            this.index = 0;
        } else if (this.index >= this.getSize()) {
            this.index = this.getSize() - 1;
        }
        this.children.forEach(child => child.loadAnnotation(id));
    }
}

/**
 * Remove an annotation from the scrollbar
 * @param {string} id id of the annotation to remove
 * @param {string} annotationIndex index of the annotation to remove
 */
Scrollbar.prototype.removeAnnotation = function (id, annotationIndex) {
    if (this.locked) return;

    let index = -1;
    if ((index = this.annotations.findIndex(annotation => annotation.id === id)) >= 0) {
        this.annotations.splice(index, 1);
        this.links.forEach(link => link.removeAnnotation(id, annotationIndex))
        this.children.forEach(child => child.removeAnnotation(id, annotationIndex));
    } else if ((index = this.annotations.findIndex(annotation => annotation.index === annotationIndex)) >= 0) {
        this.annotations.splice(index, 1);
        this.links.forEach(link => link.removeAnnotation(id, annotationIndex))
        this.children.forEach(child => child.removeAnnotation(id, annotationIndex));
    }
}

/* Convert scrollbar to JSON */
Scrollbar.prototype.toJSON = function () {
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        size: this.size,
        index: this.index,
        start: this.start,
        end: this.end,
        locked: this.locked,
        annotations: this.annotations,
        links: this.links.map(link => link.id),
        children: this.children.map(child => child.id),
    }
}

/* Load scrollbar from JSON */
Scrollbar.prototype.fromJSON = function (json) {
    this.id = json.id;
    this.x = json.x;
    this.y = json.y;
    this.width = json.width;
    this.height = json.height;
    this.size = json.size;
    this.index = json.index;
    this.start = json.start;
    this.end = json.end;
    this.locked = json.locked;
    this.annotations = json.annotations;
    return this;
}