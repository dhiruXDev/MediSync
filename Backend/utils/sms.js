import { configDotenv } from 'dotenv';
import twilio from 'twilio';

configDotenv(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);
 
function sendSMS(to, message) {
  return client.messages.create({
    body: message,
    to,
    from: twilioPhone
  });
}

export default sendSMS; 