import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { 
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hens';

// CORS - Allow All
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: '*',
  credentials: false,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Allow All Origins Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Devices Routes
app.get('/api/devices', (req: Request, res: Response) => {
  res.json([
    { 
      id: 1, 
      name: 'Lampu Ruang Tamu', 
      status: true, 
      type: 'light', 
      room: 'Ruang Tamu',
      power: 10
    },
    { 
      id: 2, 
      name: 'AC Kamar Tidur', 
      status: true, 
      type: 'ac', 
      room: 'Kamar Tidur',
      power: 950
    },
    {
      id: 3,
      name: 'Mesin Cuci',
      status: false,
      type: 'washing_machine',
      room: 'Dapur',
      power: 0
    },
    {
      id: 4,
      name: 'Kulkas',
      status: true,
      type: 'fridge',
      room: 'Dapur',
      power: 150
    }
  ]);
});

app.get('/api/devices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ 
    id, 
    name: `Device ${id}`, 
    status: true, 
    type: 'device',
    room: 'Room 1'
  });
});

app.post('/api/devices', (req: Request, res: Response) => {
  res.json({ 
    id: Math.random(), 
    ...req.body,
    createdAt: new Date().toISOString()
  });
});

app.put('/api/devices/:id', (req: Request, res: Response) => {
  res.json({ 
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/devices/:id', (req: Request, res: Response) => {
  res.json({ 
    message: `Device ${req.params.id} deleted successfully`,
    deletedAt: new Date().toISOString()
  });
});

// Authentication Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json({ 
    token: 'mock-jwt-token-' + Date.now(), 
    user: { 
      id: 1, 
      name: 'User', 
      email: email || 'user@example.com'
    },
    expiresIn: '7d'
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  res.json({ 
    token: 'mock-jwt-token-' + Date.now(), 
    user: { 
      id: Math.random(), 
      name: name || 'New User', 
      email: email || 'newuser@example.com'
    },
    message: 'Registration successful'
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

// Analytics Routes
app.get('/api/analytics', (req: Request, res: Response) => {
  res.json({
    totalDevices: 4,
    activeDevices: 3,
    totalPower: 1110,
    energyUsedToday: 2500,
    energyUsedMonth: 75000,
    costPerKwh: 1500
  });
});

app.get('/api/analytics/energy', (req: Request, res: Response) => {
  res.json([
    { time: '00:00', usage: 200 },
    { time: '06:00', usage: 500 },
    { time: '12:00', usage: 1200 },
    { time: '18:00', usage: 1500 },
    { time: '24:00', usage: 300 }
  ]);
});

// Automation Routes
app.get('/api/automations', (req: Request, res: Response) => {
  res.json([
    {
      id: 1,
      name: 'Automasi Pagi',
      trigger: '06:00',
      action: 'Nyalakan lampu & AC',
      isActive: true
    },
    {
      id: 2,
      name: 'Automasi Malam',
      trigger: '21:00',
      action: 'Matikan semua lampu',
      isActive: true
    }
  ]);
});

app.post('/api/automations', (req: Request, res: Response) => {
  res.json({ 
    id: Math.random(), 
    ...req.body,
    createdAt: new Date().toISOString()
  });
});

// Settings Routes
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    theme: 'light',
    notifications: true,
    language: 'id',
    timezone: 'Asia/Jakarta'
  });
});

app.put('/api/settings', (req: Request, res: Response) => {
  res.json({
    ...req.body,
    updatedAt: new Date().toISOString(),
    message: 'Settings updated successfully'
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  
  socket.emit('connection', { message: 'Connected to WebSocket server' });
  
  socket.on('device:toggle', (data) => {
    console.log('Device toggle:', data);
    io.emit('device:updated', { ...data, timestamp: new Date().toISOString() });
  });

  socket.on('device:update', (data) => {
    console.log('Device update:', data);
    io.emit('device:updated', { ...data, timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket enabled on ws://localhost:${PORT}`);
  console.log(`🌐 CORS: Allow All Origins`);
});
