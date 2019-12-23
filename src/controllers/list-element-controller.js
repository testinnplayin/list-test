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

                return ListElement.find().lean();
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
    getNormalPagination (req, res, next) {
        let conn;

        dbConnector.openDBConnection()
            .then(c => {
                if (!c) {
                    req.errStatus = 404;
                    throw new Error(errMsgs.dbErr);
                }

                conn = c;

                const ListElement = conn.model('ListElement', ListElementSchema);

                return ListElement.find({})
            })
            .catch(next);
    }
};