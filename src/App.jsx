import React from 'react';
import './App.css';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="App">
      <div className="brand-header">
        <div className="brand-name">Your brand</div>
        <div className="brand-options">
          <div className="option">Hafnia</div>
          <div className="option">Cibinse</div>
          <div className="option">Seeheat</div>
        </div>
        <button className="get-started-btn">Get started</button>
      </div>
      <main>
        <ChatBot />
      </main>
    </div>
  );
}

export default App;
