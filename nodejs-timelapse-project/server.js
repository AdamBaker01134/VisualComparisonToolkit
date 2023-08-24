/**
 * Express node.js server for hosting the html page from your local domain.
 * Port is 3019.
 */

"use strict";

const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const logger = require("./logger");
const app = express();
const PORT = 3019;

// const cloudinary = require("cloudinary").v2;
// cloudinary.config({
//     cloud_name: "dvlz4uiyo",
//     api_key: "686265448666564",
//     api_secret: "DIVDhTMDuGGz1McSZhA-VozdKLc",
//     secure: true,
// });

app.use(cors());

app.use(express.static(__dirname));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.static("pages"));

app.get("/", (req, res) => {
    let userId = req.cookies.userId;
    if (!userId) {
        userId = uuidv4();
        res.cookie("userId", userId);
        logger.trace({ user_id: userId }, "Generated new user id");
    }
    logger.info({ user_id: userId }, "Home page opened");
	res.sendFile("video-comparison.html", { root: __dirname });
});


app.put("/addSnapshot", (req, res) => {
    const userId = req.cookies.userId;
    const snapshot = req.body.snapshot;
    fs.readFile("./snapshots.json", (err, json) => {
        let result;
        if (err) {
            logger.error({ user_id: userId }, "Error: could not read snapshot json. Generating new json...");
            result = [];
        } else {
            try {
                result = JSON.parse(json);
            } catch (err) {
                logger.error({ user_id: userId }, "Error: snapshots.json file corrupted. Generating new json...");
                result = [];
            }
        }
        result.push(snapshot);
        fs.writeFile("./snapshots.json", JSON.stringify(result), err => {
            if (err) {
                logger.error({ user_id: userId }, "Error: could not write updated json to disk...");
                res.status(400).send(err);
            } else {
                logger.trace({ user_id: userId }, "New snapshot successfully added to disk.");
                res.status(200).send("Ok.");
            }
        });
    });
});

app.post("/log", (req, res) => {
    const userId = req.cookies.userId;
    try {
        switch (req.body.type) {
            case "trace":
                logger.trace({ user_id: userId }, req.body.msg);
                break;
            case "error":
                logger.error({ user_id: userId }, req.body.msg);
                break;
            case "info":
            default:
                logger.info({ user_id: userId }, req.body.msg);
                break;
        }
        res.status(200).send("Logged successfully.");
    } catch (err) {
        res.status(400).send(err);
    }
});

// app.get("/getImages", (req, res) => {
// 	let dataset = req.query.dataset;
// 	let result = [];

//     let options = { resource_type: "image", folder: dataset, max_results: 1000 };

//     const listResources = (next_cursor) => {
//         if (next_cursor) {
//             options["next_cursor"] = next_cursor;
//         }
//         // console.log(options);
//         cloudinary.api.resources(options, (error, cloudinary_res) => {
//             if (error) {
//                 console.error(error);
//             }
//             let more = cloudinary_res.next_cursor;
//             let resources = cloudinary_res.resources;

//             for (let resource in resources) {
//                 let resource_object = resources[resource];
//                 let url = resource_object.secure_url;
// 				if (url.includes(dataset)) {
// 					result.push(url);
// 				}
//             }

//             if (more) {
//                 listResources(more);
//             } else {
//                 // console.log("done");
// 				res.send(result);
//             }
//         })
//     }
// 	listResources(null);
// });

app.listen(PORT, () => {
    console.log("Express server is running...");
    logger.info("Successfully started express node js server.");
});
