/**
 * Express node.js server for hosting the html page from your local domain.
 * Port is 30500.
 */

"use strict";

const fs = require("fs");
const bodyParser = require("body-parser");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const app = express();
const PORT = 30500;

cloudinary.config({
    cloud_name: "dvlz4uiyo",
    api_key: "686265448666564",
    api_secret: "DIVDhTMDuGGz1McSZhA-VozdKLc",
    secure: true,
});

app.use(express.static(__dirname));

app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.sendFile("video-comparison.html", { root: __dirname });
});

app.put("/addSnapshot", (req, res) => {
    const snapshot = req.body.snapshot;
    fs.readFile("./snapshots.json", (err, json) => {
        let result;
        if (err) {
            console.log("Error: could not read snapshot json. Generating new json...");
            result = [];
        } else {
            result = JSON.parse(json);
        }
        result.push(snapshot);
        fs.writeFile("./snapshots.json", JSON.stringify(result), err => {
            if (err) {
                console.error("Error: could not write updated json to disk...");
                res.status(400);
                res.send(err);
            } else {
                res.status(200);
                res.send("Ok.");
            }
        });
    });
});

app.get("/getImages", (req, res) => {
	let dataset = req.query.dataset;
	let result = [];

    let options = { resource_type: "image", folder: dataset, max_results: 1000 };

    const listResources = (next_cursor) => {
        if (next_cursor) {
            options["next_cursor"] = next_cursor;
        }
        // console.log(options);
        cloudinary.api.resources(options, (error, cloudinary_res) => {
            if (error) {
                console.error(error);
            }
            let more = cloudinary_res.next_cursor;
            let resources = cloudinary_res.resources;

            for (let resource in resources) {
                let resource_object = resources[resource];
                let url = resource_object.secure_url;
				if (url.includes(dataset)) {
					result.push(url);
				}
            }

            if (more) {
                listResources(more);
            } else {
                // console.log("done");
				res.send(result);
            }
        })
    }
	listResources(null);
});

app.listen(PORT, () => {
	console.log(`Successfully started express node js server. Listening on http://localhost:${PORT}.`);
});