import fetch from 'node-fetch'
import rand from 'random-seed'
import ua from 'random-useragent'
import HttpsProxyAgent from 'https-proxy-agent';
import { PROXIES, PROXY_LIST } from '../main.js'


// Get a random user agent
export function getUserAgent() {
    return ua.getRandom(function (ua) {
        return ua.deviceType != 'mobile' && parseFloat(ua.browserVersion) >= 40;
    })
}


// Get a random proxy from the list
export function getProxy(badProxies) {  
    let proxy;
    if (PROXIES.length == badProxies.size) {
        badProxies = new Set()
        // TODO: console
        console.info('All proxies used. Resetting bad proxy list.')
    }
    do {
        proxy = 'http://' + PROXY_LIST[rand.create()(PROXY_LIST.length)];
    } while (badProxies.has(proxy))
    return proxy
}


// Fetches the item page and returns html in a promise 
// Returns false if not successful
export function fetchPage(url, badProxies) {
    const headers = {
        "user-agent": getUserAgent(),
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
		"upgrade-insecure-requests": 1
    }

    const options = { headers }
    if (PROXIES) Object.assign(
        options,
        { agent: new HttpsProxyAgent( getProxy(badProxies) ) }
    )

    return fetch(url, {
        headers: getHeaders(),
        agent: new HttpsProxyAgent(proxy),
        timeout: workerData.CONFIG.WAIT_TIMEOUT * 1000
     })
     .then(response => {
        // TODO
     })
     .catch(error => {
        // TODO console
        return false
     })
}
