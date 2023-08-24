const tutorial0 = `
<h1>Techniques & System Components</h1>
<h3>Header</h3>
<p>
    The application's header consists of 4 main parts: the title, the loading section, the
    global control section, and the display control section. The loading section is where
    you select which videos you want to load in. The global controls section contains
    controls that apply to all loaded in displays. The display control section contains
    controls that only apply to a single selected display.
</p>
<h3>Global Scrollbar</h3>
<p>
    The global scrollbar (bottom of the application) is connected to all loaded in displays.
    If you time-shift this scrollbar, all unlocked displays will be time-shifted, normalized
    to the global scrollbar.
</p>
<h3>Loading Videos</h3>
<p>
    You can load individual videos or sets of videos by selecting a dataset from the loading
    section of the header and clicking Load. Video sets are grouped in the dropdown under
    their title name.
</p>
<h3>Selecting Displays</h3>
<p>
    You can select a display by simply clicking on the displays image window. This should
    highlight the entire display in a light green colour and a bundle of new control
    elements should appear in the display controls section of the header. You can unselect a
    display by clicking on a selected display.
</p>
<h3>Removing Displays</h3>
<p>
    You can remove a display by selecting it and clicking on the "Remove" button found in
    the display control section of the header.
</p>
<h3>Time-Shifting Videos</h3>
<p>
    You can play through a video manually (time-shift a video) by clicking and dragging the
    green scrollbar found at the bottom of each display.
</p>
<h3>Playing Videos</h3>
<p>
    You can play through a video automatically by selecting a display and pressing the
    spacebar. To pause auto-play, simply press spacebar while the selected video is playing.
</p>
<h3>Start & End Points</h3>
<p>
    Video scrollbars contain start and end point that allow you to constrict a video to a
    specific subset (e.g. the flowering cycle of a plant). Start and end points are the
    white markers which can be dragged just like the main position marker. Scrollbars that
    aren't directly related to an individual video (i.e. global scrollbar, overlay main
    scrollbar) do not contain start and end points.
</p>
<h3>Normalization</h3>
<p>
    Scrollbars that control multiple videos normalize their child scrollbars to keep a
    consistent frame rate. You can turn this feature off by toggling the "Normalize"
    checkbox in the global controls section of the header.
</p>
<h3>Video Timestamps</h3>
<p>
    Each video contains timestamps or labels for each frame. You can toggle the timestamps to
    appear at the top of the video window by toggling the "Timestamp/Label" checkbox in the
    display controls section of the header.
</p>
<h3>Locking Displays</h3>
<p>
    You can lock a display by selecting it and toggling the "Lock" checkbox in the display
    controls section of the header. Locking displays will block any form of time-shifting or
    video manipulation to the display.
</p>
<h3>Filtering Displays</h3>
<p>
    You can filter a video by selecting it and selecting a filter from the "Filter" dropdown
    in the display controls section of the header. This will load in a pre-processed set of
    video images that have been filtered. The affected video will always be the bottom
    layer. To unfilter the video, select "Reset" from the filter dropdown.
</p>
<h3>Annotations</h3>
<p>
    You can save positions within a display by selecting a display and clicking "Save
    Annotation" in the display controls section of the header. This will bring up a prompt
    to input an annotation name. Once you've set a name, a marks will appear in the selected
    displays scrollbars indicating the position of the annotation. You can snap to these
    positions by simply clicking on the marks, or by clicking "Load Annotation" in the
    display controls section of the header.<br>
    WARNING: Annotations do not persist.
</p>
<h3>Moving Displays</h3>
<p>
    You can move displays by clicking and dragging their image window. Doing so will display
    a ghost that you can drag anywhere. If you drop the ghost on an empty cell, the display
    will move to that cell. If you drop a display on another display, it will either create
    an overlay or add a layer to an overlay, depending on the target. If you hover the ghost
    over another display for 2 seconds, the two displays will automatically switch
    positions. Dropping an overlay on any type of display also switches their positions.
</p>
<h3>Resizing Displays</h3>
<p>
    You can resize a display by clicking and dragging the bottom right corner of the
    display. This is limited to the size of the grid cell.
</p>
<h3>Panning/Zooming</h3>
<p>
    You can pan the viewport of an image window by clicking and dragging the image using the
    middle mouse button. You can also zoom this image window by scrolling on the image
    window.
</p>
<h3>Creating Overlays</h3>
<p>
    When you move a normal display on top of another normal display, an overlay is created
    with these two videos. The top layer is transparent by default. If you drop additional
    normal displays on top of an overlay, additional layers will be added to the overlay.
    Each layer contains its own video images, opacity level, filters, etc.
</p>
<h3>Overlay Opacity</h3>
<p>
    You can adjust the opacity of the top layer of an overlay by selecting the overlay and
    adjusting the "Opacity" input in the display controls section of the header. You can
    only manipulate the opacity of the top layer. To adjust other layer opacity, you will
    need to cycle through the layers.
</p>
<h3>Cycling Layers</h3>
<p>
    You can cycle through the layers by selecting an overlay and pressing Tab. This will
    rotate the position of each layer like a queue (top goes to bottom, everyone moves up
    one). You can also auto-cycle through the layers by pressing Shift + Tab. This is very
    handy for when you want to play through the video while cycling.
</p>
<h3>Overlay Comparison Sliders</h3>
<p>
    Overlays have additional modes if they only contain two layers. Two of the three overlay
    modes are the horizontal and vertical comparison slider modes. To activate the
    horizontal and vertical modes, select the overlay and press "-" or "\", respectively. A
    blue line and circle will appear in the overlay, and on either side of the line you will
    see a separate layer. You can adjust the position of the line by clicking and dragging
    the blue circle. Opacity levels in each layer as still active.
</p>
<h3>Overlay Magin Lens</h3>
<p>
    The last overlay mode is the magic lens mode. To active the magic lens, select the
    overlay and press "0". A blue rectangle will appear in the center of the overlay, which
    acts as a lens to peer through the top layer and into the bottom layer. You can move the
    magic lens by clicking and dragging it. It will also resize with the overlay. The
    opacity of the layers outside of the magic lens remain the same, however, opacity does
    not affect the magic lens window.
</p>
<h3>Snapshots</h3>
<p>
    You can save snapshots of your current setup by clicking the "Save Snapshot" button in
    the global controls section of the header. This will bring up a prompt asking for a
    snapshot name. Once you've named your snapshot, it will be sent to the server where it
    will be saved in a shared JSON file. Then, dots called benchmarks will appear in each
    scrollbar at the position of the snapshot. To load a snapshot, you can click on a
    benchmark or select a snapshot from the dropdown in the global controls section of the
    header and click "Load Snapshot". Snapshots can be loaded from any state as long as the
    contained videos remain in the system. <br>
    WARNING: the snapshots are SHARED, so saving multiple snapshot from different locations
    may produce concurrency issues that could corrupt the data.
</p>
`;