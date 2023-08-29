const tutorial3 = `
<h1>Tutorial 3 - Pitch Tunneling & Break</h1>
<p>
You are an MLB analyst that has been recruited to analyze pitch tunneling and compare the break in pitches thrown by different players.
</p>
<ul>
<li>
<strong>Pitch tunneling</strong>
is the idea that if the trajectory of two different pitches remains the same for long enough, then the batter will have a harder time figuring out the pitch type of the ball.
</li>
<li>
<strong>Break in a pitch</strong>
refers to the amount of horizontal/vertical movement the ball exhibits along its flight path.
</li>
</ul>
<p>
Your task is to compare two separate pitchers and determine who is better at pitch tunneling, and who has a larger break in their pitch.
</p>
<p>
Two pairs of videos have been pre-loaded into the toolkit.
The first two videos are Daniel Hudson’s pitches.
The last two videos are Lance Lynn’s pitches.
Resize the videos as you see fit.
</p>
<img src="./tutorials/img/tutorial-task-3-1.png" />
<p>
We want to overlay our videos, but it looks like the Daniel Hudson videos are misaligned.
Video alignment can be done automatically using a technique called coincident points:
</p>
<ol>
<li>
Press the comma key to enter coincident pointing mode (this will highlight the canvas in blue and change your cursor to a pointer).
</li>
<li>
On the misaligned video (zoomed in Daniel Hudson video), click on Daniel Hudson’s glove to place your first point.
</li>
<li>
Then, click on the back of his shoe to place your second point.
</li>
<li>
Go to the second Daniel Hudson video, and place two more points on his glove and shoe in the same order.
</li>
<li>
Once the fourth point is placed, the first video will snap to align with the second video.
</li>
<li>
Exit coincident pointing mode by pressing the comma key again.
</li>
</ol>
<img src="./tutorials/img/tutorial-task-3-2.png" />
<p>
Drag one of the Daniel Hudson videos on top of the other to create an overlay.
Repeat this process with the two Lance Lynn videos.
Your layout will look messy now, so you can delete the original videos by selecting them and pressing Delete.
Then, resize and position the two overlays side-by-side like this:
</p>
<img src="./tutorials/img/tutorial-task-3-3.png" />
<p>
Overlays are like regular videos, but there are some key differences.
Each overlay comes with three timelines: two for each independent video, and the third which controls both.
Try scrubbing through the bottom timeline of each overlay. Doing so will scrub through the overlayed videos.
</p>
<p>
Now, scrub through each overlay until you reach the point where the pitcher releases the ball (if this happens at two different times in the overlay, scrub through each individual video to synchronize the two layers to the point of release).
</p>
<p>
Note that you can also pan the top layer of the overlay by clicking and dragging the video with the middle mouse button.
This can be used for further align the two videos.
</p>
<p>
Once you are happy with how they look, play through each overlay independently and compare.
</p>
<ul>
<li>
Do you see pitch tunneling occurring and/or break in the ball?
</li>
<li>
Who has a more consistent flight path?
</li>
<li>
Who has a larger break in their pitch?
</li>
<li>
Were the overlay techniques helpful in your comparison? What could make them feel better?
</li>
<li>
Which technique did you find most useful?
</li>
</ul>
<p>
Once you are satisfied with your analysis, you can leave this page.
</p>
`;