// Turn on strict mode:
"use strict";

let userInput;
let userBotton;

function _createUserPanel() {
    // Div to hold everything.
    let div = createDiv('');
    div.class('annotation');

    // Paregraph to use as descriptor for user.
    let h = createP('User:');
    h.parent(div);

    // User Input.
    userInput = createInput();
    userInput.parent(div);

    //User submit
    userBotton = createButton('Submit');
    userBotton.parent(div);

}
