import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LOADING_MESSAGES = [
  "🔥 Розпалюємо мангал...",
  "🥩 Готуємо свіже м'ясо...",
  "🍖 Майже готово..."
];

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // 700ms interval for changing text
    const textInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 700);

    // Simulate completion after enough time to see all messages
    const loadTimeout = setTimeout(() => {
      setLoading(false);
    }, 2800);

    return () => {
      clearInterval(textInterval);
      clearTimeout(loadTimeout);
    };
  }, []);

  return (
    <div className={`loading-screen-overlay ${!loading ? 'loading-screen-hidden' : ''}`}>
      {/* Ember particles */}
      <div className="ember-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="ember" />
        ))}
      </div>
      
      <div className="loading-screen-content">
        <h1 className="loading-logo">
          В
          <span>Ребро</span>
        </h1>
        
        <div className="loading-text-container">
          <div key={messageIndex} className="loading-text loading-text-animate">
             {LOADING_MESSAGES[messageIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
