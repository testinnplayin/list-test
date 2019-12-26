"use strict";

const express = require("express");

const router = express.Router();

const bucketController = require("../controllers/bucket-controller");

const bucketMiddleware = require("../middleware/bucket-middleware");

router.get(
    "/",
    bucketMiddleware.checkForQueryPresence,
    bucketController.getBuckets
);

router.get("/:bucket", bucketController.getBucket);

router.put("/:listElementId", bucketController.turnOffListElement);

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