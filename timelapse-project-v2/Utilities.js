// Turn on strict mode:
"use strict";

/*
 * Extend p5.dom functionality.
 */
function createElementWithID(tag, content, id, className) {
    let el = createElement(tag, content);
    el.id(id);
    el.class(className);
    return el;
}