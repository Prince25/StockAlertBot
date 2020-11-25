
/*
    **************************************** EDIT THESE ****************************************
    *************************************** AS NECESSARY ***************************************
*/

// All the products to check
// Current domains supported: Amazon, AntOnline, Best Buy, Costco, Microcenter, Newegg, Target
// Format: https://www.XXX.com/...
const URLS = [
    // "https://www.amazon.com/gp/product/B08164VTWH/",
    // "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG",
    "https://www.antonline.com/Sony/Electronics/Gaming_Devices/Gaming_Consoles/1413553",
    "https://www.bestbuy.com/site/amd-ryzen-9-5900x-4th-gen-12-core-24-threads-unlocked-desktop-processor-without-cooler/6438942.p?skuId=6438942",
    "https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149",
    "https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html",
    // "https://www.microcenter.com/product/630283/Ryzen_9_5900X_Vermeer_37GHz_12-Core_AM4_Boxed_Processor",
    "https://www.newegg.com/amd-ryzen-9-5900x/p/N82E16819113664?Item=N82E16819113664",
    "https://www.newegg.com/asus-geforce-rtx-3080-rog-strix-rtx3080-o10g-gaming/p/N82E16814126457",
    "https://www.newegg.com/asus-geforce-rtx-3080-tuf-rtx3080-o10g-gaming/p/N82E16814126452",
    "https://www.newegg.com/p/N82E16868110292",
    "https://www.target.com/p/playstation-5-console/-/A-81114595",
    "https://www.target.com/p/dualsense-wireless-controller-for-playstation-5/-/A-81114477",
]

// How often to check for products. Too often may be dangerous, especially for Amazon.
const INTERVAL = {
    unit: 'seconds',  // seconds, m: minutes, h: hours
    value: 10
}

// Opens the product url in your default browser if set to true
export const OPEN_URL = true;   // true, false

// IF YOU ENTERED A AMAZON PRODUCT
// Separates the check between Amazon items by this value 
const AMAZON_DELAY = 25;

// IF YOU ENTERED A TARGET PRODUCT
// Enter your zip code to search for a Target closest to you
export const TARGET_ZIP_CODE = '90024'

// IF YOU ENTERED A TARGET PRODUCT AND YOU GET API KEY ERRORS
// Enter the key for your session as described in the README
export const TARGET_KEY = 'ff457966e64d5e877fdbad070f276d18ecec4a01'

//   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



import { fileURLToPath } from "url";
import antonline from './stores/antonline.js'
import amazon from './stores/amazon.js'
import bestbuy from './stores/bestbuy.js'
import costco from './stores/costco.js'
import microcenter from './stores/microcenter.js'
import newegg from './stores/newegg.js'
import target from './stores/target.js'


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
    switch(INTERVAL.unit) {
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
            function(resolve) {
                item.storeFunc(item.url, item.interval, INTERVAL.value, firstRun, item.urlOpened, resolve); 
            }
        );
    }

    timer(item.firstRun).then(
        async function({interval, urlOpened}) {
            if (item.interval.value != interval) {
                item.firstRun = true; 
                item.interval.value = interval;
            } else item.firstRun = false;

            if (OPEN_URL && urlOpened && urlOpened != item.urlOpened) {
                item.urlOpened = true;
                setTimeout(() => item.urlOpened = false, 1000 * 115)  // Open URL every 2 minutes
            }


            switch(item.interval.unit) {
                case 'seconds':
                    await setTimeout(checkStoreWithDelay, item.interval.value * 1000, item)
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
        this.interval = {...INTERVAL};
        this.firstRun = true;
        this.urlOpened = false;
        this.storeFunc = amazon;
    };

    URLS.forEach(url => {
        let storeName;
        try {
            storeName = getDomainName(url);
        } catch(e) {
            console.error('Incorrect URL format:', url)
            console.error(e)
        }
        
        switch(storeName) {
            case 'antonline':
                checkStore(antonline, url);
                break;

            case 'amazon':
                amazonItems.push(new amazonItem(url));
                break;

            case 'bestbuy':
                checkStore(bestbuy, url);
                break;

            case 'costco':
                checkStore(costco, url);
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

            default:
                console.error('This store is not supported:', storeName)
        }
    });

    if (amazonItems.length > 0) 
        amazonItems.forEach(
            (item, idx) => {
                switch(INTERVAL.unit) {
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
