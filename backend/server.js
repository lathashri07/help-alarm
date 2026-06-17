const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const webpush = require('web-push');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const twilio = require('twilio');

// Twilio Setup
let twilioClient = null;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+1234567890'; // Placeholder

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS Client initialized successfully');
  } catch (e) {
    console.error('Failed to initialize Twilio client:', e.message);
  }
} else {
  console.log('Twilio SMS not configured - running SMS in demo mode');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Setup
const dbPath = path.join(__dirname, 'help_alarm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database Schema
function initializeDatabase() {
  db.serialize(() => {
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL UNIQUE,
        contact_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS emergency_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL,
        longitude REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        message TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(contact_id) REFERENCES emergency_contacts(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized');
    initializeVapidKeys();
  });
}

// VAPID keys object
let vapidKeys = { publicKey: null, privateKey: null };

function initializeVapidKeys() {
  db.get("SELECT value FROM settings WHERE key = 'vapid_public_key'", (err, pubRow) => {
    if (err) {
      console.error('Error reading VAPID public key setting:', err);
      return;
    }
    
    db.get("SELECT value FROM settings WHERE key = 'vapid_private_key'", (err, privRow) => {
      if (err) {
        console.error('Error reading VAPID private key setting:', err);
        return;
      }
      
      const envPubKey = process.env.VAPID_PUBLIC_KEY;
      const envPrivKey = process.env.VAPID_PRIVATE_KEY;
      
      if (envPubKey && envPrivKey) {
        vapidKeys.publicKey = envPubKey;
        vapidKeys.privateKey = envPrivKey;
        console.log('VAPID keys loaded from environment variables');
      } else if (pubRow && privRow) {
        vapidKeys.publicKey = pubRow.value;
        vapidKeys.privateKey = privRow.value;
        console.log('VAPID keys loaded from database settings');
      } else {
        // Generate new keys
        console.log('Generating new VAPID keys for Push Notifications...');
        try {
          const generated = webpush.generateVAPIDKeys();
          vapidKeys.publicKey = generated.publicKey;
          vapidKeys.privateKey = generated.privateKey;
          
          db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('vapid_public_key', ?)", [vapidKeys.publicKey]);
          db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('vapid_private_key', ?)", [vapidKeys.privateKey]);
          console.log('New VAPID keys saved to database settings');
        } catch (genErr) {
          console.error('Failed to generate VAPID keys:', genErr);
        }
      }
      
      // Configure web-push
      if (vapidKeys.publicKey && vapidKeys.privateKey) {
        try {
          webpush.setVapidDetails(
            'mailto:safety@helpalarm.com',
            vapidKeys.publicKey,
            vapidKeys.privateKey
          );
          console.log('Web Push services initialized successfully');
        } catch (wpErr) {
          console.error('Failed to initialize web-push details:', wpErr);
        }
      }
    });
  });
}

// API Endpoints

// 1. Get all emergency contacts
app.get('/api/contacts', (req, res) => {
  db.all(
    `SELECT ec.*, 
     (SELECT COUNT(*) FROM push_subscriptions WHERE contact_id = ec.id) as device_count 
     FROM emergency_contacts ec 
     ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// 2. Add emergency contact
app.post('/api/contacts', (req, res) => {
  const { phoneNumber, contactName } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  db.run(
    'INSERT INTO emergency_contacts (phone_number, contact_name) VALUES (?, ?)',
    [phoneNumber, contactName || 'Unknown'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        phone_number: phoneNumber,
        contact_name: contactName || 'Unknown',
        created_at: new Date().toISOString()
      });
    }
  );
});

// 3. Delete emergency contact
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM emergency_contacts WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  });
});

// 4. Send emergency alert with location
app.post('/api/emergency-alert', async (req, res) => {
  const { latitude, longitude, message } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Location data is required' });
  }

  // Save alert to database
  db.run(
    'INSERT INTO emergency_alerts (latitude, longitude, message) VALUES (?, ?, ?)',
    [latitude, longitude, message || 'Emergency Alert!'],
    async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get all contacts
      db.all('SELECT id, phone_number, contact_name FROM emergency_contacts', async (err, contacts) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch contacts' });
        }

        // Prepare emergency message with location (shortened to 1 segment to prevent Twilio Trial Error 30044)
        const mapsLink = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        const smsMessage = `EMERGENCY ALERT: Your loved one is in danger! Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}. View: ${mapsLink}`;

        // Send SMS to all contacts (if Twilio is configured)
        let smsSendResults = [];
        if (contacts.length > 0) {
          if (twilioClient) {
            for (const contact of contacts) {
              try {
                let phoneNumber = contact.phone_number.replace(/[^\d+]/g, '');
                // Ensure it starts with + for Twilio
                if (!phoneNumber.startsWith('+')) {
                  phoneNumber = '+' + phoneNumber;
                }
                
                const messageObj = await twilioClient.messages.create({
                  body: smsMessage,
                  from: TWILIO_FROM_NUMBER,
                  to: phoneNumber
                });

                smsSendResults.push({
                  contact: contact.contact_name,
                  phone: contact.phone_number,
                  status: 'sent',
                  messageId: messageObj.sid
                });
                console.log(`Twilio SMS sent to ${contact.contact_name} at ${contact.phone_number}`);
              } catch (smsErr) {
                console.error(`Failed to send Twilio SMS to ${contact.phone_number}:`, smsErr.message);
                smsSendResults.push({
                  contact: contact.contact_name,
                  phone: contact.phone_number,
                  status: 'failed',
                  error: smsErr.message
                });
              }
            }
          } else {
            // Demo mode - simulate SMS sending
            console.log('📱 DEMO MODE - SMS would be sent to:');
            smsSendResults = contacts.map(contact => ({
              contact: contact.contact_name,
              phone: contact.phone_number,
              status: 'demo-sent',
              message: 'Demo mode - Twilio not configured'
            }));
            contacts.forEach(contact => {
              console.log(`  📞 ${contact.contact_name}: ${contact.phone_number}`);
            });
            console.log(`  📝 Message: ${smsMessage}`);
          }
        }

        // --- Push Notifications Logic ---
        let pushSendResults = [];
        db.all(
          `SELECT ps.id as sub_id, ps.endpoint, ps.p256dh, ps.auth, ec.contact_name, ec.phone_number 
           FROM push_subscriptions ps
           JOIN emergency_contacts ec ON ps.contact_id = ec.id`,
          async (err2, subscriptions) => {
            if (err2) {
              console.error('Failed to fetch push subscriptions:', err2);
            } else if (subscriptions && subscriptions.length > 0) {
              const payload = JSON.stringify({
                title: '🆘 EMERGENCY ALERT!',
                body: `Your loved one is in danger! Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                icon: '/favicon.ico',
                data: {
                  mapsLink: mapsLink,
                  latitude,
                  longitude
                }
              });

              for (const sub of subscriptions) {
                const pushSubscription = {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                  }
                };

                try {
                  await webpush.sendNotification(pushSubscription, payload);
                  pushSendResults.push({
                    contact: sub.contact_name,
                    phone: sub.phone_number,
                    status: 'delivered'
                  });
                  console.log(`Push notification sent to ${sub.contact_name}`);
                } catch (pushErr) {
                  console.error(`Failed to send push notification to ${sub.contact_name}:`, pushErr.message);
                  
                  // Clean up invalid subscriptions
                  if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                    db.run('DELETE FROM push_subscriptions WHERE id = ?', [sub.sub_id], (deleteErr) => {
                      if (deleteErr) {
                        console.error(`Failed to delete expired subscription ${sub.sub_id}:`, deleteErr);
                      } else {
                        console.log(`Deleted expired subscription ${sub.sub_id} for ${sub.contact_name}`);
                      }
                    });
                  }

                  pushSendResults.push({
                    contact: sub.contact_name,
                    phone: sub.phone_number,
                    status: 'failed',
                    error: pushErr.message
                  });
                }
              }
            } else {
              console.log('No push notification subscriptions found to notify');
            }

            // Return final response
            res.json({
              alertId: this.lastID,
              location: { latitude, longitude },
              message: message || 'Emergency Alert!',
              contactsNotified: contacts.length,
              contacts: contacts,
              smsResults: smsSendResults,
              pushResults: pushSendResults,
              mapsLink: mapsLink,
              timestamp: new Date().toISOString()
            });
          }
        );
      });
    }
  );
});

// 5. Get emergency alert history
app.get('/api/alerts', (req, res) => {
  db.all(
    'SELECT * FROM emergency_alerts ORDER BY timestamp DESC LIMIT 50',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Delete all emergency alert history
app.delete('/api/alerts', (req, res) => {
  db.run('DELETE FROM emergency_alerts', function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'All alert history deleted successfully', changes: this.changes });
  });
});

// 6. Get VAPID public key
app.get('/api/vapid-public-key', (req, res) => {
  if (!vapidKeys.publicKey) {
    return res.status(503).json({ error: 'Push notifications not yet initialized' });
  }
  res.json({ publicKey: vapidKeys.publicKey });
});

// 7. Subscribe device for a contact
app.post('/api/subscribe', (req, res) => {
  const { contactId, subscription } = req.body;

  if (!contactId || !subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Contact ID and valid subscription are required' });
  }

  const { endpoint, keys } = subscription;
  if (!keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({ error: 'Subscription keys (p256dh, auth) are required' });
  }

  // Remove existing subscription for this endpoint first, then insert (like upsert)
  db.run(
    'DELETE FROM push_subscriptions WHERE endpoint = ?',
    [endpoint],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run(
        'INSERT INTO push_subscriptions (contact_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
        [contactId, endpoint, keys.p256dh, keys.auth],
        function (err2) {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }
          res.json({ success: true, message: 'Subscription saved successfully' });
        }
      );
    }
  );
});

// 8. Unsubscribe device
app.post('/api/unsubscribe', (req, res) => {
  const { subscription } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Valid subscription endpoint is required' });
  }

  db.run(
    'DELETE FROM push_subscriptions WHERE endpoint = ?',
    [subscription.endpoint],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Unsubscribed successfully' });
    }
  );
});

// 9. Check subscription for current device
app.post('/api/check-subscription', (req, res) => {
  const { subscription } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.json({ subscribedContactId: null });
  }

  db.get(
    'SELECT contact_id FROM push_subscriptions WHERE endpoint = ?',
    [subscription.endpoint],
    (err, row) => {
      if (err || !row) {
        return res.json({ subscribedContactId: null });
      }
      res.json({ subscribedContactId: row.contact_id });
    }
  );
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Help Alarm Backend running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
