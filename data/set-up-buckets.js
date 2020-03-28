"use strict";

const dbConnector = require("../database/db-connector");

const { BucketSchema } = require("../src/models/bucket");
const { ListElementSchema } = require("../src/models/list-element");

let overallCounter = 0;
let counterOfFiveBuckets = 0;

function createBucket (arrOfEls) {
    const lng = arrOfEls.length;

    if (lng <= 10) {
        if (overallCounter % 10 === 0) {
            counterOfFiveBuckets ++;
            overallCounter = 1;
        } else {
            overallCounter ++;
        }

        return {
            compound_id : `Bucket${counterOfFiveBuckets}_${overallCounter}`,
            counter : lng,
            list_elements : arrOfEls
        };
    }
}

function cutArr (arr, repackagedArr) {
    const lng = arr.length;
    const cap = 10;

    const subArr = arr.slice(0, cap);
    repackagedArr.push(subArr);

    const newArrOfEls = arr.slice(cap, lng);

    if (newArrOfEls.length > 0) {
        repackagedArr = cutArr(newArrOfEls, repackagedArr);
    }

    return repackagedArr;
}

function runScripts () {
    let conn;

    dbConnector.openDBConnection()
        .then(c => {
            conn = c;

            const ListElement = conn.model("ListElement", ListElementSchema);

            return ListElement.find().lean();
        })
        .then(listElements => {
            const repackagedArr = cutArr(listElements, []);
            const Bucket = conn.model("Bucket", BucketSchema);

            return Bucket.bulkWrite(repackagedArr.map(listEls => {
                return {
                    insertOne : {
                        "document" : createBucket(listEls)
                    }
                };
            }));
        })
        .then(() => dbConnector.closeDBConnection(conn))
        .catch(err => console.error("Error while creating buckets ", err));
}

runScripts();