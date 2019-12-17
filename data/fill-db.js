"use strict";

const dbConnector = require("../database/db-connector");

const faker = require("faker");

const { ListElementSchema } = require("../src/models/list-element");

function createData () {
    const NUM_OF_DOCS = 1000;

    let newDocs = [];

    for (let i = 0; i < NUM_OF_DOCS; i++) {
        newDocs.push({
            name : faker.random.word(),
            prop1 : faker.random.words(),
            prop2 : faker.random.number(),
            prop3 : faker.random.number(),
            prop4 : faker.random.words()
        });
    }

    return newDocs;
}

function runScripts() {
    console.log("---- Running scripts to fill database ----");
    const newDocs = createData();

    let c;

    dbConnector.openDBConnection()
        .then(conn => {
            console.log("---- Connected to database ----");
            c = conn;
            const ListElement = conn.model("ListElement", ListElementSchema);

            return ListElement.bulkWrite(newDocs.map(newDoc => {
                return {
                    insertOne : {
                        "document" : newDoc
                    }
                };
            }));
        })
        .then(results => {
            // console.log("results ", results);
            console.log("---- Documents successfully written to database, closing database ----");
            return dbConnector.closeDBConnection(c);
        })
        .catch(err => console.error(err));
}

runScripts();