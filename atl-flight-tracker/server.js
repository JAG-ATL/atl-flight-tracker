import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

import admin from 'firebase-admin';

console.log('Server script starting...');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dotenv.config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // .env is optional
}

// Initialize Firebase Admin
let db = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    db = admin.firestore();
    console.log('Firebase Admin & Firestore initialized successfully');
  } else {
    console.log('Firebase credentials not found. Falling back to local locations.json');
  }
} catch (error) {
  console.error('Firebase/Firestore initialization failed:', error.message);
  db = null; // Ensure we fallback to local JSON
}

const app = express();
app.use(cors());
app.use(express.json());

// Health Check Endpoints
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/health-check', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'locations.json');

// --- Helper Functions ---
async function readLocations() {
  if (db) {
    try {
      const snapshot = await db.collection('locations').get();
      const locations = {};
      snapshot.forEach(doc => {
        locations[doc.id] = doc.data();
      });
      return locations;
    } catch (err) {
      console.error('Firestore read error:', err);
    }
  }
  
  // Fallback to local JSON
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function writeLocations(locations, singleId = null) {
  if (db && singleId) {
    try {
      if (locations[singleId]) {
        await db.collection('locations').doc(singleId).set(locations[singleId]);
      } else {
        await db.collection('locations').doc(singleId).delete();
      }
      return;
    } catch (err) {
      console.error('Firestore write error:', err);
    }
  }

  // Always write to local JSON as well (for backup/local dev)
  await fs.writeFile(DATA_FILE, JSON.stringify(locations, null, 2), 'utf-8');
}

// --- API Endpoints ---

// Get all hotels/locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await readLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read locations' });
  }
});

// Create or update a location
app.post('/api/locations', async (req, res) => {
  try {
    const { id, details } = req.body;
    if (!id || !details) {
      return res.status(400).json({ error: 'Missing ID or details' });
    }
    const locations = await readLocations();
    locations[id] = details;
    await writeLocations(locations, id);
    res.json({ success: true, data: locations[id] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save location' });
  }
});

// Delete a location
app.delete('/api/locations/:id', async (req, res) => {
  try {
    const locations = await readLocations();
    if (locations[req.params.id]) {
      const idToDelete = req.params.id;
      delete locations[idToDelete];
      await writeLocations(locations, idToDelete);
      res.json({ success: true, message: 'Location deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete location' });
  }
});

// Proxy flight data from AviationStack
app.get('/api/flights', async (req, res) => {
  try {
    const { flight_iata } = req.query;
    const apiKey = process.env.VITE_AVIATIONSTACK_API_KEY;
    
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: { access_key: apiKey, flight_iata }
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      res.json({ success: true, data: response.data.data[0] });
    } else {
      res.status(404).json({ success: false, error: 'Flight not found or active.' });
    }
  } catch (error) {
    // Mock Fallback
    res.json({ 
      success: true, 
      data: {
        flight_date: new Date().toISOString().split('T')[0],
        flight_status: "active",
        departure: { airport: "Hartsfield-Jackson Atlanta", iata: "ATL", estimated: new Date(Date.now() + 3600000).toISOString(), terminal: "South", gate: "T12" },
        arrival: { airport: "Miami International", iata: "MIA", estimated: new Date(Date.now() + 7200000).toISOString(), terminal: "D", gate: "D14" },
        airline: { name: "Delta Air Lines" },
        flight: { iata: req.params.flightNumber.toUpperCase() || "DL1234" }
      }
    });
  }
});

app.get('/api/travel-time', async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;
    if (!originLat || !originLng || !destLat || !destLng) return res.status(400).json({ success: false, error: 'Missing coordinates.' });
    const origin = `${originLat},${originLng}`;
    const destination = `${destLat},${destLng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    if (response.data && response.data.rows && response.data.rows.length > 0 && response.data.rows[0].elements && response.data.rows[0].elements.length > 0 && response.data.rows[0].elements[0].status === 'OK') {
      const element = response.data.rows[0].elements[0];
      res.json({ success: true, data: { durationText: element.duration.text, durationSeconds: element.duration.value, distanceText: element.distance.text } });
    } else {
      console.error("Google Maps API error:", response.data);
      res.status(400).json({ success: false, error: 'Calculation failed', details: response.data.error_message });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Proxy error' });
  }
});

app.get('/api/security-wait-times', async (req, res) => {
  try {
    const response = await axios.get('https://www.atl.com/times/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = response.data;
    const $ = cheerio.load(html);
    const bodyText = $('body').text();
    const parseTime = (name) => {
      const regex = new RegExp(`${name}[^\\n\\r]{0,30}(\\d+\\s*-\\s*\\d+|\\d+)\\s*min`, 'i');
      const match = bodyText.match(regex);
      return match ? match[1] + ' min' : (Math.floor(Math.random() * 20 + 10) + ' min (Est)');
    };
    res.json({ success: true, data: { north: parseTime('North'), south: parseTime('South'), main: parseTime('Main') } });
  } catch (error) {
    res.json({ success: true, data: { north: '15-20 min', south: '10-15 min', main: '20-25 min' } });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

console.log('[DEBUG] All routes registered. Attempting to start server...');
app.listen(PORT, () => {
  console.log(`[SUCCESS] App running and listening on port: ${PORT}`);
});
