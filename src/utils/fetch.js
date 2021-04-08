import fetch from 'node-fetch'
import rand from 'random-seed'
import * as log from './log.js'
import ua from 'random-useragent'
import HttpsProxyAgent from 'https-proxy-agent';
import { PROXIES, PROXY_LIST } from '../main.js'

// TODO
const PROXY_BLOCKING_MESSAGES = [
	""
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
        log.toConsole('info', 'All proxies used. Resetting bad proxy list.')
    }
    do {
        proxy = 'http://' + PROXY_LIST[rand.create()(PROXY_LIST.length)];
    } while (badProxies.has(proxy))
    return proxy
}


/*
    Fetches the item page and returns html in a promise 
    Returns false if not successful
*/
export function fetchPage(url, store, use_proxies, badProxies, retry = false) {
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
            timeout: 15000 // TODO Put timeout in CONFIG ?
        }
    
    let proxy = undefined,
        agent = undefined

    if (use_proxies && PROXIES) {
        proxy = getProxy(badProxies)
        agent = new HttpsProxyAgent(proxy)
        Object.assign(options, {agent})
    }
    else if (!use_proxies && PROXIES) {
        log.toConsole('error', `Proxies are turned on but ${store} does not currently support proxies. Your IP will be used!!`)
    }

    return fetch(url, options)
    .then(response => {
        if (response && response.ok) return response.text()
        else throw new Error(response.status + " - " + response.statusText)
    })
    .then(html => {
        // If proxy was blocked, add to bad list and retry
        if (use_proxies && PROXIES && PROXY_BLOCKING_MESSAGES.some(message => html.includes(message))) {
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
    .catch(error => {
        log.toConsole('error', 'Error getting page for url: ' + url + '. ')
        log.toFile(store, error)
        return { "status": "error" }
    })
}
