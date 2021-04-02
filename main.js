
// Support require
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { fileURLToPath } from "url";
import fs from "fs";
import antonline from './stores/antonline.js'
import amazon from './stores/amazon.js'
import argos from './stores/argos.js'
import bestbuy from './stores/bestbuy.js'
import costco from './stores/costco.js'
import currys from './stores/currys.js'
import ebuyer from './stores/ebuyer.js'
import gamestop from './stores/gamestop.js'
import microcenter from './stores/microcenter.js'
import newegg from './stores/newegg.js'
import target from './stores/target.js'
import tesco from './stores/tesco.js'
import walmart from './stores/walmart.js'


// Import configs
export var {
    URLS, 
    INTERVAL,
    OPEN_URL,
    ALARM,
    AMAZON_DELAY,
    AMAZON_MERCHANT_ID,
    TARGET_ZIP_CODE,
    TARGET_KEY,
    WEBHOOK_URLS,
    PROXIES,
    EMAIL,
    SMS_METHOD, // "None", "Amazon Web Services", "Email", "Twilio"
} = require('./config.json')

// For Testing
const ADDITIONAL_URLS = [
    // "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG",
    // "https://www.amazon.com/gp/product/B08164VTWH/",
    // "https://www.argos.co.uk/product/8349000",
    // "https://www.bestbuy.com/site/amd-ryzen-9-5900x-4th-gen-12-core-24-threads-unlocked-desktop-processor-without-cooler/6438942.p?skuId=6438942",
    // "https://www.microcenter.com/product/630283/Ryzen_9_5900X_Vermeer_37GHz_12-Core_AM4_Boxed_Processor",
    // "https://www.newegg.com/amd-ryzen-9-5900x/p/N82E16819113664?Item=N82E16819113664",
    // "https://www.target.com/p/playstation-5-console/-/A-81114595",
    // "https://www.tescopreorders.com/uk/ps5",
    // "https://www.tesco.com/groceries/en-GB/products/306276176",
    // "https://www.walmart.com/ip/PlayStation-5-Console/363472942"
]
if (ADDITIONAL_URLS.length > 0) URLS = URLS.concat(ADDITIONAL_URLS)


// Read proxies.txt
export var PROXY_LIST = PROXIES ? fs.readFileSync('proxies.txt', 'UTF-8').split(/\r?\n/) : []
if (PROXY_LIST.length > 0) PROXY_LIST = PROXY_LIST.filter(proxy => proxy != '')

// Runs main only if this file is executed
if (process.argv[1] === fileURLToPath(import.meta.url))
    main();


// https://www.XXX.com/... -> XXX
function getDomainName(url) {
    let hostName = new URL(url).hostname;
    let host = hostName.split('.');
    return host[1];
}


// Calls the given store function with the set interval 
async function checkStore(storeFunc, url) {
    switch (INTERVAL.unit) {
        case 'seconds':
            setInterval(storeFunc, INTERVAL.value * 1000, url, INTERVAL)
            break;

        case 'minutes':
            setInterval(storeFunc, INTERVAL.value * 1000 * 60, url, INTERVAL)
            break;

        case 'hours':
            setInterval(storeFunc, INTERVAL.value * 1000 * 60 * 60, url, INTERVAL)
            break;
    }
}


// Same as checkStore() but adds dynamic delay to interval to help avoid 503 error
// Takes an item with url, interval, firstRun, and storeFunc properties (see amazonItem() below for an example)
async function checkStoreWithDelay(item) {
    let timer = (firstRun) => {
        return new Promise(
            function (resolve) {
                item.storeFunc(item.url, item.interval, INTERVAL.value, firstRun, item.urlOpened, resolve);
            }
        );
    }

    timer(item.firstRun).then(
        async function ({ interval, urlOpened }) {
            if (item.interval.value != interval) {
                item.firstRun = true;
                item.interval.value = interval;
            } else item.firstRun = false;

            if (OPEN_URL && urlOpened && urlOpened != item.urlOpened) {
                item.urlOpened = true;
                setTimeout(() => item.urlOpened = false, 1000 * 295)  // Open URL and send alerts every 5 minutes
            }


            switch (item.interval.unit) {
                case 'seconds':
                    setTimeout(checkStoreWithDelay, item.interval.value * 1000, item)
                    break;

                case 'minutes':
                    setTimeout(checkStoreWithDelay, item.interval.value * 1000 * 60, item)
                    break;

                case 'hours':
                    setTimeout(checkStoreWithDelay, item.interval.value * 1000 * 60 * 60, item)
                    break;
            }
        }
    );
}


function main() {
    let amazonItems = [];
    function amazonItem(url) {
        this.url = url;
        this.interval = { ...INTERVAL };
        this.firstRun = true;
        this.urlOpened = false;
        this.storeFunc = amazon;
    };

    URLS.forEach(url => {
        let storeName;
        try {
            storeName = getDomainName(url);
        } catch (e) {
            console.error('Incorrect URL format:', url)
            console.error(e)
        }

        switch (storeName) {
            case 'antonline':
                checkStore(antonline, url);
                break;

            case 'amazon':
                amazonItems.push(new amazonItem(url));
                break;

            case 'argos':
                checkStore(argos, url);
                break;

            case 'bestbuy':
                checkStore(bestbuy, url);
                break;

            case 'costco':
                checkStore(costco, url);
                break;

            case 'currys':
                checkStore(currys, url);
                break;

            case 'ebuyer':
                checkStore(ebuyer, url);
                break;
                
            case 'gamestop':
                checkStore(gamestop, url);
                break;    

            case 'microcenter':
                checkStore(microcenter, url);
                break;

            case 'newegg':
                checkStore(newegg, url);
                break;

            case 'target':
                checkStore(target, url);
                break;

            case 'tesco':
            case 'tescopreorders':
                checkStore(tesco, url);
                break;

            case 'walmart':
                checkStore(walmart, url);
                break;

            default:
                console.error('This store is not supported:', storeName)
        }
    });

    if (amazonItems.length > 0)
        amazonItems.forEach(
            (item, idx) => {
                switch (INTERVAL.unit) {
                    case 'seconds':
                        setTimeout(checkStoreWithDelay, AMAZON_DELAY * 1000 * idx, item);
                        break;

                    case 'minutes':
                        setTimeout(checkStoreWithDelay, AMAZON_DELAY * 1000 * 60 * idx, item);
                        break;

                    case 'hours':
                        setTimeout(checkStoreWithDelay, AMAZON_DELAY * 1000 * 60 * 60 * idx, item);
                        break;
                }
            });
}


export const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2919.83 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2866.71 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux i686 on x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2820.59 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2762.73 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2656.18 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/44.0.2403.155 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2226.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2224.3 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 4.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36",
    "Mozilla/5.0 (X11; OpenBSD i386) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.3319.102 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.2309.372 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.2117.157 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1866.237 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/4E423F",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19577",
    "Mozilla/5.0 (X11) AppleWebKit/62.41 (KHTML, like Gecko) Edge/17.10859 Safari/452.6",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931",
    "Chrome (AppleWebKit/537.1; Chrome50.0; Windows NT 6.3) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
    "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.9200",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:77.0) Gecko/20190101 Firefox/77.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:77.0) Gecko/20100101 Firefox/77.0",
    "Mozilla/5.0 (X11; Linux ppc64le; rv:75.0) Gecko/20100101 Firefox/75.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:39.0) Gecko/20100101 Firefox/75.0",
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.10; rv:75.0) Gecko/20100101 Firefox/75.0",
    "Mozilla/5.0 (X11; Linux; rv:74.0) Gecko/20100101 Firefox/74.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/73.0",
    "Mozilla/5.0 (X11; OpenBSD i386; rv:72.0) Gecko/20100101 Firefox/72.0",
    "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:71.0) Gecko/20100101 Firefox/71.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:70.0) Gecko/20191022 Firefox/70.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:70.0) Gecko/20190101 Firefox/70.0",
    "Mozilla/5.0 (Windows; U; Windows NT 9.1; en-US; rv:12.9.1.11) Gecko/20100821 Firefox/70",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:69.2.1) Gecko/20100101 Firefox/69.2",
    "Mozilla/5.0 (Windows NT 6.1; rv:68.7) Gecko/20100101 Firefox/68.7",
    "Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:64.0) Gecko/20100101 Firefox/64.0",
    "Mozilla/5.0 (X11; Linux i586; rv:63.0) Gecko/20100101 Firefox/63.0",
    "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:63.0) Gecko/20100101 Firefox/63.0",
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.10; rv:62.0) Gecko/20100101 Firefox/62.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:10.0) Gecko/20100101 Firefox/62.0",
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.13; ko; rv:1.9.1b2) Gecko/20081201 Firefox/60.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/58.0.1",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/58.0",
    "Mozilla/5.0 (Windows NT 5.0; Windows NT 5.1; Windows NT 6.0; Windows NT 6.1; Linux; es-VE; rv:52.9.0) Gecko/20100101 Firefox/52.9.0",
    "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:52.59.12) Gecko/20160044 Firefox/52.59.12",
    "Mozilla/5.0 (X11; Ubuntu i686; rv:52.0) Gecko/20100101 Firefox/52.0",
    "Mozilla/5.0 (X11;  Ubuntu; Linux i686; rv:52.0) Gecko/20100101 Firefox/52.0",
    "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9a1) Gecko/20060814 Firefox/51.0",
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.10; rv:62.0) Gecko/20100101 Firefox/49.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:46.0) Gecko/20120121 Firefox/46.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.66.18) Gecko/20177177 Firefox/45.66.18",
]
