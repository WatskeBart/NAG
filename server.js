// server.js - Express server with database connection
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();
const port = 3000;

// Set up the database
const db = new Database('./nag_database.db', { verbose: console.log });

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT PRIMARY KEY,
    icon_type TEXT NOT NULL,
    icon_count INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS nag_state (
    user_id TEXT PRIMARY KEY,
    icons TEXT NOT NULL,
    messages TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS pins (
    user_id TEXT PRIMARY KEY,
    pin TEXT NOT NULL
  );
`);

// Prepare statements
const getSettings = db.prepare('SELECT * FROM settings WHERE user_id = ?');
const saveSettings = db.prepare('INSERT OR REPLACE INTO settings (user_id, icon_type, icon_count) VALUES (?, ?, ?)');
const getState = db.prepare('SELECT * FROM nag_state WHERE user_id = ?');
const saveState = db.prepare('INSERT OR REPLACE INTO nag_state (user_id, icons, messages) VALUES (?, ?, ?)');
const getPin = db.prepare('SELECT pin FROM pins WHERE user_id = ?');
const savePin = db.prepare('INSERT OR REPLACE INTO pins (user_id, pin) VALUES (?, ?)');
const deleteState = db.prepare('DELETE FROM nag_state WHERE user_id = ?');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// API endpoints

// Get settings
app.get('/api/settings/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const row = getSettings.get(userId);
    
    if (!row) {
      // Return default settings if not found
      return res.json({
        iconType: '❤️',
        iconCount: 7
      });
    }
    
    res.json({
      iconType: row.icon_type,
      iconCount: row.icon_count
    });
  } catch (err) {
    console.error('Error getting settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save settings
app.post('/api/settings/:userId', (req, res) => {
  const userId = req.params.userId;
  const { iconType, iconCount } = req.body;
  
  try {
    saveSettings.run(userId, iconType, iconCount);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get NAG state
app.get('/api/state/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const row = getState.get(userId);
    
    if (!row) {
      // Return empty state if not found
      return res.json({
        icons: [],
        messages: ''
      });
    }
    
    res.json({
      icons: JSON.parse(row.icons),
      messages: row.messages
    });
  } catch (err) {
    console.error('Error getting state:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save NAG state
app.post('/api/state/:userId', (req, res) => {
  const userId = req.params.userId;
  const { icons, messages } = req.body;
  
  try {
    saveState.run(userId, JSON.stringify(icons), messages);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving state:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get PIN
app.get('/api/pin/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const row = getPin.get(userId);
    
    res.json({
      hasPin: !!row,
      pin: row ? row.pin : null
    });
  } catch (err) {
    console.error('Error getting PIN:', err);
    res.status(500).json({ error: err.message });
  }
});

// Set PIN
app.post('/api/pin/:userId', (req, res) => {
  const userId = req.params.userId;
  const { pin } = req.body;
  
  try {
    savePin.run(userId, pin);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving PIN:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user data (for reset)
app.delete('/api/reset/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    deleteState.run(userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error resetting state:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`NAG server running at http://localhost:${port}`);
});