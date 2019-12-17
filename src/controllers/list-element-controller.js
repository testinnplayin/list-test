"use strict";

const dbConnector = require("../../database/db-connector");

const { ListElementSchema } = require("../models/list-element");

module.exports = {
    getNormal (req, res, next) {
        let conn;
        dbConnector.openDBConnection()
            .then(c => {
                if (!c) {
                    req.errStatus = 500;
                    throw new Error(`problem while connecting to database`);
                }

                conn = c;

                const ListElement = conn.model("ListElement", ListElementSchema);

                return ListElement.find();
            })
            .then(lElements => {
                console.log("lElements");
                console.log(lElements);

                return res.status(200).json({ list_elements : lElements });
            })
            .catch(next);
    }
};