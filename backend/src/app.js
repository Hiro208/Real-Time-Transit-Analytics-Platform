const express = require('express');
const cors = require('cors');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Routes
app.use('/api/vehicles', vehicleRoutes);

module.exports = app;