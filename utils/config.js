import * as dotenv from 'dotenv';

const envFOUND = dotenv.config();

if (!envFOUND) {
	console.error('.env file not found')
}

export default {
	email: {
		service: process.env.EMAIL_SERVICE,
		from: process.env.EMAIL_FROM,
		pass: process.env.EMAIL_PASS,
		to: process.env.EMAIL_TO
	}
}