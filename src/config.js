// Central configuration for the ATL Flight Tracker

export const CONFIG = {
  AVIATIONSTACK_API_KEY: import.meta.env.VITE_AVIATIONSTACK_API_KEY,
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  // Base endpoints
  AVIATIONSTACK_BASE_URL: 'https://api.aviationstack.com/v1',
  
  // Default ATL Coordinates
  ATL_AIRPORT: {
    lat: 33.6407,
    lng: -84.4277,
    name: 'Hartsfield-Jackson Atlanta International Airport'
  },
  
  // Locations are now managed via the backend/data/locations.json
};
