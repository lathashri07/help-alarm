const twilio = require('twilio');

// Initialize Twilio client using environment variables configured in Google Cloud Console
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Responds to HTTP request containing geolocation coordinates and contact metadata.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.sendAlertSMS = async (req, res) => {
  // CORS Headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Ensure request is POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { latitude, longitude, contacts } = req.body;

  if (latitude === undefined || longitude === undefined || !contacts || !Array.isArray(contacts)) {
    res.status(400).json({ 
      error: 'Invalid Payload. Required properties: latitude, longitude, and contacts (array of objects).' 
    });
    return;
  }

  if (!twilioClient) {
    res.status(500).json({ 
      error: 'Twilio Client is not configured. Please set environment variables on Google Cloud Function.' 
    });
    return;
  }

  const mapsLink = `https://maps.google.com/?q=${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;
  const smsMessage = `EMERGENCY ALERT: Your loved one is in danger! Lat: ${Number(latitude).toFixed(4)}, Lng: ${Number(longitude).toFixed(4)}. View: ${mapsLink}`;

  const results = [];
  
  for (const contact of contacts) {
    const phone = contact.phone_number || contact.phone;
    if (!phone) continue;

    let targetPhone = phone.trim();
    if (!targetPhone.startsWith('+')) {
      targetPhone = '+' + targetPhone;
    }

    try {
      const message = await twilioClient.messages.create({
        body: smsMessage,
        from: TWILIO_FROM_NUMBER,
        to: targetPhone
      });

      results.push({
        contact: contact.contact_name || 'Emergency Contact',
        phone: phone,
        status: 'sent',
        messageId: message.sid
      });
    } catch (err) {
      results.push({
        contact: contact.contact_name || 'Emergency Contact',
        phone: phone,
        status: 'failed',
        error: err.message
      });
    }
  }

  res.status(200).json({
    success: true,
    results: results
  });
};
