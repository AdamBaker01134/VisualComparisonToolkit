/* Application Header View */
function Headerview () {

}

Headerview.prototype.setModel = function (model) {
    this.model = model;
}

Headerview.prototype.setInteractionModel = function (imodel) {
    this.imodel = imodel;
}

Headerview.prototype.draw = function () {
    document.getElementById("loading-spinner").style.display = this.model.loading ? "block" : "none";
}

/* Model interface function */
Headerview.prototype.modelChanged = function () {
    this.draw();
}