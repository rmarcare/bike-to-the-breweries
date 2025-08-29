
import React, { useState } from 'react';
import './Jules.css';

interface JulesProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
}

const Jules: React.FC<JulesProps> = ({ onSendMessage, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="jules-container">
      <div className="jules-header">
        <h3>Jules</h3>
        <p>Your AI Cycling Planner</p>
      </div>
      <div className="jules-messages">
        {/* This is a placeholder. A full implementation would show chat history. */}
        <div className="message-bubble user">
          <p>e.g., "Plan me a 40-mile scenic ride with a wine stop in Sonoma"</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="jules-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell Jules what you want..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Planning...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Jules;
