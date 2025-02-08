const WebSocket = require('ws');

// Replace with your WebSocket server's URL
const ws = new WebSocket('ws://localhost:6969');

ws.on('open', () => {
  console.log('Connected to the WebSocket server');
  
  // Send a test message to the server
});

ws.on('message', (data) => {
  console.log('Received from server:', data);
  
  // Close the connection after receiving the message
});

ws.on('close', () => {
  console.log('Disconnected from the WebSocket server');
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});
