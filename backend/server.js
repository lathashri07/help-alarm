const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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

    console.log('Database tables initialized');
  });
}

// API Endpoints

// 1. Get all emergency contacts
app.get('/api/contacts', (req, res) => {
  db.all('SELECT * FROM emergency_contacts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
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
app.post('/api/emergency-alert', (req, res) => {
  const { latitude, longitude, message } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Location data is required' });
  }

  // Save alert to database
  db.run(
    'INSERT INTO emergency_alerts (latitude, longitude, message) VALUES (?, ?, ?)',
    [latitude, longitude, message || 'Emergency Alert!'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get all contacts and prepare alert response
      db.all('SELECT phone_number, contact_name FROM emergency_contacts', (err, contacts) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch contacts' });
        }

        res.json({
          alertId: this.lastID,
          location: { latitude, longitude },
          message: message || 'Emergency Alert!',
          contactsNotified: contacts.length,
          contacts: contacts,
          timestamp: new Date().toISOString()
        });
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
