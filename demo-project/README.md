# Organization and Dependencies
This project makes use of the p5.js framework / library, as well as the p5.dom.js library.

Currently classes are defined, for the most part, in their own file. (There a couple very small classes that are defined within the same file as the class that they are most related to). I made use of JavaScript 'prototypes' to simulate OOP style classes, though be careful because they don't currently behave like normal OOP classes (e.g. nothing is private).

No special GUI design method (e.g. MVC) was used in structuring the classes. Instead, I designed classes around visual elements that would be rendered on the canvas. 

# Classes
Here's a breakdown of the classes I created.

* __TimelapseDisplay__: Central class for each "tab", contains an ImageWindow, a Scrollbar, a Timestamp, and a ThumbnailBar.
* __ImageWindow__: Place for displaying images.
* __Scrollbar__: Scrollbar for selecting which image to display.
* __ScrollbarSegment__: Contains info pertaining to each tick in the scrollbar. Class definition is inside Scrollbar.js file.
* __ThumbnailBar__: For displaying thumbnails below the scrollbar.
* __Timestamp__: To render timestamps corresponding to the image.
* __Loader__: Controls image loading sequences. ImageWindow and ThumbnailBar are extensions.
* __ControlPanel__: Generates DOM elements for controlling how images are loaded.
* __Annotation__: Contains 'Annotation' class and global functions for controlling annotations.

# Program entrypoint
The central control file is currently called "canvas.js" - think of it as the main file in a C or Java program.

# Scripts:
There's a main image processing script that I put together. It is most easily used with timelapse images from a research plot. It may need some deconstructing in order to apply it to a database, if that's where this project ends up going.
* Currently the script takes about 5-6 hours for a plot of around 80,000 to 100,000 images.
* Biggest bottleneck is the image resizing.
* No compression outside of simple resizing is currently being done on the images.

Also available is a short little script I wrote which automatically generates lists of all the funtion headers in your JavaScript code (assuming no headers span multiple lines). I imagine an IDE would probably provide this functionality, and there's probably something better out there, but I just threw this together because it was quick and easy to use while working from the command line.

# File system:

Here's how images are served up:

From the directory in which the server is running, there is an 'img' folder. Inside there is a folder for each 'plot' that is to be made available to the tool. The list of available plots is maintained in 'plots.txt' - this is done automatically by the image processing script, but can be done manually as well when necessary.

Inside each folder, the tool looks for the following files / folders:

* __full/__	--- Contains full sized images.
* __half/__	--- Contains half sized images.
* __quarter/__ --- Contrains quarter sized images.
* __thumbs/__ --- Contains thumbnail sized images.
* __summer-day-frames.txt__	--- Contains the list of filenames of images to serve up.
* __summer-day-timestamps.txt__ --- Contains a list of timestamps corresponding to the images in 'summer-day-frames.txt'

NOTE:	filenames should be the same inside each of the image source directories. That way, filenames inside 'summer-day-frames.txt' can be used regardless of which directory is being searched.

Sample directory tree, from img/:
	
	img/
		plots.txt
		phenowheat_2016_1257/
			full/
				...image files
			half/
				...image files
			quarter/
				...image files
			thumbs/
				...image files
			summer-day-frames.txt
			summer-day-timestamps.txt
		phenolentil_2016_1018/
			full/
				...image files
			half/
				...image files
			quarter/
				...image files
			thumbs/
				...image files
			summer-day-frames.txt
			summer-day-timestamps.txt

In this case, the 'plots.txt' file would look like this:

    phenowheat_2016_1257
    phenolentil_2016_1018

NOTE: Most of this work is done automatically by the image processing script.


