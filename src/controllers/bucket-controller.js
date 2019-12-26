"use strict";

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
                return res.status(200).json({ list_elements : result.sendListElements() });
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    },
    turnOffListElement (req, res, next) {
        let conn, updatedBucket, Bucket;

        dbConnector.openDBConnection()
            .then(c => {
                conn = c;

                Bucket = conn.model("Bucket", BucketSchema);

                return Bucket.findOne({ _id : req.params.bucketId }).lean();
            })
            .then(result => {
                let listElements = result.list_elements;
                let elOfInterest = listElements.find(el => el._id.toString() === req.params.listElementId);

                elOfInterest.is_active = false;

                return Bucket.findOneAndUpdate({ _id : ObjectId(result._id) }, { $set : result }, { new : true });
            })
            .then(result => {

                updatedBucket = result;

                return res.status(200).json({ updated_bucket : result });
            })
            .then(() => {
                // NOTE: following emulates inactivation of all workflows (in this case list elements) affiliated with a bucket
                const activeElements = updatedBucket.list_elements.filter(el => el.is_active);
                const lng = activeElements.length;

                if (lng === 0) {
                    return Bucket.findOneAndUpdate({ _id : updatedBucket._id }, { $set : { deleted : true } });
                }
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    }
};