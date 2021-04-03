
### New in v3.0: SMS / Text notification support :iphone: !! (see [SMS](#SMS))

#### New in v2.0: :email: E-mail notification support and an user interface :computer: (see [screenshots](#Screenshots))

# StockAlertBot
Faced with the scenario of scalpers using bots to hog up all the inventory of popular holiday toys and sell them at ridiculously high markup prices, I decided to put up a fight so we can get our hands on things we ~~want~~ need to survive the #Coronavirus quarantine(s).
###### Of course, this is only half the battle. For full writeup on scoring items, look [here](https://github.com/Prince25/StockAlertBot/wiki/Beating-Scalpers).<br><br><br><br>

<p align="center">
Donate, buy me a <a href="https://buymeacoff.ee/PrinceSingh" target="_blank">Pizza</a> or <a href="https://paypal.me/PrinceSingh25" target="_blank">PayPal</a> me if you'd like to see this project expanded and support me. :) <br> <br>
<a href="https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD" target="_blank"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" alt="Paypal me" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a> <br> <br>
<a href="https://www.buymeacoffee.com/PrinceSingh" target="_blank"><img src="https://i.imgur.com/H7BJq0V.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
<a href="https://www.paypal.me/PrinceSingh25" target="_blank"><img src="https://i.imgur.com/FDuYJBd.png" alt="Paypal me" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>
<br><br>


### How does it work?

Enter links of the products you want tracked and how often you want the program to check if those products are in stock. When an item becomes available, you may configure it to  notify you through variety of alerts including sound, email, discord and slack notifications, SMS / Text, console, automatically opening the URL in your browser, and more to come.
<br><br>

### What stores/websites are supported?

Currently, the following stores are supported:
* AntOnline
* Amazon (fails at low interval rates, see [proxies](#Proxies))
* Argos (UK. Does not currently work with proxies) (For PS5, use product link. Disc: https://www.argos.co.uk/product/8349000, Digital: https://www.argos.co.uk/product/8349024)
* Best Buy (including open-box and combos. Does not currently work with proxies)
* Costco (Does not currently work with proxies)
* Currys (UK)
* Ebuyer (UK)
* Gamestop
* Microcenter
* Newegg (including combo deals)
* Target (Works but may require additional setup)
* Tesco (UK. Does not currently work with proxies)
* Walmart

![Console Screenshot](https://i.imgur.com/po6GtU6.png)


## Prerequisites
0. A Terminal: ([cmd](https://en.wikipedia.org/wiki/Cmd.exe) (Windows), [Terminal](https://en.wikipedia.org/wiki/Terminal_(macOS)) (macOS), or [Console](https://en.wikipedia.org/wiki/Linux_console) (Linux))
1. Install [Node.js](https://nodejs.org/en/), either LTS or Current.
2. Clone or [download](https://github.com/Prince25/StockAlertBot/archive/main.zip) this repository
    `git clone https://github.com/Prince25/StockAlertBot.git`
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
        - Set how often you want to check the stores for given URLs and how much to space out the checks between items. It's not recommended to set it to 0 as you may be flagged as a bot. If you have 3 items (call them A, B, C) for Amazon and 2 items for Walmart (call them D, E) at 10 second interval spaced out at 2 seconds, for example, Items A and D will be checked first. 2 seconds later, items B and E will be checked. 2 seconds later, item C will be checked. The checks will start again in 8 seconds for Walmart and 10 seconds for Amazon.
        - If you want to use Proxies, turn it on and create a file called `proxies.txt` in the root directory and fill it with one proxy per line. See [proxies](#Proxies).
        - If you have Amazon link(s), you will see an option to pick a region. Select a region if you want to only monitor items sold by Amazon and not third party sellers. If you want to use a particular seller or if your region is not in the list, select `Custom` and provide the merchant ID. See [Feedback and Support](#Feedback-and-Support) if you'd like to request a region.
        - If you have Target link(s), you will see additional options to put zip code and API Key. Only change the key if you get API key errors. Refer to the instructions in the following [section](#Via-Text-Editor).
    4. Configure notification options in Optional tab.
        - If you want notifications sent to [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks), [IFTTT](https://maker.ifttt.com/), or [Slack](https://api.slack.com/messaging/webhooks), expand WEBHOOKS and enter the webhook URL(s) there.
        - If you want notification sent via SMS/Text, expand SMS and choose a method: Amazon Web Services, Email, or Twilio. See [SMS](#SMS).
        - If you want notifications sent to Email, turn on email and enter your service provider information. Some providers (Yahoo, AOL, AT&T) cause problems. Refer to this [section](#Email).
    5. Once you're happy with the settings, click `Save Settings`.\
    `config.json` and `.env` files should now reflect your settings.\
    You can use `CTRL + C` or `CMD + C` to stop the program.<br><br>

    #### Via Text Editor 
    Open and edit `config.json`
    1. Add urls of products in the `URLS` array
    2. Change the `INTERVAL` to suit your desires.\
    **WARNING:** Having the interval too low might have negative consquences such as this program being detected as a bot or blocking your IP from accessing the website entirely. See [proxies](#Proxies). Setting `TIME_BETWEEN_CHECKS` might help prevent this. See step 3a from the other [method](#Via-Browser) for a detailed explanation and an example.
    3. Set `OPEN_URL` to false if you don't want the application to automatically open urls when item is in stock
    4. Set `ALARM` to false if you want to disable the audible warning
    5. Optional Settings.
        1. **If** you're planning to track Amazon item(s), you can also set a merchant ID in `AMAZON_MERCHANT_ID` to only get prices from a ceratin merchant. The other [method](#Via-Browser) allows you to select pre-configured IDs items only sold by Amazon depending on the region.
        2. **If** you're planning to track Target item(s), enter your zip code in `TARGET_ZIP_CODE`.\
        **NOTE:** If you encounter an error relating to API Key, you need to get this key yourself:
            1. Go to target.com with the DevTools (Chrome) or Developer Tools (Firefox) open (Google or ask if you're unsure how)
            2. On the console, you should see GET requests as you load the page.\
            In DevTools, you have to click the gear and check "Log XMLHttpRequests" to see them
            3. Click on any of the urls that has the string "key=" and copy the whole key
            4. Paste it to `TARGET_KEY`
        3. **If** you want to send alerts to webhook URL(s) like [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks), [IFTTT](https://ifttt.com/maker_webhooks/), or [Slack](https://api.slack.com/messaging/webhooks), add them to `WEBHOOK_URLS` array.
        4. **If** you want to use Proxies, change `PROXIES` to `true` and create a file called `proxies.txt` in the root directory and fill it with one proxy per line. See [proxies](#Proxies).
        5. **If** you want to send alerts to SMS, change `SMS_METHOD` to either "Email", "Amazon Web Services", or "Twilio". Then change the associated values in `.env`. See [SMS](#SMS).
        6. **If** you want to send alerts to email, change `EMAIL` in `config.json` to `true`. Make a copy of `example.env` and rename it to `.env`. Inside `.env`, type out one of the service providers (`EMAIL_SERVICE`) listed in [Email](#Email), your email (`EMAIL_FROM`) and password (`EMAIL_PASS`) and the email you want alerts sent to (`EMAIL_TO`). All without quotes.
        
2. Execute and continue about your day: 
    `npm start` OR `node --experimental-modules main.js`\
    You can use `CTRL + C` or `CMD + C` to stop the program.

3. Consider [donating](https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD) or buying me a [Pizza](https://buymeacoff.ee/PrinceSingh) or [PayPal](https://paypal.me/PrinceSingh25) me :smile:
<br><br>


### Email
Supported email providers:
```
    Gmail, Yahoo, iCloud, Hotmail, Outlook365, QQ, 126, 163, 1und1, AOL, DebugMail, DynectEmail, 
    FastMail, GandiMail, Godaddy, GodaddyAsia, GodaddyEurope, hot.ee, mail.ee, Mail.ru, Maildev, Mailgun, Mailjet, 
    Mailosaur, Mandrill, Naver, OpenMailBox, Postmark, QQex, SendCloud, SendGrid, SendinBlue, SendPulse, SES, 
    SES-US-EAST-1, SES-US-WEST-2, SES-EU-WEST-1, Sparkpost, Yandex, Zoho, qiye.aliyun
```

**NOTE:**  If you receive the error: `535 5.7.0 (#AUTH005) Too many bad auth attempts`, most likely you are using Yahoo for the email server or an email server managed by Yahoo, such as AOL or AT&T. Yahoo has implemented an option that by default, does not let 3rd party products access the email servers. To resolve, go to https://login.yahoo.com/account/security and then enable the option to allow apps that use less secure sign in. Use the password generated by "Generate app password". If you are using AOL, do the same thing, from https://login.aol.com/account/security.
<br><br>


### SMS
SMS / Text support is now available via Amazon Web Services, Email, or Twilio. This, however, requires some setup on your part. Read below regarding setup for each method:

- **[Amazon Web Services](https://aws.amazon.com/sns)**\
First, read pricing information [here](https://aws.amazon.com/sns/faqs/#SMS_pricing). First 100 SMS are free for each month as long as you send them to a United States destination. For this method, you will need:
    - Region
    - Access Key
    - Secret Access Key
    - Phone Number

    Region is Amazon server you want to send from. It's probably best to choose one closest to you. More information [here](https://docs.aws.amazon.com/sns/latest/dg/sns-supported-regions-countries.html).\
    Access Key and Secret Access Key can be obtained following instructions in this [tutorial](https://medium.com/codephilics/how-to-send-a-sms-using-amazon-simple-notification-service-sns-46208d82abcc).\
    Phone number is the number to send SMS to. You will need to include country code and area code. Country code information can be found [here](https://countrycode.org/).

- **Email**\
**FREE** but limited. Uses email to send text via phone carrier's [SMS gateway](https://en.wikipedia.org/wiki/SMS_gateway). Mostly the same setup as [Email](#Email).\
Currently supported carriers: Alltel, AT&T, Boost Mobil, Cricket Wireless, FirstNet, Google Project Fi, MetroPCS, Republic Wireless, Sprint, Straight Talk, T-Mobile, Ting, U.S. Cellular, Verizon Wireless, Virgin Mobile.\
If you'd like to request a carrier, please refer to [Feedback and Support](#Feedback-and-Support) and provide your carrier's SMS gateway if possible.

- **[Twilio](https://www.twilio.com/sms)**\
First, read pricing information [here](https://www.twilio.com/sms/pricing). You get some free starting balance with which you can buy a Twilio phone number. For this method, you will need:
    - Twilio Account SID
    - Twilio Auth Token
    - Twilio Phone Number
    - Phone Number

    The first three can easily be obtained from the [Twilio console](https://www.twilio.com/console) after you make a Twilio account.\
    Phone number is the number to send SMS to. You will need to include country code and area code. Country code information can be found [here](https://countrycode.org/).
<br><br>


### Proxies
If you plan to use low interval rates OR track several items from one store, it is highly recommended that you use proxies such as ones from [Webshare](https://www.webshare.io/) in the format `ip:port` for IP-based authentication or `username:password@ip:port`.<br>\
**NOTE:** The following stores do not currently with proxies due to them blocking some connections/headers which results in inconsistent connection: Argos, Best Buy, Costco, and Tesco. Thus we thought it'd be best if we take off proxy support for now until we can do some further research or find an alternative way.
<br><br>


## Screenshots
![Screenshot of URLs](https://i.imgur.com/FVrmKNA.png)<br><br>
---
<br><br>![Screenshot of Settings](https://i.imgur.com/ue3Pdlv.png)<br><br>
---
<br><br>![Screenshot of Optional](https://i.imgur.com/w7xkXIw.png)


## Feedback and Support
To ensure this program continues to work, please report bugs by creating an [issue](https://github.com/Prince25/StockAlertBot/issues).\
To ask questions, give feedback or suggestions among other things, create a new [discussion](https://github.com/Prince25/StockAlertBot/discussions).\
To contribute code, programming questions/guidance, gaming sessions, and more, add me on Discord: Prince#0584\
To provide monetary support, [donate](https://www.paypal.com/donate?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD) or buy me a [Pizza](https://buymeacoff.ee/PrinceSingh) or [PayPal](https://paypal.me/PrinceSingh25) me 


## Things to work on
* Add more stores
    * B&H Photo Video
    * ~~Ebuyer~~
    * ~~Walmart~~
    * ~~Gamestop~~
    * ~~Currys~~
    * ~~Newegg Combos~~
    * ~~Newegg~~
    * ~~AntOnline~~
    * ~~Target~~
    * ~~Tesco~~
    * ~~Argos~~
* Add delay between items from the same store
* More OOP!!
    * ~~Add way to track notification status independent of items in a store~~
* Add tests
* ~~Fix~~ Find Bugs
    * ~~Fix notifications relying on `OPEN_URL`~~
* ~~Add Ability to use certain Amazon Merchants~~
* ~~Add Email and SMS Notifications~~ 
* ~~Add Proxies~~
* ~~Add GUI - Make it easier to use~~ 
* ~~Initially create seperation between intervals for Amazon items~~
* ~~Add a way to have independent delay timers for Amazon~~
* ~~Open product page when in stock~~
* ~~Add webhookURL to enable posting messages to Slack and Discord~~


## Main Technologies
- [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- [Vue.js](https://vuejs.org/) powered by [Vuetify](https://vuetifyjs.com/) and [Material Design Icons](https://materialdesignicons.com/)
- [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) and [Unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn) plugin
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)
- [Axios](https://github.com/axios/axios)
- [Dotenv](https://github.com/motdotla/dotenv)
- [Moment](https://momentjs.com/)
- [Nodemailer](https://nodemailer.com/)
- [Twilio](https://github.com/twilio/twilio-node)


## License
See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
