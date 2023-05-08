function View () {
    this.startTime = 0;
}

View.prototype.setModel = function (model) {
    this.model = model;
}

View.prototype.setInteractionModel = function (iModel) {
    this.iModel = iModel;
}

View.prototype.draw = function () {
    clear();

    this.model.displays.forEach(display => {
        noStroke();
        fill("rgb(190, 190, 190)");
        rect(
            display.x,
            display.y,
            display.width + 20,
            display.height + 20,
            10
        );

        image(
            display.images[display.index],
            display.x + 10,
            display.y + 10,
            display.width,
            display.height
        );
    });
}

View.prototype.modelChanged = function () {
    this.draw();
}