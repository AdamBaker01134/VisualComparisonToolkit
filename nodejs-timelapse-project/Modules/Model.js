/* Application Model */
function Model() {
    this.datasets = [];
    this.maxImages = 1000;
    this.imagePath = "./img/";
    this.normalized = true;
    this.loading = false;
    this.displays = [];
    this.subscribers = [];
}

Model.prototype.setDatasets = function (datasets) {
    this.datasets = datasets;
}

Model.prototype.setNormalized = function (normalized) {
    this.normalized = normalized
}

Model.prototype.setLoading = function (loading) {
    this.loading = loading;
}

Model.prototype.checkScrollbarHit = function (x, y) {
    for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].checkScrollbarHit(x, y)) return true;
    }
    return false;
}

Model.prototype.addDisplay = function (display) {
    this.displays.push(display);
    this.notifySubscribers();
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged())
}

Model.prototype.testUpdateIndex = function (x) {
    this.displays.forEach(display => {
        display.setIndex(x % display.images.length);
    });
    this.notifySubscribers();
}