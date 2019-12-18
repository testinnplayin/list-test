"use strict";

const DOC_CAP = 10;

module.exports = {
    chunkArrayOfData (arrOfData, res) {
        const arrLng = arrOfData.length;

        if (arrLng > 0) {
            console.log("streaming new chunk");
            const chunkToSend = JSON.stringify(arrOfData.slice(0, DOC_CAP));
            res.write(chunkToSend, err => {
                if (err) {
                    throw new Error("problem while writing chunk ", err);
                }
            });
            
            const newDataArr = arrOfData.slice(DOC_CAP, arrLng);
            this.chunkArrayOfData(newDataArr, res);
        } else {
            console.log("streaming coming to an end");
            return res.end();
        }
    }
};