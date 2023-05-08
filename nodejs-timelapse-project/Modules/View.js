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
            display.height + 20 + 30,
            10
        );

        image(
            display.images[display.index],
            display.x + 10,
            display.y + 10,
            display.width,
            display.height
        );

        /* Scrollbar */
        let lineGap = display.width / display.images.length;
        let trianglePos = lineGap * (0.5 + display.index);
        fill("rgb(34, 154, 34)");
        rect(
            display.x + 10,
            display.y + 10 + display.height,
            display.width,
            30
        );

        fill(0);
        triangle(
            trianglePos + display.x + 10,
            display.y + 10 + display.height + 5,
            trianglePos + display.x + 10 - 5,
            display.y + 10 + display.height + 30 - 0.5,
            trianglePos + display.x + 10 + 5,
            display.y + 10 + display.height + 30 - 0.5
        );
    });
}

View.prototype.modelChanged = function () {
    this.draw();
}