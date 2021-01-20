import * as dotenv from 'dotenv';
dotenv.config();

export default {
	email: {
		service: process.env.EMAIL_SERVICE,
		from: process.env.EMAIL_FROM,
		pass: process.env.EMAIL_PASS,
		to: process.env.EMAIL_TO
	}
}