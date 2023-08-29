const tutorial2 = `
<h1>Tutorial 2 - Crop Flowering Cycles</h1>
<p>
Once again, image you’re a plant scientist. This time, you’re investigating the flowering cycles of canola crops.
You’ve collected images of three separate crops flowering over the course of a month.
Your task is to find when each of the three canola crops begins to flower, how long each of the flowering cycles are, and note any discrepancies between the three crops.
</p>
<p>
The three videos have been pre-loaded and resized to fill the screen.
If they are too small, or too larger, feel free to resize them as shown in tutorial 1.
</p>
<img src="./tutorials/img/tutorial-task-2-1.png" />
<p>
Lucky for you, the software used to collect these images provided timestamps to aid in your analysis.
Toggle the “Timestamp/Label” checkbox in the middle of the webpage header to display the timestamps at the top of each video display.
</p>
<img src="./tutorials/img/tutorial-task-2-2.png" />
<p>
Now you can begin playing through all the videos. Scrub the global timeline to play all the videos simultaneously.
Once you see that a crop is beginning to flower, pause.
This is a significant point in the video that you should probably mark in the timeline.
To do this, select the video and click “Save Annotation” in the right side of the webpage header.
</p>
<img src="./tutorials/img/tutorial-task-2-3.png" />
<p>
A prompt will appear asking for an annotation name.
Name it something relevant to the event, like “Flowering Start”.
Click Ok, and now you will see a mark appear within timeline. Hovering over the mark will highlight it, and clicking on the mark will jump the video to that position.
</p>
<img src="./tutorials/img/tutorial-task-2-4.png" />
<p>
Now that you have that position marked,  lock it to maintain the position within the video.
Click the “Lock” checkbox in the right side of the webpage header.
This will lock the video in its current state, greying out the video timeline.
</p>
<img src="./tutorials/img/tutorial-task-2-5.png" />
<p>
Repeat these steps with the remaining two crop videos.
Once you’ve got your flowering start positions, find and mark the points in each video where the crop has reached its peak (i.e., when it appears to stop growing).
Now, you should have two marks in each video timeline.
Click back and forth between the two marks of each video and observe the timestamps. 
</p>
<ul>
<li>Which crop flowered first?</li>
<li>Which crop finished flowering first?</li>
<li>Approximately, which crop had a larger/longer flowering cycle?</li>
</ul>
<p>
You can also remove the excess video to only include the flowering cycles.
To do this, begin by clicking on your start position in a video, and right click the left white marker.
This will snap the marker to your current position.
Click your end position, then right click the right white marker to repeat this process. 
You have now created a subset of the original video.
</p>
<img src="./tutorials/img/tutorial-task-2-6.png" />
<p>
Once you’ve subset each video, scrub through all the videos and compare the full flowering cycles.
You will notice that even though the lengths of each video are different, each video plays start to finish in the same amount of time.
This is a technique called normalization.
</p>
<p>
If you want to play through each video without normalization, simply toggle the normalize checkbox in the middle of the webpage header.
</p>
<img src="./tutorials/img/tutorial-task-2-7.png" />
<ul>
<li>Discuss your experience comparing the flowering cycle as a subset versus a full video.</li>
<li>Did setting the start/end markers aid you in comparing the flowering cycles? Why or why not? </li>
<li>Did you prefer a normalized or an unnormalized system to accomplish this task? Why?</li>
</ul>
`;