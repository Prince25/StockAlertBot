import axios from "axios";
import moment from "moment";
import { WEBHOOK_URLS } from './main.js'

export default async function sendAlertToWebhooks(url, title, image, store) {
    WEBHOOK_URLS.forEach(
        urls => {
            if (urls.includes('discord')) {
                console.info(moment().format('LTS') + ": Discord has been notified.")
                axios({
                    method: 'POST',
                    url: urls,
                    headers: {
                        "Content-type": "application/json"
                    },
                    data: {
                        username: `${store} Bot`,
                        embeds: [{
                            title: title,
                            url: url,
                            color: "15736093",
                            footer: {
                                text: `${moment().format('MMMM Do YYYY - h:mm:ss A')}`
                            },
                            thumbnail: {
                                url: image,
                            },
                            fields: [
                                {
                                    "name": "Store",
                                    "value": store,
                                    "inline": true
                                },
                                {
                                    "name": "Status",
                                    "value": "In Stock",
                                    "inline": true
                                },
                                {
                                    "name": "Product Page",
                                    "value": url
                                }
                            ]
                        }]
                    }
                })
                .catch(error => 
                    console.error(error)
                )
            } else if (urls.includes('slack')) {
                console.info(moment().format('LTS') + ": Slack has been notified.")
                axios.post(urls, { text: `***** In Stock at ${store} *****: ${title}  \n ${url}` })
                .catch(error => 
                    console.error(error)
                ) 
            }    
        }   
    )
} 
