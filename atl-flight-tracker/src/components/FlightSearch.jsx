import React, { useState, useRef } from 'react';

export default function FlightSearch({ onSearch }) {
  const [flightNumber, setFlightNumber] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  if ('webkitSpeechRecognition' in window && !recognitionRef.current) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Clean up common speech artifacts like "flight" or spaces
      const cleaned = transcript
        .replace(/flight/i, '')
        .replace(/\\s+/g, '')
        .toUpperCase();
      
      setFlightNumber(cleaned);
      setIsListening(false);
      // Auto submit after hearing
      if (cleaned) {
        onSearch(cleaned);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
  }

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (flightNumber.trim()) {
      onSearch(flightNumber.trim());
    }
  };

  return (
    <div className="glass-panel animate-fade-up" style={{ padding: '30px', textAlign: 'center', marginTop: '20vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--text-accent)', marginBottom: '16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <h2 className="text-xl" style={{ marginBottom: '8px' }}>Find Your Flight</h2>
        <p className="text-secondary text-sm">Type or say your flight number (e.g. DL 1234)</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            className="input-field text-md" 
            style={{ 
              width: '100%',
              padding: '16px 20px', 
              paddingRight: '60px', 
              borderRadius: 'var(--radius-full)',
              fontSize: '1.2rem'
            }}
            placeholder="Flight #" 
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
          />
          
          {recognitionRef.current && (
            <button 
              type="button"
              onClick={toggleListen}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: isListening ? 'var(--status-red)' : 'var(--text-accent)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 2
              }}
            >
              {isListening ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <circle cx="12" cy="12" r="10"></circle>
                  <rect x="9" y="9" width="6" height="6"></rect>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
          )}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              padding: '10px 24px', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.95rem',
              width: 'auto',
              minWidth: '160px'
            }}
            disabled={!flightNumber.trim()}
          >
            Track Flight
          </button>
        </div>
      </form>
    </div>
  );
}
