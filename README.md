# InventoryAlertBot
Faced with the scenario of scalpers using bots to hog up all the inventory of popular holiday toys and sell them at ridiciously high markup price, I decided to at least attempt to put up a fight so we can get our hands on things we ~~want~~ need to survive the #Coronavirus quarantine(s).

Buy me a [coffee](buymeacoff.ee/PrinceSingh) if you'd like to see this project expanded and support me. :) <br>
<a href="https://www.buymeacoffee.com/PrinceSingh" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
<br><br>
> How does it work?

Enter the product URLs and set how often you want the program to check if those products are in stock. When an item becomes available, it will notify you through both text on console and three auditory beeps.

> What stores/wesbites are supported?

Currently, the following stores are supported:
* Amazon
* Best Buy
* Costco
* Microcenter

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
    * Add urls to products in the `URLS` array
    * Change the `INTERVAL` to suit your desires.
    **WARNING:** Having the interval too low might have negative consquences such as this program being detected as a bot (Amazon), or blocking your IP from accessing the website.
2. Execute and continue about your day
    `node main.js`
3. Consider buying me a [pizza](buymeacoff.ee/PrinceSingh)

### Things to work on
* Add more stores
    * Newegg
    * Walmart
    * Gamestop
* Add GUI - Make it easier to use
* ~~Fix~~ Find Bugs
