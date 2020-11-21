import amazon from './stores/amazon.js'
import bestbuy from './stores/bestbuy.js'
import costco from './stores/costco.js'
import microcenter from './stores/microcenter.js'
import newegg from './stores/newegg.js'


// All the products to check
// Current domains supported: Amazon, Best Buy, Costco, Microcenter, Newegg
// Format: https://www.XXX.com/...
const URLS = [
    "https://www.amazon.com/gp/product/B08164VTWH/",
    "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG",
    "https://www.bestbuy.com/site/amd-ryzen-9-5900x-4th-gen-12-core-24-threads-unlocked-desktop-processor-without-cooler/6438942.p?skuId=6438942",
    "https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149",
    "https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html",
    "https://www.microcenter.com/product/630283/Ryzen_9_5900X_Vermeer_37GHz_12-Core_AM4_Boxed_Processor",
    "https://www.newegg.com/amd-ryzen-9-5900x/p/N82E16819113664?Item=N82E16819113664",
]

// How often to check for products. Too often may be dangerous, especially for Amazon.
const INTERVAL = {
    unit: 'seconds',  // seconds, m: minutes, h: hours
    value: 25
}

// Separates the check between Amazon items by this value 
const AMAZON_DELAY = 25;


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
                item.storeFunc(item.url, item.interval, INTERVAL.value, firstRun, resolve); 
            }
        );
    }

    timer(item.firstRun).then(
        async function(interval) {
            if (item.interval.value != interval) {
                item.firstRun = true; 
                item.interval.value = interval;
            } else item.firstRun = false;

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


let amazonItems = [];
function amazonItem(url) {
    this.url = url;
    this.interval = {...INTERVAL};
    this.firstRun = true;
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
