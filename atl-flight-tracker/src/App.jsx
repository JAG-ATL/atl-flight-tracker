import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FlightSearch from './components/FlightSearch';
import FlightDetails from './components/FlightDetails';
import Admin from './components/Admin';
import { fetchLocation } from './api';
import { CONFIG } from './config';
import './index.css';

// Central App Component
function FlightTrackerApp() {
  const location = useLocation();
  const [hotelId, setHotelId] = useState('');
  const [hotelData, setHotelData] = useState(null);
  const [activeScreen, setActiveScreen] = useState('search'); // 'search' or 'details'
  const [searchedFlight, setSearchedFlight] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hotel = params.get('hotelId');
    if (hotel) {
      setHotelId(hotel);
      fetchLocation(hotel).then(res => {
        if (res.success) setHotelData(res.data);
      });
    }
  }, [location.search]);



  const handleSearch = (flightNumber) => {
    setSearchedFlight(flightNumber);
    setActiveScreen('details');
  };

  const handleBackToSearch = () => {
    setActiveScreen('search');
    setSearchedFlight('');
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header-top animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
            <img src="/logo.svg" alt="ATL Track Logo" style={{ width: '40px', height: '40px' }} />
          </div>
          <div>
            <h1 className="text-lg">ATL Track</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <p className="text-xs text-secondary">
                {hotelData ? `${hotelData.name}` : 'Hartsfield-Jackson Int.'}
              </p>
              {hotelData && (
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: 'var(--text-accent)',
                  boxShadow: '0 0 8px var(--text-accent)'
                }}></span>
              )}
            </div>
          </div>
        </div>
        {activeScreen === 'details' ? (
          <div className="flight-status-badge status-green">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
            Live
          </div>
        ) : hotelData && (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-accent)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Location Verified
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="p-5 flex-1" style={{ padding: '20px', overflowY: 'auto' }}>
        {activeScreen === 'search' ? (
          <FlightSearch onSearch={handleSearch} />
        ) : (
          <FlightDetails 
            flightNumber={searchedFlight} 
            hotelId={hotelId} 
            hotelData={hotelData}
            onBack={handleBackToSearch} 
          />
        )}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={<FlightTrackerApp />} />
      </Routes>
    </Router>
  );
}
