import * as dotenv from 'dotenv';
dotenv.config();

export default {
	email: {
		service: process.env.EMAIL_SERVICE,
		from: process.env.EMAIL_FROM,
		pass: process.env.EMAIL_PASS,
		to: process.env.EMAIL_TO
	},

	sms_aws: {
		region: process.env.SMS_AWS_REGION,
		key: process.env.SMS_AWS_ACCESS_KEY,
		secret: process.env.SMS_AWS_SECRET_ACCESS,
		phone: process.env.SMS_AWS_PHONE_NUMBER
	},

	sms_email: {
		service: process.env.SMS_EMAIL_SERVICE,
		from: process.env.SMS_EMAIL_FROM,
		pass: process.env.SMS_EMAIL_PASS,
		carrier: process.env.SMS_EMAIL_PHONE_CARRIER,
		number: process.env.SMS_EMAIL_PHONE_NUMBER
	},
	
	sms_twilio: {
		sid: process.env.SMS_TWILIO_ACCOUNT_SID,
		auth: process.env.SMS_TWILIO_AUTH_TOKEN, 
		from: process.env.SMS_TWILIO_FROM_NUMBER, 
		to: process.env.SMS_TWILIO_TO_NUMBER
	}
}