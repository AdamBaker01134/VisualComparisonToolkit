// Turn on strict mode.
'use strict';

/*
 * For displaying low-res thumbnails below the scrollbar.
 */
function Loader(x, y, w, h, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    // Define the amount of timeout between images. (In milliseconds).
    // To check for multiple loading threads, set this to something high,
    //  like 1000, then make sure only one image loads per second.
    this.timeout = 5;

    this.imgPath = '';          // Where to find the images.
    this.filenames = [];        // File names of the images.
    this.fileIndices = [];      // For storing positions of images to load.
    this.imgArr = [];           // For storing the actual images.
    this.loadOrder = [];        // Defines order in which to load thumbnails.
    this.orderPlaced = [];

    this.capacity = 0;
    this.offset = 0;            // Offset from start of images array.
    this.numLoaded = 0;
    this.loading = false;
    this.isReady = false;
    this.loadPaused = false;
    this.loadMode = 'fill';     // must be 'fill' or 'linear'
    this.loadID = 0;
}

///////////////////////////////////////////////////////////////////////////////
// Prototype functions in alphabetical order from here on.                   //
///////////////////////////////////////////////////////////////////////////////

/*
 * Assign the given index to the load order.
 */
Loader.prototype.assignToLoadOrder = function(x) {
    ensureInteger(x);
    if (x < 0 || x >= this.orderPlaced.length) throw 'Invalid parameter: ' + x;
    this.loadOrder.push(x);
    this.orderPlaced[x] = true;
}

/*
 * Accessor for the current capacity.
 */
Loader.prototype.getCapacity = function() {
    return this.capacity;
}

/*
 * Report the current load mode.
 */
Loader.prototype.getLoadMode = function() {
    return this.loadMode;
}

/*
 * Reports whether the window has more to load.
 */
Loader.prototype.isLoading = function() {
    return this.loading;
}

/*
 * Report whether this window is paused.
 */
Loader.prototype.isPaused = function() {
    return this.loadPaused;
}

/*
 * Reports whether the window is ready for display.
 */
Loader.prototype.isReadyToDisplay = function() {
    return this.isReady;
}

/*
 * Loads the image
 */
Loader.prototype.load = function(start = 0, end = -1, step = -1) {
    ensureNonEmptyString(this.imgPath);
    ensureNonEmptyArray(this.filenames);
    ensureInteger(start);
    ensureInteger(end);
    ensureInteger(step);
    console.log("Initiating load of " + this.constructor.name + ": " + this.id);

    // Prep the window for loading.
    this.resetToCapacity();
    this.loading = true;

    // Define when loading should start and end.
    if (start < 0 || start >= this.filenames.length) start = 0;
    if (end < 0 || end >= this.filenames.length) end = this.filenames.length; 

    // Determine the rate at which steps through the file occur.
    let calcStep = Math.floor((end - start) / this.capacity);
    if (step < 0 || step > calcStep) step = calcStep;

    // Calculate the indices to use in the filenames array.
    this.fileIndices[0] = Math.floor(start + this.offset);
    for (let i = 1; i < this.capacity; i++) {
        this.fileIndices[i] = this.fileIndices[i - 1] + step;
    }

    // Determine load order.
    switch(this.loadMode) {
        case 'linear':
            for (let i = 0; i < this.capacity; i++) this.assignToLoadOrder(i);
            break;
        case 'fill':
            this.assignToLoadOrder( Math.floor( this.capacity / 2 ) );  // Mid
            this.assignToLoadOrder( 0 );                                // First
            this.assignToLoadOrder( this.capacity - 1 );                // Last

            // log(n) times through whole array, which is size n,
            // so this selection algorithm is O(n*log(n)).
            let prev = 0;
            let next = 1;
            for (let i = 3; i < this.capacity; i++) {
                if (prev >= this.capacity - 1) prev = 0;

                next = prev + 1;
                while (this.orderPlaced[next]) {
                    prev = next;
                    next += 1;
                    if (next >= this.capacity) {
                        prev = 0;
                        next = 1;
                    }
                }

                while (!this.orderPlaced[next]) next++;

                this.assignToLoadOrder( Math.ceil( (next + prev)/2 ) );  // Halfway
                prev = next;
            }
            break;
        default:
            throw 'Invalid property: ' + this.loadMode;
    }
    setTimeout( this.loadNextImage.bind(this, this.loadID), this.timeout );
}

/*
 * For when an image has finished loading.
 *
 * Loads the next image, if another needs loading.
 */
Loader.prototype.loadFinished = function(ldID, index) {
    // Catch asynchronous loads that are no longer valid.
    if (ldID !== this.loadID) return;

    this.isReady = true;
    this.numLoaded++;

    document.dispatchEvent(new CustomEvent( 
        'imageLoaded',
        {
            detail: {
                obj: this,
                idx: index
            }
        }
    )); 

    if (this.numLoaded < this.fileIndices.length) {
        setTimeout( this.loadNextImage.bind(this, this.loadID), this.timeout );
    } else {
        console.log("Finished loading of " + this.constructor.name + ": " + this.id);
        this.loading = false;
        document.dispatchEvent(new CustomEvent(
            'loadFinished',
            {
                detail: {
                    obj: this,
                }
            }
        ));
    }
}

/* 
 * Load the next image.
 */
Loader.prototype.loadNextImage = function(ldID) {
    if (ldID !== this.loadID ||
        this.loadPaused || 
        this.numLoaded >= this.capacity) {
        return;
    }

    let nextIndex = this.loadOrder.shift();
    this.imgArr[nextIndex] = loadImage(
        this.imgPath + this.filenames[this.fileIndices[nextIndex]],
        this.loadFinished.bind(this, this.loadID, nextIndex),
        loadError,
        doNothing
    );
}

/*
 * Pause the loading of this Loader.
 */
Loader.prototype.pause = function() {
    this.loadPaused = true;
}

/*
 * Reset the Loader object to default state, adjusting the capacity if one
 * is provided.
 */
Loader.prototype.resetToCapacity = function(cap = this.capacity) {
    this.fileIndices.fillWithFalse(cap);
    this.imgArr.fillWithFalse(cap);
    this.orderPlaced.fillWithFalse(cap);
    this.loadOrder.clear();

    this.numLoaded = 0;
    this.loading = false;
    this.isReady = false;
    this.loadPaused = false;
    this.loadID++;  // Ensure continuation of unique load IDs.
}

/*
 * Tell this window to resume loading.
 */
Loader.prototype.resume = function() {
    // This looks a little finnicky, but it's crucial that the operations 
    //  occur like this in order to make sure that loads can resume properly, 
    //  and that multiple asynchronous loading threads don't spawn.
    let wasPaused = this.loadPaused;
    this.loadPaused = false;
    if (this.loading && wasPaused) {
        console.log('Resuming loading of ' + this.constructor.name + ': ' + this.id);
        this.loadNextImage(this.loadID);
    }
}

/*
 * Set the capacity of this Loader.
 */
Loader.prototype.setCapacity = function(cap) {
    ensureInteger(cap);
    this.capacity = cap;
}

/*
 * Provide access to a previously loaded array containing the file names
 *  of the thumbnails to load.
 *
 * NOTE: Current strategy is that filenames are the same across all
 *       image sizes. Allows use of just one array, whose reference is
 *       shared between objects.
 */
Loader.prototype.setFilenames = function(files) {
    ensureNonEmptyArray(files);
    ensureString(files[0]);
    this.filenames = files;
}

/*
 * Set the path of the images to load.
 */
Loader.prototype.setImagePath = function(path) {
    ensureString(path);
    this.imgPath = path;
}

/*
 * Sets the load mode being used.
 */
Loader.prototype.setLoadMode = function(mode) {
    ensureValidLoadMode(mode);
    this.loadMode = mode;
}    

/*
 * Set the offset from which to load images.
 */
Loader.prototype.setOffset = function(offs) {
    this.offset = offs;
}

