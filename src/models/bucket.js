"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BucketSchema = Schema({
    compound_id : {
        type : String,
        index : true,
        unique : true,
        required : true
    },
    counter : {
        type : Number,
        required : true,
        default : 0
    },
    deleted : {
        type : Boolean,
        default : false
    },
    list_elements : [
        {
            _id : mongoose.Types.ObjectId,
            name : {
                type : String,
                required : true
            },
            is_active : {
                type : Boolean,
                default : true
            },
            prop1 : String,
            prop2 : Number,
            prop3 : Number,
            prop4 : String,
            createdAt : Date,
            updatedAt : Date
        }
    ]
},
{
    timestamps : true
});

BucketSchema.methods.sendListElements = function () {
    return this.list_elements;
};

module.exports = { BucketSchema };