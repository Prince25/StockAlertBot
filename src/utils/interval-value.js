/*
    Returns milliseconds from given interval units and value 
*/
export default function getMSFromInterval(interval) {
	switch (interval.unit) {
        case 'milliseconds':
            return interval.value

		case "seconds":
            return interval.value * 1000
			setInterval(storeFunction, INTERVAL.value * 1000, url, INTERVAL);

		case "minutes":
            return interval.value * 1000 * 60
			setInterval(storeFunction, INTERVAL.value * 1000 * 60, url, INTERVAL);

		case "hours":
            return interval.value * 1000 * 60 * 60
	}
}