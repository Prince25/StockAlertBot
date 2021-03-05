import console from "console";
import fs from "fs";
import util from 'util'
import moment from "moment";

const dir = 'logs/'

export default async function writeErrorToFile(name, error, html = null, status = null) {
    fs.writeFile(dir + name + '.log', util.inspect(error), function(e, result) {
        if(e) console.error('File write error: ', e);
    });
    console.error(moment().format('LTS') + ': Error occured for ' + name + '. Written to ' + dir + name + '.log')
    let message = 'This is usually not a problem but if this error appears frequently, please report the error (and the log) to GitHub.'
    
    if(html) {
        message += '\nHTML written for ' + name + ' to ' + dir + name + 'ErrorPage.html. Please report this bug to GitHub and upload this file'
        fs.writeFile(dir + name + 'ErrorPage.html', html + '\n' + status, function(e, result) {
            if(e) console.error('File write error: ', e);
        });
    }

    console.error(message)
}
