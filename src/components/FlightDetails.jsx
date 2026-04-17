import React, { useState, useEffect } from 'react';
import { fetchFlight, fetchTravelTime, fetchSecurityWaitTimes, updateLocation } from '../api';
import { CONFIG } from '../config';

export default function FlightDetails({ flightNumber, hotelId, hotelData, onBack }) {
  const [flightData, setFlightData] = useState(null);
  const [flightError, setFlightError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [travelTime, setTravelTime] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Editing state
  const [isEditingShuttle, setIsEditingShuttle] = useState(false);
  const [shuttleValue, setShuttleValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      
      try {
        // 1. Fetch flight
        const flightRes = await fetchFlight(flightNumber);
        if (flightRes.success) {
          setFlightData(flightRes.data);
        } else {
          setFlightError(flightRes.error || 'Flight not found.');
        }

        // 2. Fetch Travel Time
        if (hotelData) {
          const hotelCoords = hotelData;
          const atlCoords = CONFIG.ATL_AIRPORT;
          const timeData = await fetchTravelTime(
            hotelCoords.lat, hotelCoords.lng,
            atlCoords.lat, atlCoords.lng
          );
          if (timeData && timeData.success) {
            setTravelTime(timeData.data);
          } else {
            // Fallback estimation
            setTravelTime({ durationText: Math.round(hotelCoords.distanceMiles * 5) + ' mins (Estimated)' });
          }
        }

        // 3. Fetch Security Wait Times
        const secData = await fetchSecurityWaitTimes();
        if (secData && secData.success) {
          setSecurityData(secData.data);
        }

      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [flightNumber, hotelId, hotelData]);

  useEffect(() => {
    if (hotelData?.shuttle) {
      setShuttleValue(hotelData.shuttle);
    }
  }, [hotelData]);

  const handleSaveShuttle = async () => {
    setIsSaving(true);
    try {
      const res = await updateLocation(hotelId, {
        ...hotelData,
        shuttle: shuttleValue
      });
      if (res.success) {
        setIsEditingShuttle(false);
        // Note: In a real app, we might want to trigger a data refresh in the parent 'App.jsx'
        // For this demo, we'll assume the local state update is sufficient or the user will reload.
        window.location.reload(); // Quickest way to sync the updated JSON from backend
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader-dots"><div></div><div></div><div></div></div>
        <p className="mt-4 text-sm text-secondary">Locating flight {flightNumber}...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '8px' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Search
      </button>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Time is: </span>
          <span style={{ color: 'var(--text-accent)' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
        {flightData && flightData.flight_date && (
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Date: </span>
            <span style={{ color: 'var(--text-accent)' }}>{new Date(flightData.flight_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {flightError ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--status-yellow)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', opacity: 0.8 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="text-lg mb-2">Flight Not Found</h2>
          <p className="text-sm">{flightError}</p>
          <button className="btn-primary mt-6" onClick={onBack}>Try another flight</button>
        </div>
      ) : flightData && (
        <>
          {/* Flight Summary Card */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h2 className="text-xl">{flightData.flight?.iata || flightNumber}</h2>
                <p className="text-sm text-secondary">{flightData.airline?.name}</p>
              </div>
              <span className={`flight-status-badge ${flightData.flight_status === 'active' || flightData.flight_status === 'scheduled' ? 'status-green' : 'status-yellow'}`} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                {flightData.flight_status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="text-xs text-secondary">Departure</p>
                <p className="text-lg font-bold">{flightData.departure?.iata}</p>
                <p className="text-sm">{new Date(flightData.departure?.estimated || flightData.departure?.scheduled).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-xs text-secondary" style={{ marginTop: '2px' }}>{new Date(flightData.departure?.estimated || flightData.departure?.scheduled).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)', marginBottom: '8px' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" opacity="0"></path>
                  <path d="M12 2v20M12 2l4 4M12 2L8 6"></path>
                </svg>
                <hr style={{ width: '100%', borderColor: 'rgba(56, 189, 248, 0.2)', margin: 0 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-xs text-secondary">Arrival</p>
                <p className="text-lg font-bold">{flightData.arrival?.iata}</p>
                <p className="text-sm">{new Date(flightData.arrival?.estimated || flightData.arrival?.scheduled).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-xs text-secondary" style={{ marginTop: '2px' }}>{new Date(flightData.arrival?.estimated || flightData.arrival?.scheduled).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {flightData.arrival?.iata === 'ATL' && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--surface-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p className="text-xs text-secondary">Terminal</p>
                  <p className="text-md">{flightData.arrival?.terminal || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary">Gate</p>
                  <p className="text-md">{flightData.arrival?.gate || 'TBD'}</p>
                </div>
              </div>
            )}
             {flightData.departure?.iata === 'ATL' && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--surface-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p className="text-xs text-secondary">Terminal</p>
                  <p className="text-md">{flightData.departure?.terminal || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary">Gate</p>
                  <p className="text-md">{flightData.departure?.gate || 'TBD'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Transportation / Commute Card */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px', background: 'rgba(56, 189, 248, 0.05)' }}>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M19 11V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"></path>
                    <circle cx="7" cy="16" r="1.5"></circle>
                    <circle cx="17" cy="16" r="1.5"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="text-md" style={{ marginBottom: '4px' }}>Drive to Hartsfield-Jackson</h3>
                  <p className="text-xs text-secondary">
                    From {hotelData?.name || 'Hotel'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {travelTime ? travelTime.durationText : 'Loading live traffic...'}
                    </p>
                    {hotelData?.shuttle && !isEditingShuttle ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-accent)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="12 2 12 12 16 14"></polyline>
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                          Shuttle: {hotelData.shuttle}
                        </p>
                        <button 
                          onClick={() => setIsEditingShuttle(true)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          title="Edit shuttle schedule"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    ) : isEditingShuttle ? (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <input 
                          className="input-field"
                          style={{ fontSize: '0.75rem', padding: '4px 8px', height: 'auto', flex: 1 }}
                          value={shuttleValue}
                          onChange={(e) => setShuttleValue(e.target.value)}
                          autoFocus
                        />
                        <button 
                          className="btn-primary" 
                          style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                          onClick={handleSaveShuttle}
                          disabled={isSaving}
                        >
                          {isSaving ? '...' : 'Save'}
                        </button>
                        <button 
                          style={{ background: 'none', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.7rem', padding: '4px 10px' }}
                          onClick={() => {
                            setIsEditingShuttle(false);
                            setShuttleValue(hotelData.shuttle);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
             </div>
          </div>

          {/* Security Wait Times Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 className="text-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              ATL Security Wait Times
            </h3>
            
            {!securityData ? (
              <p className="text-sm text-secondary">Fetching live TSA wait times...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div style={{ background: 'var(--surface-border)', padding: '12px', borderRadius: '8px' }}>
                  <p className="text-xs text-secondary">North Checkpoint</p>
                  <p className="text-md font-bold">{securityData.north}</p>
                </div>
                <div style={{ background: 'var(--surface-border)', padding: '12px', borderRadius: '8px' }}>
                  <p className="text-xs text-secondary">South Checkpoint</p>
                  <p className="text-md font-bold">{securityData.south}</p>
                </div>
                 <div style={{ background: 'var(--surface-border)', padding: '12px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                  <p className="text-xs text-secondary">Main Checkpoint</p>
                  <p className="text-md font-bold">{securityData.main}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
