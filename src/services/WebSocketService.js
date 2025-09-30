class WebSocketService {
  constructor() {
    this.socket = null;
    this.handlers = {
      message: [],
      open: [],
      close: [],
      error: []
    };
  }

  connect(url) {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = (event) => {
      console.log('WebSocket connection established');
      this.handlers.open.forEach(handler => handler(event));
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed');
      this.handlers.close.forEach(handler => handler(event));
    };

    this.socket.onmessage = (event) => {
      console.log('Message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.handlers.message.forEach(handler => handler(data));
      } catch (e) {
        console.error('Error parsing message:', e);
        this.handlers.message.forEach(handler => handler(event.data));
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handlers.error.forEach(handler => handler(error));
    };

    return this;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      let messageToSend;
      
      if (typeof message === 'string') {
        messageToSend = message;
      } else {
        messageToSend = JSON.stringify(message);
      }
      
      this.socket.send(messageToSend);
      return true;
    }
    return false;
  }

  on(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    }
    return this;
  }

  off(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }
    return this;
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;