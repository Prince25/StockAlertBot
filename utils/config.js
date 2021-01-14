import * as dotenv from 'dotenv';

const envFOUND = dotenv.config();

if (!envFOUND) {
	console.error('.env file not found')
}

export default {
	email: {
		service: process.env.EMAIL_SERVICE,
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
		to: process.env.EMAIL_TO
	}
}