/**
 * Express node.js server for hosting the html page from your local domain.
 * Port is 30500.
 */

"use strict";

const express = require("express");
const app = express();
const PORT = 30500;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
	res.sendFile("video-comparison.html", { root: __dirname });
});

app.listen(PORT, () => {
	console.log(`Successfully started express node js server. Listening on http://localhost:${PORT}.`);
});