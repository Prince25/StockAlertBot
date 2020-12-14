# InventoryAlertBot
Faced with the scenario of scalpers using bots to hog up all the inventory of popular holiday toys and sell them at ridiciously high markup price, I decided to at least attempt to put up a fight so we can get our hands on things we ~~want~~ need to survive the #Coronavirus quarantine(s). Of course, this is only half the battle. For full writeup on scoring items, look [here](https://github.com/PrinceS25/InventoryAlertBot/wiki/Beating-Scalpers).

Buy me a [pizza](buymeacoff.ee/PrinceSingh) if you'd like to see this project expanded and support me. :) <br>
<a href="https://www.buymeacoffee.com/PrinceSingh" target="_blank"><img src="https://i.imgur.com/NeXoy2V.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
<br><br>
> How does it work?

Enter the product URLs and set how often you want the program to check if those products are in stock. When an item becomes available, it will notify you through both text on console and three auditory beeps as well as opening the product page automatically in your default web browser if you allowed it to do so.

> What stores/wesbites are supported?

Currently, the following stores are supported:
* AntOnline
* Amazon (Fails at low interval rates)
* Best Buy (including open-box)
* Costco
* Microcenter
* Newegg
* Target (Works but may require intervention)
* Tesco (UK, Only for PS5)

![Screenshot](https://i.imgur.com/po6GtU6.png)

### Prerequisites
1. Install [Node.js](https://nodejs.org/en/)
2. Clone or download this repository
    `git clone https://github.com/PrinceS25/InventoryAlertBot.git`
3. Change directory
    `cd InventoryAlertBot`
4. Install npm packages
    `npm install`

### Usage
1. Open and edit main.js
    * Add urls of products in the `URLS` array
    * Change the `INTERVAL` to suit your desires.\
    **WARNING:** Having the interval too low might have negative consquences such as this program being detected as a bot (Amazon), or blocking your IP from accessing the website.
    * Set OPEN_URL to false if you don't want the application to automatically open urls when item is in stock
    * If you're planning to track more than one Amazon item, set the delay between items here.
    Otherwise, Amazon may flag the program's requests as a bot.
    * If you're planning to track Target item(s), enter your zip code\
    **NOTE:** If you encounter an error relating to API Key, you need to get this key yourself:
        1. Go to target.com with the DevTools (Chrome) or Developer Tools (Firefox) open (Google or ask if you're unsure how)
        2. On the console, you should see GET requests as you load the page.\
        In DevTools, you have to click the gear and check "Log XMLHttpRequests" to see them
        3. Click on any of the urls that has the string "key=" and copy the whole key
        4. Paste it to TARGET_KEY
2. Execute and continue about your day
    `node main.js`
3. Consider buying me a [pizza](buymeacoff.ee/PrinceSingh)

### Things to work on
* Add more stores
    * Walmart
    * Gamestop
    * Tesco
    * Argos
    * ~~Newegg~~
    * ~~AntOnline~~
    * ~~Target~~
* Add GUI - Make it easier to use 
* Add Email and Maybe SMS Notifications
* ~~Fix~~ Find Bugs
* ~~Initially create seperation between intervals for Amazon items~~
* ~~Add a way to have independent delay timers for Amazon~~
* ~~Open product page when in stock~~
