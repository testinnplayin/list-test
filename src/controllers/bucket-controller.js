"use strict";

const dbConnector = require("../../database/db-connector");
const { BucketSchema } = require("../models/bucket");

module.exports = {
    getBuckets (req, res, next) {
        let conn;

        dbConnector.openDBConnection()
            .then(c => {
                conn = c;
                
                const Bucket = conn.model("Bucket", BucketSchema);
                const userQuery = req.query.bucket;

                return Bucket.find({ compound_id : { $regex : `${userQuery}` } })
                    .sort({ createdAt : -1 })
                    .limit(10);
            })
            .then(results => {
                if (!results) {
                    req.errStatus = 404;
                    throw new Error("cannot find any buckets");
                }

                return res.status(200).json({ buckets : results });
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    },
    getBucket (req, res, next) {
        let conn;

        dbConnector.openDBConnection()
            .then(c => {
                conn = c;

                const Bucket = conn.model("Bucket", BucketSchema);

                return Bucket.findOne({ compound_id : req.params.bucket });
            })
            .then(result => {
                return res.status(200).json({ bucket : result });
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    }
};