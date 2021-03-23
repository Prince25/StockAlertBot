import beep from "beepbeep";

export default async function sendAuditoryAlert() {
	beep([1000, 500, 1000]);
}
