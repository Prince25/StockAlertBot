import axios from "axios";
import { WEBHOOK_URLS } from './main.js'

export default async function sendAlertToWebhooks(message) {
    WEBHOOK_URLS.forEach(
        url => {
            if (url.includes('discord')) 
                axios.post(url, { content: message })
                .catch(error => 
                    console.error(error)
                )
            else if (url.includes('slack'))
                axios.post(url, { text: message })
                .catch(error => 
                    console.error(error)
                ) 
        }
    )
} 
