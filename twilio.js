import twilio from 'twilio';
import moment from "moment";
import { sms } from './main.js'

export default async function sendTwilioMessage(product_url, title, store) {
    const client = new twilio(sms.SID, sms.TOKEN);

    client.messages
    .create({
        body: `***** In Stock at ${store} ***** \n${title}  \n${product_url} \n${moment().format('MMM Do YYYY - h:mm:ss A')}`,
        from: sms.FROM,
        to: sms.TO
    })
    .then((message) => console.info(moment().format('LTS') + ": Notified via SMS."));
}
