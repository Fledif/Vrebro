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
    const textInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 700);

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
      <div className="ember-container">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="ember" />
        ))}
      </div>
      
      <div className="loading-screen-content">
        <div className="loading-logo-block">
          <div className="loading-logo-v">В</div>
          <div className="loading-logo-rebro">
            <span className="loading-logo-re">Ре</span>
            <span className="loading-logo-bro">БРО</span>
          </div>
        </div>
        
        <div className="loading-text-container">
          <div key={messageIndex} className="loading-text loading-text-animate">
             {LOADING_MESSAGES[messageIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
