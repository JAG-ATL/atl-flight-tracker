import axios from 'axios';
import { CONFIG } from './config';

const PROXY_URL = 'http://localhost:3001/api';

/**
 * Fetch specific live flight
 * @param {string} flightNumber 
 */
export const fetchFlight = async (flightNumber) => {
  try {
    const response = await axios.get(`${PROXY_URL}/flight/${flightNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching flight:', error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, error: 'Network error or proxy unreachable.' };
  }
};

/**
 * Fetch location details (hotel)
 * @param {string} hotelId 
 */
export const fetchLocation = async (hotelId) => {
  try {
    const response = await axios.get(`${PROXY_URL}/locations/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    return { success: false, error: 'Could not fetch hotel data.' };
  }
};

/**
 * Fetch travel time using local proxy to Google Maps Distance Matrix API
 */
export const fetchTravelTime = async (originLat, originLng, destLat, destLng) => {
  try {
    const response = await axios.get(`${PROXY_URL}/travel-time`, {
      params: { originLat, originLng, destLat, destLng }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching travel time:', error);
    return { success: false, error: 'Could not fetch travel time.' };
  }
};

/**
 * Fetch ATL Security Wait Times from proxy scraper
 */
export const fetchSecurityWaitTimes = async () => {
  try {
    const response = await axios.get(`${PROXY_URL}/security-wait-times`);
    return response.data;
  } catch (error) {
    console.error('Error fetching security times:', error);
    return { success: false, error: 'Could not fetch security times.' };
  }
};

/**
 * Update location details (shuttle, etc)
 */
export const updateLocation = async (hotelId, details) => {
  try {
    const response = await axios.post(`${PROXY_URL}/locations`, {
      id: hotelId,
      ...details
    });
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    return { success: false, error: 'Failed to update location data.' };
  }
};

