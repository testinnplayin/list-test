"use strict";

const DOC_CAP = 10;

module.exports = {
    chunkArrayOfData (arrOfData, res) {
        const arrLng = arrOfData.length;

        if (arrLng > 0) {
            console.log("streaming new chunk");
            let chunkToSend = JSON.stringify(arrOfData.slice(0, DOC_CAP));
            chunkToSend += ":::";
            // console.log(chunkToSend);
            res.write(chunkToSend);
            
            const newDataArr = arrOfData.slice(DOC_CAP, arrLng);
            this.chunkArrayOfData(newDataArr, res);
        } else {
            console.log("streaming coming to an end");
            return res.end();
        }
    }
};