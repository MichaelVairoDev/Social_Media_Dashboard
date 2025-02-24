const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');

// Obtener métricas de todas las redes sociales
router.get('/', socialController.getAllMetrics);

// Obtener métricas por plataforma
router.get('/:platform', socialController.getMetricsByPlatform);

// Crear/actualizar datos de métricas
router.post('/', socialController.createMetrics);

// Actualizar métricas
router.put('/:id', socialController.updateMetrics);

// Eliminar métricas
router.delete('/:id', socialController.deleteMetrics);

module.exports = router; 