function Model() {
    this.maxImages = 1000;
    this.imagePath = "./img/"
    this.loader = new Loader(this.maxImages, this.imagePath);
}

Model.prototype.getDatasets = function () {
    return this.datasets;
}

Model.prototype.getMaxImages = function () {
    return this.maxImages;
}

Model.prototype.getImagePath = function () {
    return this.imagePath;
}

Model.prototype.loadDatasets = function () {
    this.datasets = this.loader.loadDatasets();
}