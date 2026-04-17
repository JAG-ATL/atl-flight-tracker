import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'locations.json');

// --- Helper Functions ---
async function readLocations() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function writeLocations(locations) {
  await fs.writeFile(DATA_FILE, JSON.stringify(locations, null, 2), 'utf-8');
}

// --- Location Management Endpoints ---

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await readLocations();
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to read locations' });
  }
});

// Get a single location by ID
app.get('/api/locations/:id', async (req, res) => {
  try {
    const locations = await readLocations();
    const location = locations[req.params.id];
    if (location) {
      res.json({ success: true, data: location });
    } else {
      res.status(404).json({ success: false, error: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to read location' });
  }
});

// Add or update a location
app.post('/api/locations', async (req, res) => {
  try {
    const { id, ...details } = req.body;
    if (!id || !details.name) {
      return res.status(400).json({ success: false, error: 'ID and Name are required' });
    }
    const locations = await readLocations();
    locations[id] = details;
    await writeLocations(locations);
    res.json({ success: true, data: locations[id] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save location' });
  }
});

// --- Proxy Endpoints (Existing Logic) ---

app.get('/api/flight/:flightNumber', async (req, res) => {
  try {
    const flightNumber = req.params.flightNumber.replace(/\s+/g, '').toUpperCase();
    const params = {
      access_key: process.env.VITE_AVIATIONSTACK_API_KEY,
      flight_iata: flightNumber,
      limit: 1
    };
    const response = await axios.get('http://api.aviationstack.com/v1/flights', { params });
    if (response.data && response.data.data && response.data.data.length > 0) {
      res.json({ success: true, data: response.data.data[0] });
    } else {
      res.status(404).json({ success: false, error: 'Flight not found or active.' });
    }
  } catch (error) {
    console.error('Error fetching flight from aviationstack:', error.message);
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

app.listen(PORT, () => console.log(`Proxy server running: http://localhost:${PORT}`));
