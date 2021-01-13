import console from "console";
import fs from "fs";
import util from 'util'
import moment from "moment";

export default async function writeErrorToFile(name, error) {
    fs.writeFile('log' + name + '.log', util.inspect(error), function(e, result) {
        if(e) console.error('File write error: ', e);
    });
    console.error(moment().format('LTS') + ': Unhandled error for ' + name + '. Written to log' + name + '.log')
    console.error('This is usually not a problem but if this error appears frequently, please report the error (and the log) to GitHub.')
}
