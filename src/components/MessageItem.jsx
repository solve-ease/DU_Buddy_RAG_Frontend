import React from 'react';
import './MessageItem.css';

const MessageItem = ({ message }) => {
  const { text, sender } = message;

  // Format message text to handle potential HTML content
  const formatMessage = (text) => {
    // If you want to allow HTML content, use dangerouslySetInnerHTML
    // For now, we'll just handle basic formatting
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className={`message-item ${sender}`}>
      <div className="message-bubble">
        {formatMessage(text)}
      </div>
    </div>
  );
};

export default MessageItem;