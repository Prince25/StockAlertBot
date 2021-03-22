import { INTERVAL } from './main.js'


class Item {

    constructor(url, ) {
        this.url = url;
		this.interval = { ...INTERVAL };
		this.firstRun = true;
		this.urlOpened = false;
		this.storeFunc = amazon;
    }
};