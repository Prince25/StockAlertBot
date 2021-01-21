import axios from "axios";
import moment from "moment";
import { WEBHOOK_URLS } from '../../main.js'

export default async function sendAlertToWebhooks(product_url, title, image, store) {
    WEBHOOK_URLS.forEach(   // For each Webhook URL...
        url => {
            // Notify Discord
            if (url.includes('discord')) {
                console.info(moment().format('LTS') + ": Sending alert to discord")
                axios({
                    method: 'POST',
                    url: url,
                    headers: {
                        "Content-type": "application/json"
                    },
                    data: {
                        username: "StockAlertBot",
                        embeds: [{
                            title: title,
                            url: product_url,
                            color: "15736093",
                            footer: {
                                text: `StockAlertBot | ${moment().format('MMMM Do YYYY - h:mm:ss A')}`
                            },
                            thumbnail: {
                                url: image,
                            },
                            fields: [
                                {
                                    name: "Store",
                                    value: store,
                                    inline: true
                                },
                                {
                                    name: "Status",
                                    value: "In Stock",
                                    inline: true
                                },
                                {
                                    name: "Product Page",
                                    value: product_url
                                }
                            ]
                        }]
                    }
                })
                .catch(error => 
                    console.error(moment().format('LTS') + ": Error sending alert to discord", error)
                )

            // Notify Slack
            } else if (url.includes('slack')) {
                console.info(moment().format('LTS') + ": Sending alert to slack")
                axios.post(url, { 
                    attachments: [
                        {
                            title: title,
                            title_link: product_url,
                            color: "#36a64f",
                            fields: [
                                {
                                    title: "Store",
                                    value: store,
                                    short: true
                                },
                                {
                                    title: "Status",
                                    value: "In Stock",
                                    short: true
                                },
                                {
                                    title: "Product Page",
                                    value: product_url,
                                    short: false
                                }
                            ],
                            thumb_url: image,
                            footer: `StockAlertBot | ${moment().format('MMMM Do YYYY - h:mm:ss A')}`
                        }
                    ]
                })
                .catch(error => 
                    console.error(moment().format('LTS') + ": Error sending alert to slack", error)
                ) 
            }    
        }   
    )
} 
