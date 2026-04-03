import React, { useState, useEffect, useRef } from 'react';

export default function ChatOverlay({ isOpen, onClose, hotelId }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: `Welcome to the ATL Flight Assistant! ${hotelId ? `I see you are near ${hotelId}. ` : ''}How can I help you regarding your upcoming flight, travel time to the airport, or gate information?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Mock Gemini integration for now
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: "I am a prototype of the Gemini flight tracking assistant. I don't have access to live data right now, but soon I'll be able to pull real-time travel estimates and precise gate changes for ATL flights!" 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <div className={`chat-overlay-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`chat-overlay ${isOpen ? 'open' : ''}`}>
        
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-md" style={{ margin: 0 }}>ATL Assistant</h3>
              <p className="text-xs text-accent mt-1" style={{ margin: 0 }}>Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`msg-bubble ${msg.role === 'ai' ? 'msg-ai' : 'msg-user'}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="msg-bubble msg-ai" style={{ alignSelf: 'flex-start', padding: '16px 20px' }}>
              <div className="loader-dots">
                <div></div><div></div><div></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ask about your flight..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="btn-primary" 
            style={{ padding: '0 20px', borderRadius: 'var(--radius-full)' }}
            onClick={handleSend}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

      </div>
    </>
  );
}
