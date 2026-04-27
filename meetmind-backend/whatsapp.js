const twilio = require('twilio');

let client;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } else {
    console.warn('WhatsApp: TWILIO_ACCOUNT_SID is missing or invalid. WhatsApp notifications will be disabled.');
  }
} catch (err) {
  console.error('WhatsApp: Failed to initialize Twilio client:', err.message);
}

async function sendWhatsAppSummary(to, summary) {
  if (!client) {
    console.warn('WhatsApp: Cannot send summary, Twilio client not initialized.');
    return;
  }
  try {
    await client.messages.create({
      body: summary,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: to || process.env.WHATSAPP_TO_NUMBER
    });
    console.log('WhatsApp summary sent successfully');
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

module.exports = { sendWhatsAppSummary };