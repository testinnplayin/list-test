"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ListElementSchema = Schema({
    name : {
        type : String,
        required : true
    },
    prop1 : String,
    prop2 : Number,
    prop3 : Number,
    prop4 : String
},
{
    timestamps : true
});

// const ListElement = mongoose.model("ListElement", ListElementSchema);

module.exports = {
    ListElementSchema
};