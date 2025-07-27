require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// === SOCKET.IO ===
io.on('connection', (socket) => {
  console.log(`🟢 Utilisateur connecté via WebSocket: ${socket.id}`);

  socket.on('join', (userId, role) => {
    socket.join(`user_${userId}`);
    console.log(`➡️ Socket ${socket.id} rejoint le salon user_${userId}`);

    if (role === 'gardien') {
      socket.join('role_gardien');
      console.log(`➡️ Socket ${socket.id} rejoint la room role_gardien`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Déconnexion du socket ${socket.id}`);
  });
});

app.set('io', io);

// === ROUTES ===
const authenticateToken = require('./src/middlewares/authMiddleware');
const authRoutes = require('./src/routes/authroutes');
const demandeRoutes = require('./src/routes/demandesortieroutes');
const notificationsRoutes = require('./src/routes/notificationsroutes');

app.use('/auth', authRoutes);
app.use('/demandesortie', authenticateToken, demandeRoutes);
app.use('/notifications', authenticateToken, notificationsRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API Sartex avec WebSocket !');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en cours sur le port ${PORT}`);
});



