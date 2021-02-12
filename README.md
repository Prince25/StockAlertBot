
### New in v2.0: :email: E-mail notification support and an user interface :iphone: !! (see [screenshots](#Screenshots))

# StockAlertBot
Faced with the scenario of scalpers using bots to hog up all the inventory of popular holiday toys and sell them at ridiculously high markup prices, I decided to put up a fight so we can get our hands on things we ~~want~~ need to survive the #Coronavirus quarantine(s).
###### Of course, this is only half the battle. For full writeup on scoring items, look [here](https://github.com/PrinceS25/StockAlertBot/wiki/Beating-Scalpers).<br><br><br><br>

<p align="center">
Donate, buy me a <a href="https://buymeacoff.ee/PrinceSingh" target="_blank">Pizza</a> or <a href="https://paypal.me/PrinceSingh25" target="_blank">PayPal</a> me if you'd like to see this project expanded and support me. :) <br> <br>
<a href="https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD" target="_blank"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" alt="Paypal me" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a> <br> <br>
<a href="https://www.buymeacoffee.com/PrinceSingh" target="_blank"><img src="https://i.imgur.com/H7BJq0V.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
<a href="https://www.paypal.me/PrinceSingh25" target="_blank"><img src="https://i.imgur.com/FDuYJBd.png" alt="Paypal me" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>
<br><br>


### How does it work?

Enter links of the products you want tracked and how often you want the program to check if those products are in stock. When an item becomes available, you may configure it to  notify you through variety of alerts including sound, email, discord and slack notifications, text on console, automatically opening the URL in your browser, and more to come.
<br><br>

### What stores/websites are supported?

Currently, the following stores are supported:
* AntOnline
* Amazon (fails at low interval rates, see [proxies](#Proxies))
* Argos (UK. Does not currently work with proxies) (For PS5, use product link. Disc: https://www.argos.co.uk/product/8349000, Digital: https://www.argos.co.uk/product/8349024)
* Best Buy (including open-box and combos. Does not currently work with proxies)
* Costco (Does not currently work with proxies)
* Currys (UK)
* Gamestop
* Microcenter
* Newegg (including combo deals)
* Target (Works but may require additional setup)
* Tesco (UK. Does not currently work with proxies) (For PS5, use this link: https://www.tescopreorders.com/uk/ps5)

![Console Screenshot](https://i.imgur.com/po6GtU6.png)


## Prerequisites
0. A Terminal: ([cmd](https://en.wikipedia.org/wiki/Cmd.exe) (Windows), [Terminal](https://en.wikipedia.org/wiki/Terminal_(macOS)) (macOS), or [Console](https://en.wikipedia.org/wiki/Linux_console) (Linux))
1. Install [Node.js](https://nodejs.org/en/), either LTS or Current.
2. Clone or [download](https://github.com/PrinceS25/StockAlertBot/archive/main.zip) this repository
    `git clone https://github.com/PrinceS25/StockAlertBot.git`
3. Go to root directory
    `cd StockAlertBot`
4. Install npm packages via a terminal
    `npm install`


## Usage
There are only two steps to use this program: 1) enter information and 2) launch the program.

1. You can now enter information using two ways: via a browser (recommended) or a text editor.
    #### Via Browser
    1. At the root directory, run on the terminal:
        `npm run settings`\
        A browser window should open up. If it doesn't and the console says `Server started!`, go to: `http://localhost:3250/` in your browser.
    2. Enter the links of the items you want to track in the URLs tab.
    3. Go to Settings tab and change to your heart's content.
        - If you want to use Proxies, turn it on and create a file called `proxies.txt` in the root directory and fill it with one proxy per line. See [proxies](#Proxies).
        - If you have Amazon link(s), you will see an option to put delay between Amazon items.
        - If you have Target link(s), you will see additional options to put zip code and API Key. Only change the key if you get API key errors. Refer to the instructions in the following [section](#Via-Text-Editor).
    4. Configure notification options in Optional tab.
        - If you want notifications sent to Discord or Slack, expand WEBHOOKS and enter the URL(s) there.
        - If you want notifications sent to Email, turn on email and enter your service provider information. Some providers (Yahoo, AOL, AT&T) cause problems. Refer to following [section](#Via-Text-Editor).
    5. Once you're happy with the settings, click `Save Settings`.\
    `config.json` and `.env` files should now reflect your settings.\
    You can use `CTRL + C` or `CMD + C` to stop the program.<br><br>

    #### Via Text Editor 
    Open and edit `config.json`
    1. Add urls of products in the `URLS` array
    2. Change the `INTERVAL` to suit your desires.\
    **WARNING:** Having the interval too low might have negative consquences such as this program being detected as a bot (Amazon), or blocking your IP from accessing the website. See [proxies](#Proxies).
    3. Set `OPEN_URL` to false if you don't want the application to automatically open urls when item is in stock
    4. Set `ALARM` to false if you want to disable the audible warning
    5. Optional Settings.
        1. **If** you're planning to track more than one Amazon item, set the delay (in seconds) between items by editing `AMAZON_DELAY`.
        Otherwise, Amazon may flag the program's requests as a bot.
        2. **If** you're planning to track Target item(s), enter your zip code in `TARGET_ZIP_CODE`.\
        **NOTE:** If you encounter an error relating to API Key, you need to get this key yourself:
            1. Go to target.com with the DevTools (Chrome) or Developer Tools (Firefox) open (Google or ask if you're unsure how)
            2. On the console, you should see GET requests as you load the page.\
            In DevTools, you have to click the gear and check "Log XMLHttpRequests" to see them
            3. Click on any of the urls that has the string "key=" and copy the whole key
            4. Paste it to `TARGET_KEY`
        3. **If** you want to send alerts to webhook URL(s) like [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) or [Slack](https://api.slack.com/messaging/webhooks), add them to `WEBHOOK_URLS` array.
        4. **If** you want to use Proxies, change `PROXIES` to `true` and create a file called `proxies.txt` in the root directory and fill it with one proxy per line. See [proxies](#Proxies).
        5. **If** you want to send alerts to email, change `EMAIL` in `config.json` to `true`. Make a copy of `example.env` and rename it to `.env`. Inside `.env`, type out one of the following service providers (`EMAIL_SERVICE`), your email (`EMAIL_FROM`) and password (`EMAIL_PASS`) and the email you want alerts sent to (`EMAIL_TO`). All without quotes.
        ```
        Gmail, Yahoo, iCloud, Hotmail, Outlook365, QQ, 126, 163, 1und1, AOL, DebugMail, DynectEmail, 
        FastMail, GandiMail, Godaddy, GodaddyAsia, GodaddyEurope, hot.ee, mail.ee, Mail.ru, Maildev, Mailgun, Mailjet, 
        Mailosaur, Mandrill, Naver, OpenMailBox, Postmark, QQex, SendCloud, SendGrid, SendinBlue, SendPulse, SES, 
        SES-US-EAST-1, SES-US-WEST-2, SES-EU-WEST-1, Sparkpost, Yandex, Zoho, qiye.aliyun
        ```
        **NOTE:** If you receive the error: `535 5.7.0 (#AUTH005) Too many bad auth attempts`, most likely you are using Yahoo for the email server or an email server managed by Yahoo, such as AOL or AT&T. Yahoo has implemented an option that by default, does not let 3rd party products access the email servers. To resolve, go to https://login.yahoo.com/account/security and then enable the option to allow apps that use less secure sign in. Use the password generated by "Generate app password". If you are using AOL, do the same thing, from https://login.aol.com/account/security.

2. Execute and continue about your day: 
    `npm start` OR `node --experimental-modules main.js`\
    You can use `CTRL + C` or `CMD + C` to stop the program.

3. Consider [donating](https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD) or buying me a [Pizza](https://buymeacoff.ee/PrinceSingh) or [PayPal](https://paypal.me/PrinceSingh25) me :smile:

#### Proxies
If you plan to use low interval rates OR track several items from one store, it is highly recommended that you use proxies such as ones from [Webshare](https://www.webshare.io/).<br>\
**NOTE:** The following stores do not currently with proxies due to them blocking some connections/headers which results in inconsistent connection: Argos, Best Buy, Costco, and Tesco. Thus we thought it'd be best if we take off proxy support for now until we can do some further research or find an alternative way.


## Screenshots
![Screenshot of URLs](https://i.imgur.com/FVrmKNA.png)<br><br>
---
<br><br>![Screenshot of Settings](https://i.imgur.com/ue3Pdlv.png)<br><br>
---
<br><br>![Screenshot of Optional](https://i.imgur.com/w7xkXIw.png)


## Feedback and Support
To ensure this program continues to work, please report bugs by creating an [issue](https://github.com/PrinceS25/StockAlertBot/issues).\
To ask questions, give feedback or suggestions among other things, create a new [discussion](https://github.com/PrinceS25/StockAlertBot/discussions).\
To contribute code, programming questions/guidance, gaming sessions, and more, add me on Discord: Prince#0584\
To provide monetary support, [donate](https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD) or buy me a [Pizza](https://buymeacoff.ee/PrinceSingh) or [PayPal](https://paypal.me/PrinceSingh25) me 


## Things to work on
* Add more stores
    * Walmart
    * B&H Photo Video
    * ~~Gamestop~~
    * ~~Currys~~
    * ~~Newegg Combos~~
    * ~~Newegg~~
    * ~~AntOnline~~
    * ~~Target~~
    * ~~Tesco~~
    * ~~Argos~~
* Add delay between items from the same store
* ~~ Add Email and SMS Notifications ~~ 
* More OOP!!
* ~~Fix~~ Find Bugs
* ~~Add Proxies~~
* ~~Add GUI - Make it easier to use~~ 
* ~~Initially create seperation between intervals for Amazon items~~
* ~~Add a way to have independent delay timers for Amazon~~
* ~~Open product page when in stock~~
* ~~Add webhookURL to enable posting messages to Slack and Discord~~


## Main Technologies
- [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- [Vue.js](https://vuejs.org/) powered by [Vuetify](https://vuetifyjs.com/) and [Material Design Icons](https://materialdesignicons.com/)


## License
See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
