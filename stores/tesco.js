import { fileURLToPath } from "url";
import { OPEN_URL } from '../main.js'
import fs from "fs";
import threeBeeps from "../beep.js"
import axios from "axios";
import moment from "moment";
import open from "open"
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://tescopreorders.com/uk/ps5'
    tesco(url, interval);
}


let firstRun = new Set();
let urlOpened = false;
let ps5PreorderPage = fs.readFileSync('./stores/html/tescoPreorderPage.html', 'utf-8');
export default async function tesco(url, interval) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
            }
        }).catch(async function (error) {
            console.log(error)
        });
        
        if (res && res.status == 200) {    
            if (res.data.includes(ps5PreorderPage) && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': PlayStation 5 not in stock at Tesco. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (!res.data.includes(ps5PreorderPage)) {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { open(url); urlOpened = true; setTimeout(() => urlOpened = false, 1000 * 115) }  // Open URL every 2 minutes
                console.info(moment().format('LTS') + ': ***** In Stock at Tesco *****: PlayStation 5');
                console.info(url);
            }
        }
    } catch (e) {
        console.log(e)
    }
};
