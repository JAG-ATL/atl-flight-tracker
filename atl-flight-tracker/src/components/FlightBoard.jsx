import React, { useState } from 'react';

const mockFlights = [
  { id: 'DL1234', from: 'JFK', time: '14:30', status: 'On Time', gate: 'T12', type: 'arrival' },
  { id: 'DL5678', to: 'MIA', time: '15:15', status: 'Delayed', gate: 'A4', type: 'departure' },
  { id: 'AA890', from: 'ORD', time: '15:45', status: 'On Time', gate: 'B18', type: 'arrival' },
  { id: 'UA443', to: 'SFO', time: '16:00', status: 'On Time', gate: 'C22', type: 'departure' },
];

export default function FlightBoard({ hotelId }) {
  const [filter, setFilter] = useState('all'); // 'all', 'arrival', 'departure'

  const filteredFlights = mockFlights.filter(f => filter === 'all' || f.type === filter);

  return (
    <div className="glass-panel animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-border)' }}>
        <h2 className="text-md">Live Flight Board {hotelId ? `(Near ${hotelId})` : ''}</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            onClick={() => setFilter('all')}
            style={{ 
              background: filter === 'all' ? 'var(--text-accent)' : 'var(--surface-2)', 
              color: filter === 'all' ? '#000' : 'var(--text-primary)',
              border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)'
            }}
          >All</button>
          <button 
            onClick={() => setFilter('arrival')}
            style={{ 
              background: filter === 'arrival' ? 'var(--text-accent)' : 'var(--surface-2)', 
              color: filter === 'arrival' ? '#000' : 'var(--text-primary)',
              border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)'
            }}
          >Arrivals</button>
          <button 
            onClick={() => setFilter('departure')}
            style={{ 
              background: filter === 'departure' ? 'var(--text-accent)' : 'var(--surface-2)', 
              color: filter === 'departure' ? '#000' : 'var(--text-primary)',
              border: 'none', borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)'
            }}
          >Departures</button>
        </div>
      </div>

      <div style={{ padding: '8px' }}>
        {filteredFlights.map((flight, i) => (
          <div key={flight.id} className="glass-card" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="text-md">{flight.id}</h3>
                <span className={flight.status === 'On Time' ? 'flight-status-badge status-green' : 'flight-status-badge status-yellow'} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                  {flight.status}
                </span>
              </div>
              <p className="text-xs text-secondary mt-1">
                {flight.type === 'arrival' ? `From: ${flight.from}` : `To: ${flight.to}`} • Gate {flight.gate}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-lg" style={{ fontWeight: 600 }}>{flight.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
