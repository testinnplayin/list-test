"use strict";

const mongoose = require("mongoose");

const LOCAL_HOST = "mongodb://127.0.0.1:27017/list-test";

module.exports = {
    openDBConnection () {
        const options = {
            useNewUrlParser : true,
            useCreateIndex : true,
            useFindAndModify : false,
            useUnifiedTopology : true
        };
        return mongoose.createConnection(LOCAL_HOST, options);
    },
    closeDBConnection (conn) {
        console.log('Database connection closed');
        return conn.close();
    }
};