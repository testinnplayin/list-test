"use strict";

module.exports = {
    checkForQueryPresence (req, res, next) {
        const userQuery = req.query;
        const userQueryKeys = Object.keys(userQuery);

        if (!userQuery || userQueryKeys.length === 0) {
            req.errStatus = 400;
            throw new Error("server does not know what resources to get");
        }

        next();
    }
};