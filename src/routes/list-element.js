"use strict";

const express = require("express");

const router = express.Router();

const listElementController = require("../controllers/list-element-controller");

// basic, traditional get all route
router.get("/", listElementController.getNormal);

// pagination method
router.get("/pages");

// the stream version
router.get("/stream", listElementController.getStream);

router.use((err, req, res, next) => {
    const errStatus = req.errStatus;

    console.error(`[ERROR] ${req.method} at ${req.url}: ${err}`);

    if (!errStatus) {
        errStatus = 500;
    }

    return res.status(errStatus).json({
        status : errStatus,
        message : err.message
    });
});

module.exports = router;