import {} from "./main.js";

class Store {
	constructor(name) {
		this.name = name;
		this.items = [];
		this.badProxies = [];
	}

	// Adds an Item to the array
	addItem(item) {
		this.items.push(item);
	}

	// Starts checking status of items
	startMonitor() {
		if (this.items.length == 0) {

		}
        
	}
}
