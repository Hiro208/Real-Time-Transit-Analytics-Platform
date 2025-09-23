const express = require('express');
const VehicleController = require('../controllers/vehicleController');

const router = express.Router();

// GET /api/vehicles
router.get('/', VehicleController.getVehicles);

module.exports = router;