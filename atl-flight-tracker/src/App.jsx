import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import FlightBoard from './components/FlightBoard';
import ChatOverlay from './components/ChatOverlay';
import './index.css';

// Central App Component
function FlightTrackerApp() {
  const location = useLocation();
  const [hotelId, setHotelId] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hotel = params.get('hotelId');
    if (hotel) {
      setHotelId(hotel);
    }
    
    // Automatically pop open chat after a short delay for that "pops up" effect
    // as requested by the user.
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [location.search]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header-top animate-fade-up">
        <div>
          <h1 className="text-lg">ATL Live Tracker</h1>
          <p className="text-xs text-secondary mt-1">
            {hotelId ? `Connected to: ${hotelId}` : 'Hartsfield-Jackson Int.'}
          </p>
        </div>
        <div className="flight-status-badge status-green">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
          Live
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-5 flex-1" style={{ padding: '20px' }}>
        <FlightBoard hotelId={hotelId} />
        
        {/* Floating Action Button for Chat */}
        <button 
          className="btn-primary" 
          style={{ position: 'fixed', bottom: '30px', right: '20px', zIndex: 50, padding: '16px', borderRadius: '50%', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)' }}
          onClick={() => setIsChatOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </main>

      {/* Chat Overlay Manager */}
      <ChatOverlay 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        hotelId={hotelId} 
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <FlightTrackerApp />
    </Router>
  );
}
