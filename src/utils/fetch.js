import axios from 'axios';
import fetch from 'node-fetch'
import rand from 'random-seed'
import ua from 'random-useragent'
import { toConsole } from './log.js'
import HttpsProxyAgent from 'https-proxy-agent';
import { AMAZON_MERCHANT_ID, PROXIES, PROXY_LIST } from '../main.js'


const random = rand.create()
const PROXY_BLOCKING_MESSAGES = [
    "Are you a human?",
    "Help us keep your account safe by clicking on the checkbox below",
    "we just need to make sure you're not a robot",
]


/* 
    Get a random user agent
*/
export function getUserAgent() {
    return ua.getRandom(function (ua) {
        return ua.deviceType != 'mobile' && parseFloat(ua.browserVersion) >= 40;
    })
}


/* 
    Get a random proxy from the list
*/
export function getProxy(badProxies) {  
    let proxy;
    if (PROXY_LIST.length == badProxies.size) {
        badProxies = new Set()
        toConsole('info', 'All proxies used. Resetting bad proxy list.')
    }
    do {
        proxy = 'http://' + PROXY_LIST[random(PROXY_LIST.length)];
    } while (badProxies.has(proxy))
    return proxy
}


/*
    Fetches the item page and returns html in a promise 
    Returns false if not successful
*/
export function fetchPage(url, store, use_proxies, badProxies, retry = false, getJSON = false) {
    const 
        headers = {
            "user-agent": getUserAgent(),
            "pragma": "no-cache",
            "cache-control": "no-cache",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "upgrade-insecure-requests": 1
        },
        options = { 
            headers,
            timeout: 15000
        }
    
    let proxy = undefined,
        agent = undefined

    if (use_proxies && PROXIES) {
        proxy = getProxy(badProxies)
        agent = new HttpsProxyAgent(proxy)
        Object.assign(options, {agent})
    }
    else if (!use_proxies && PROXIES) {
        toConsole('error', `Proxies are turned on but ${store} does not currently support proxies. Your IP will be used!!`)
    }
    if (!use_proxies) return fetchPageViaAxios(url)

    // Update URL for Amazon if a particular merchant is selected
    if (store == "amazon" && AMAZON_MERCHANT_ID !== "None") {
        url = url + "?m=" + AMAZON_MERCHANT_ID;
    }

    // For Target
    if (getJSON) {
        return fetchJSON(url, options)
    }

    let sourceHTML = undefined
    return fetch(url, options)
    .then(async response => {
        if (response && response.ok) {
            return response.text()
        }
        else if (store == "antonline" && response && response.status == "404") {   // Hard code Ant online status code for out of stock items 
            return response.text()
        } 
        else if (store == "currys" && response && response.status == "503") {      // Hard code Currys showing high traffic page
            sourceHTML = response.text()
            if (sourceHTML.includes('getting waaaay more traffic than usual')) {
                toConsole('alert', 'High traffic redirect page at Currys! This may mean a hot item might be getting restocked.')
            } else {
                throw new Error(response.status + " - " + response.statusText)
            }
        }
        else {
            sourceHTML = await response.text()
            throw new Error(response.status + " - " + response.statusText)
        }
    })
    .then(html => {
        // If proxy was blocked, add to bad list and retry
        if (use_proxies && PROXIES && PROXY_BLOCKING_MESSAGES.some(message => html.includes(message))) {
            toConsole('info', `Proxy, ${proxy}, was blocked! Retrying...`)
            badProxies.add(proxy)
            return fetchPage(url, store, use_proxies, badProxies, true)
        }
        
        return retry ?
            {
                "status": "retry",
                html,
                badProxies
            } : 
            {
                "status": "ok",
                html
            }
    })
    .catch(async error => {
        toConsole('error', 'Error getting page for url: ' + url + '. ')
        return {
            "status": "error",
            error,
            "html": sourceHTML
        }
    })
}


/*
    Fetches a JSON page and returns it
*/
export function fetchJSON(url, options) {
    let sourceHTML = undefined
    return fetch(url, options)
    .then(async response => {
        if (response && response.ok) {
            return response.json()
        }
        else {
            sourceHTML = await response.text()
            throw new Error(response.status + " - " + response.statusText)
        }
    })
    .then(json => json)
    .catch(async error => {
        toConsole('error', 'Error getting page for url: ' + url + '. ')
        return {
            "status": "error",
            error,
            "html": sourceHTML
        }
    })
}


/*
    Uses Axios to fetch the item page and returns html in a promise 
    Returns false if not successful
*/
function fetchPageViaAxios(url) {
    let sourceHTML = undefined
    return axios.get(url)
        .then(async response => {
            if (response && response.status == 200) {
                return {
                    "status": "ok",
                    "html": response.data
                }
            }
            else {
                sourceHTML = await response.text()
                throw new Error(response.status + " - " + response.statusText)
            } 
        })
        .catch(error => {
            toConsole('error', 'Error getting page for url: ' + url + '. ')
            return {
                "status": "error",
                error,
                "html": sourceHTML
            }
        })
}
