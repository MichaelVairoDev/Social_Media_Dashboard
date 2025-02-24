const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Obtener resumen de analíticas
router.get('/summary', analyticsController.getSummary);

// Obtener datos por período
router.get('/period/:timeframe', analyticsController.getByTimeframe);

// Obtener comparativa entre plataformas
router.get('/compare', analyticsController.comparePlatforms);

// Obtener tendencias
router.get('/trends', analyticsController.getTrends);

// Obtener predicciones
router.get('/predictions', analyticsController.getPredictions);

module.exports = router; 