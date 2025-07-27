const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authroutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes publiques
app.use('/auth', authRoutes);

// Ici ajouter les autres routes si besoin (protégées par token)

module.exports = app;



