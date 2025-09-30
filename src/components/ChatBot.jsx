import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';
import MessageItem from './MessageItem';
import webSocketService from '../services/WebSocketService';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false); // Default to not connected
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);
  
  // WebSocket configuration - update this URL with your backend WebSocket endpoint
  const WEBSOCKET_URL = 'ws://localhost:8000/ws/chat';
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const connectWebSocket = () => {
    setIsConnecting(true);
    webSocketService
      .connect(WEBSOCKET_URL)
      .on('open', () => {
        setIsConnected(true);
        setIsConnecting(false);
      })
      .on('message', handleIncomingMessage)
      .on('close', () => {
        setIsConnected(false);
        setIsConnecting(false);
      })
      .on('error', () => {
        setIsConnecting(false);
      });
  };

  const disconnectWebSocket = () => {
    webSocketService.disconnect();
    setIsConnected(false);
  };
  
  const handleIncomingMessage = (data) => {
    setIsLoading(false);
    
    // Handle different message formats from the backend
    let messageText;
    if (typeof data === 'string') {
      messageText = data;
    } else if (data.text) {
      // Extract the text field from the backend response
      messageText = data.text;
    } else if (data.message) {
      messageText = data.message;
    } else if (data.response) {
      messageText = data.response;
    } else {
      messageText = JSON.stringify(data);
    }
    
    setMessages(prev => [...prev, {
      id: data.id || Date.now(), // Use the id from backend if available
      text: messageText,
      sender: data.sender || 'bot' // Use the sender from backend if available
    }]);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !isConnected) return;
    
    // Add user message to chat
    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send message via WebSocket
    webSocketService.sendMessage(JSON.stringify({
      message: inputMessage
    }));
    
    // Clear input and set loading state
    setInputMessage('');
    setIsLoading(true);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="phone-container">
      <div className="phone-frame">
        <div className="phone-notch">
          <div className="notch-dots">
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="connection-status-bar">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          {!isConnected ? (
            <button 
              className="connect-button"
              onClick={connectWebSocket} 
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect to Chat'}
            </button>
          ) : (
            <button 
              className="disconnect-button"
              onClick={disconnectWebSocket}
            >
              Disconnect
            </button>
          )}
        </div>
        
        <div className="chatbot-messages">
          {messages.map(message => (
            <MessageItem key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="message-item bot">
              <div className="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="message-input-container">
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message"
              disabled={!isConnected || isLoading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!isConnected || !inputMessage.trim() || isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;