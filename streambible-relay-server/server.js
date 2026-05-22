const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// In-memory store for active sessions (LAN discovery)
// Format: { room_id: { host_device_id, public_ip, last_seen, is_discoverable } }
const activeSessions = new Map();

// HTTP Endpoints for Discovery/Heartbeat
app.post('/api/heartbeat', (req, res) => {
  const { room_id, host_device_id, public_ip, is_discoverable } = req.body;
  
  if (!room_id || !host_device_id || !public_ip) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  activeSessions.set(room_id, {
    room_id,
    host_device_id,
    public_ip,
    last_seen: Date.now(),
    is_discoverable: !!is_discoverable
  });

  res.json({ success: true });
});

app.get('/api/discovery', (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: 'Missing IP' });

  const now = Date.now();
  const nearby = [];

  for (const [roomId, session] of activeSessions.entries()) {
    // Evict stale sessions (older than 30 seconds)
    if (now - session.last_seen > 30000) {
      activeSessions.delete(roomId);
      continue;
    }

    if (session.public_ip === ip && session.is_discoverable) {
      nearby.push({
        room_id: session.room_id,
        host_device_id: session.host_device_id,
        public_ip: session.public_ip,
        last_seen: new Date(session.last_seen).toISOString(),
        is_discoverable: session.is_discoverable
      });
    }
  }

  res.json(nearby);
});

// Clean up stale sessions periodically (every 1 minute)
setInterval(() => {
  const now = Date.now();
  for (const [roomId, session] of activeSessions.entries()) {
    if (now - session.last_seen > 60000) {
      activeSessions.delete(roomId);
    }
  }
}, 60000);

// Basic health check
app.get('/health', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
  console.log(`StreamBible Relay Server running on port ${PORT}`);
});

// WebSocket Server for Realtime Fallback Syncing
const wss = new WebSocketServer({ server });

// Room management: Map<roomId, Set<WebSocket>>
const rooms = new Map();

wss.on('connection', (ws, req) => {
  let currentRoom = null;

  ws.on('message', (messageAsString) => {
    try {
      const data = JSON.parse(messageAsString);

      if (data.type === 'JOIN_ROOM') {
        const { roomId } = data;
        if (!roomId) return;
        
        currentRoom = roomId;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(ws);
        return;
      }

      if (data.type === 'broadcast') {
        if (!currentRoom || !rooms.has(currentRoom)) return;
        
        // Broadcast the message to everyone in the room except the sender
        const messageToBroadcast = JSON.stringify(data);
        rooms.get(currentRoom).forEach(client => {
          if (client !== ws && client.readyState === 1 /* OPEN */) {
            client.send(messageToBroadcast);
          }
        });
      }
    } catch (e) {
      console.error('Invalid message format', e);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});
