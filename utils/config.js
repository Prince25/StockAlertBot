import * as dotenv from 'dotenv';
dotenv.config();

export default {
	aws: {
		key: process.env.AWS_ACCESS_KEY,
		secret: process.env.AWS_SECRET_ACCESS,
		region: process.env.AWS_REGION,
		phone: process.env.AWS_PHONE_NUMBER
	},
	email: {
		service: process.env.EMAIL_SERVICE,
		from: process.env.EMAIL_FROM,
		pass: process.env.EMAIL_PASS,
		to: process.env.EMAIL_TO
	},
	sms: {
		carrier: process.env.PHONE_CARRIER,
		number: process.env.PHONE_NUMBER
	},
	twilio: {
		sid: process.env.TWILIO_ACCOUNT_SID,
		auth: process.env.TWILIO_AUTH_TOKEN, 
		from: process.env.TWILIO_FROM_NUMBER, 
		to: process.env.TWILIO_TO_NUMBER
	}
}