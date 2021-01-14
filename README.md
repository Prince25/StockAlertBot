# StockAlertBot
Faced with the scenario of scalpers using bots to hog up all the inventory of popular holiday toys and sell them at ridiciously high markup price, I decided to at least attempt to put up a fight so we can get our hands on things we ~~want~~ need to survive the #Coronavirus quarantine(s). Of course, this is only half the battle. For full writeup on scoring items, look [here](https://github.com/PrinceS25/StockAlertBot/wiki/Beating-Scalpers).

<p align="center">
Donate, buy me a <a href="https://buymeacoff.ee/PrinceSingh" target="_blank">Pizza</a> or <a href="https://paypal.me/PrinceSingh25" target="_blank">PayPal</a> me if you'd like to see this project expanded and support me. :) <br> <br>
<a href="https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD" target="_blank"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" alt="Paypal me" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a> <br> <br>
<a href="https://www.buymeacoffee.com/PrinceSingh" target="_blank"><img src="https://i.imgur.com/H7BJq0V.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
<a href="https://www.paypal.me/PrinceSingh25" target="_blank"><img src="https://i.imgur.com/FDuYJBd.png" alt="Paypal me" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>
<br><br>


> How does it work?

Enter the product URLs and set how often you want the program to check if those products are in stock. When an item becomes available, it will notify you through both text on console and three auditory beeps as well as opening the product page automatically in your default web browser if you allowed it to do so. You may further configure to send alerts to Slack or Discord.

> What stores/wesbites are supported?

Currently, the following stores are supported:
* AntOnline
* Amazon (Fails at low interval rates)
* Argos (UK. For PS5, use product link. Disc: https://www.argos.co.uk/product/8349000, Digital: https://www.argos.co.uk/product/8349024)
* Best Buy (including open-box)
* Costco
* Currys (UK)
* Microcenter
* Newegg (including Combo Deals)
* Target (Works but may require additional setup)
* Tesco (UK. For PS5, use this link: https://www.tescopreorders.com/uk/ps5)

![Screenshot](https://i.imgur.com/po6GtU6.png)

### Prerequisites
1. Install [Node.js](https://nodejs.org/en/)
2. Clone or download this repository
    `git clone https://github.com/PrinceS25/StockAlertBot.git`
3. Change directory
    `cd StockAlertBot`
4. Install npm packages
    `npm install`

### Usage
1. Open and edit `config.json`
    * Add urls of products in the `URLS` array
    * Change the `INTERVAL` to suit your desires.\
    **WARNING:** Having the interval too low might have negative consquences such as this program being detected as a bot (Amazon), or blocking your IP from accessing the website.
    * Set `OPEN_URL` to false if you don't want the application to automatically open urls when item is in stock
    * Set `ALARM` to false if you want to disable the audible warning
    * **If** you're planning to track more than one Amazon item, set the delay (in seconds) between items by editing `AMAZON_DELAY`.
    Otherwise, Amazon may flag the program's requests as a bot.
    * **If** you're planning to track Target item(s), enter your zip code in `TARGET_ZIP_CODE`\
    **NOTE:** If you encounter an error relating to API Key, you need to get this key yourself:
        1. Go to target.com with the DevTools (Chrome) or Developer Tools (Firefox) open (Google or ask if you're unsure how)
        2. On the console, you should see GET requests as you load the page.\
        In DevTools, you have to click the gear and check "Log XMLHttpRequests" to see them
        3. Click on any of the urls that has the string "key=" and copy the whole key
        4. Paste it to `TARGET_KEY`
    * **If** you want to send alerts to webhook URL(s) like [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) or [Slack](https://api.slack.com/messaging/webhooks), add them to `WEBHOOK_URLS` array
2. Execute and continue about your day
    `node main.js`\
    OR\
    `npm start`
3. Consider [donating](https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD) or buying me a [Pizza](https://buymeacoff.ee/PrinceSingh) or [PayPal](https://paypal.me/PrinceSingh25) me

### Things to work on
* Add more stores
    * Walmart
    * Gamestop
    * ~~Currys~~
    * ~~Newegg Combos~~
    * ~~Newegg~~
    * ~~AntOnline~~
    * ~~Target~~
    * ~~Tesco~~
    * ~~Argos~~
* Add GUI - Make it easier to use 
* Add Email and Maybe SMS Notifications
* ~~Fix~~ Find Bugs
* ~~Initially create seperation between intervals for Amazon items~~
* ~~Add a way to have independent delay timers for Amazon~~
* ~~Open product page when in stock~~
* ~~Add webhookURL to enable posting messages to Slack and Discord~~

## License
See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
