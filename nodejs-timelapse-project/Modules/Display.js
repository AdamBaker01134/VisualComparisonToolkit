function Display (id, x, y, width, height, frames, timestamps, images) {
    this.id = id;
    
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.frames = frames;
    this.timestamps = timestamps;
    this.images = images;

    this.index = 0;
}

Display.prototype.setIndex = function (index) {
    this.index = index;
}