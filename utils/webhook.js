import axios from "axios";
import moment from "moment";
import { WEBHOOK_URLS } from '../main.js'

export default async function sendAlertToWebhooks(product_url, title, image, store) {
    WEBHOOK_URLS.forEach(   // For each Webhook URL...
        url => {
            // Notify Discord
            if (url.includes('discord')) {
                console.info(moment().format('LTS') + ": Discord has been notified.")
                axios({
                    method: 'POST',
                    url: url,
                    headers: {
                        "Content-type": "application/json"
                    },
                    data: {
                        username: store,
                        embeds: [{
                            title: title,
                            url: product_url,
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
                                    "value": product_url
                                }
                            ]
                        }]
                    }
                })
                .catch(error => 
                    console.error(error)
                )

            // Notify Slack
            } else if (url.includes('slack')) {
                console.info(moment().format('LTS') + ": Slack has been notified.")
                axios.post(url, { text: `***** In Stock at ${store} *****: ${title}  \n ${product_url}` })
                .catch(error => 
                    console.error(error)
                ) 
            }    
        }   
    )
} 
