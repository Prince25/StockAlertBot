import amazon from './stores/amazon.js'
import bestbuy from './stores/bestbuy.js'
import costco from './stores/costco.js'
import microcenter from './stores/microcenter.js'


// All the products to check
// Current domains supported: Amazon, Best Buy, Costco, Microcenter
// Format: https://www.XXX.com/...
const URLS = [
    "https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html",
    "https://www.microcenter.com/product/630283/Ryzen_9_5900X_Vermeer_37GHz_12-Core_AM4_Boxed_Processor",
    "https://www.bestbuy.com/site/amd-ryzen-9-5900x-4th-gen-12-core-24-threads-unlocked-desktop-processor-without-cooler/6438942.p?skuId=6438942",
    "https://www.amazon.com/gp/product/B08164VTWH/",
    // "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG",
    "https://www.newegg.com/amd-ryzen-9-5900x/p/N82E16819113664?Item=N82E16819113664",
    "https://www.amazon.com/Shark-R1001AE-Self-Empty-Connected-Capacity/dp/B07S864GPW"
    // 'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S'
]

// How often to check for products. Too often may be dangerous, especially for Amazon.
const INTERVAL = {
    unit: 'seconds',  // seconds, m: minutes, h: hours
    value: 25
}


// https://www.XXX.com/... -> XXX
function getDomainName(url) {
    let hostName = new URL(url).hostname;
    let host = hostName.split('.');
    return host[1];
}


// Calls the given store function with the set interval 
async function checkStore(storeFunc, url) {
    let timer;
    switch(INTERVAL.unit) {
        case 'seconds':
            timer = setInterval(storeFunc, INTERVAL.value * 1000, url, INTERVAL)
            break;

        case 'minutes':
            timer = setInterval(storeFunc, INTERVAL.value * 1000 * 60, url, INTERVAL)
            break;

        case 'hours':
            timer = setInterval(storeFunc, INTERVAL.value * 1000 * 60 * 60, url, INTERVAL)
            break;
    }
}


URLS.forEach(url => {
    let storeName;
    try {
        storeName = getDomainName(url);
    } catch(e) {
        console.error('Incorrect URL format:', url)
        console.error(e)
    }
    
    switch(storeName) {
        case 'costco':
            checkStore(costco, url);
            break;

        case 'bestbuy':
            checkStore(bestbuy, url);
            break;

        case 'amazon':
            checkStore(amazon, url);
            break;

        case 'microcenter':
            checkStore(microcenter, url);
            break;

        default:
            console.error('This store is not supported:', storeName)
    }
})
