const tutorial2 = `
<h1>Tutorial 2 - Crop Flowering Cycles</h1>
<p>
Once again, image you’re a plant scientist.
This time, you’re investigating the flowering cycles of canola crops.
You’ve collected images of three separate crops flowering over the course of a month.
Your task is to find when each of the three canola crops begins to flower, when each crop stops flowering, and note any discrepancies.
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
Scrub the global timeline to play all the videos.
Compare the flowering cycles of each crop.
This video includes the full growth period, but we don’t need to see that.
Let’s “trim” the video.
</p>
<p>
Scrub through the videos again.
Once you see that a crop is beginning to flower, pause.
Trim the start of the video by right clicking the white marker on the left-side of the green timeline.
This will snap the marker to your current position.
Repeat this trick with the other two videos.
</p>
<img src="./tutorials/img/tutorial-task-2-3.png" />
<p>
Now find the point where a crop seems to stop growing.
We will call this the “peak” of the flowering cycle.
Once you’ve found the peak, trim the end of the video to this position by right clicking the white marker on the right-side of the green timeline.
Repeat with the other two videos.
</p>
<img src="./tutorials/img/tutorial-task-2-4.png" />
<p>
You have now trimmed the original video to only include the flowering cycle.
Scrub through all the videos and compare the full flowering cycles.
Pay attention to the timestamps.
</p>
<ul>
<li>Which crop flowered first?</li>
<li>Which crop peaked first?</li>
</ul>
<p>
You may notice that even though the lengths of each video are different, each video plays start to finish in the same amount of time.
This is a technique called normalization.
If you want to play through each video without normalization, simply toggle the normalize checkbox in the middle of the webpage header.
</p>
<img src="./tutorials/img/tutorial-task-2-5.png" />
<ul>
<li>Discuss your experience comparing the flowering cycle as a subset versus a full video.</li>
<li>Did setting the start/end markers aid you in comparing the flowering cycles? Why or why not? </li>
<li>Did you prefer a normalized or an unnormalized system to accomplish this task? Why?</li>
</ul>
`;