"use strict";

const http = require("http");

const express = require("express");

const app = express();

const PORT = 3000;


const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const listElementRouter = require("./src/routes/list-element");

app.use("/list-elements", listElementRouter);

app.use("*", (req, res) => {
    return res.status(404).json({
        status : 404,
        message : "Resource not found"
    });
});

const server = http.createServer(app);

server.listen(PORT, err => {
    if (err) {
        console.error(`[ERROR] There has been a problem while starting up server: ${err}`);
    }
    console.log(`---- Server listening on port ${PORT} ----`);
});

process.on("exit", () => {
    console.log("---- Server is closing ----");
});

process.on("SIGINT", () => {
    console.log("Server is manually being shut down");
    server.close();
});