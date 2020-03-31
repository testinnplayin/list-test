"use strict";

const dbConnector = require("../../database/db-connector");

const streamHelpers = require("../helpers/stream-helpers");

const { ListElementSchema } = require("../models/list-element");

const errMsgs = {
    dbErr : `problem while connecting to database`,
    findErr : "problem while retrieving data from database"
};

module.exports = {
    getNormal (req, res, next) {
        let conn;
        dbConnector.openDBConnection()
            .then(c => {
                if (!c) {
                    req.errStatus = 500;
                    throw new Error(errMsgs.dbErr);
                }

                conn = c;

                const ListElement = conn.model("ListElement", ListElementSchema);

                return ListElement.find({ is_active : true }).lean();
            })
            .then(lElements => {
                if (!lElements) {
                    req.errStatus = 500;
                    throw new Error(errMsgs.findErr);
                }

                return res.status(200).json({ list_elements : lElements });
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    },
    getStream (req, res, next) {
        let conn, listElements;
        dbConnector.openDBConnection()
            .then(c => {
                if (!c) {
                    req.errStatus = 404;
                    throw new Error(errMsgs.dbErr);
                }

                conn = c;
                console.log("start of request ", new Date());
                const ListElement = conn.model("ListElement", ListElementSchema);

                return ListElement.find().lean();
            })
            .then(lEls => {
                if (!lEls) {
                    req.errStatus = 500;
                    throw new Error(errMsgs.findErr);
                }

                listElements = lEls;

                streamHelpers.chunkArrayOfData(listElements, res);
            })
            // NOTE: this will run before streaming has finished but should not normally be a problem
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    },
    // this is the 'normal' pagination call i.e. no bucket
    // however, it does not use skipping as in classic pagination; instead it uses an inferior date limit
    // it returns a list of 30 documents in descending creation date order that are active
    getNormalPagination (req, res, next) {
        const userQuery = req.query;
        let uQueryProps = [];

        // we want to have the number of properties inside the query in case it is not set in the client and returns an empty object
        if (userQuery) {
            uQueryProps = Object.keys(userQuery);
        }

        let dbQuery;

        // if the query isn't set or does not exist, then just query on active state
        // if on the other hand the query exists, then add a check on the createdAt field with most recent first (so each subsequent query is in descending order)
        dbQuery = { is_active : true };

        if (uQueryProps.length > 0) {
            // generate a new ISODate() object from the date string; we need this for querying MongoDB based on date
            const dateObj = new Date(userQuery.date);

            if (!dateObj) {
                req.errStatus = 400;
                throw new Error("pagination query badly-formed");
            }

            dbQuery.created_at = { $lte :  dateObj };
        }
        
        let conn;

        dbConnector.openDBConnection()
            .then(c => {
                if (!c) {
                    req.errStatus = 404;
                    throw new Error(errMsgs.dbErr);
                }

                conn = c;
                console.log("start of request ", new Date());
                const ListElement = conn.model('ListElement', ListElementSchema);

                return ListElement
                    .find(dbQuery)
                    .sort({ createdAt : -1 })
                    .limit(20)
                    // .lean();
                    .setOptions({ explain : "executionStats" });
            })
            .then(results => {
                console.log("end of request ", new Date());
                return res.status(200).json({ list_elements : results });
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    },
    getPage (req, res, next) {
        const userQuery = req.query;
        let page, elementsPerPage;

        (userQuery.page) ? page = Number.parseInt(userQuery.page) : page = 1;
        (userQuery.limit)
            ? elementsPerPage = Number.parseInt(userQuery.limit)
            : elementsPerPage = 10;

        let conn;

        dbConnector.openDBConnection()
            .then(c => {
                conn = c;
                console.log("start of request ", new Date());
                const ListElement = conn.model('ListElement', ListElementSchema);
                
                return ListElement
                    .find({ is_active : true })
                    .skip(page)
                    .sort({ createdAt : -1 })
                    .limit(elementsPerPage)
                    .setOptions({ explain : "executionStats" });
                    // .lean();
            })
            .then(results => {
                console.log("end of request ", new Date());
                return res.status(200).json({ list_elements : results });
            })
            .then(() => dbConnector.closeDBConnection(conn))
            .catch(next);
    },
};