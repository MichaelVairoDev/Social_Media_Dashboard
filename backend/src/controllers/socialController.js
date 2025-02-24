const { admin } = require('../config/firebase');
const db = admin.firestore();
const socialCollection = db.collection('social_metrics');

// Obtener todas las métricas
exports.getAllMetrics = async (req, res) => {
  try {
    const snapshot = await socialCollection.get();
    const metrics = [];
    
    snapshot.forEach(doc => {
      metrics.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
};

// Obtener métricas por plataforma
exports.getMetricsByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const snapshot = await socialCollection.where('platform', '==', platform).get();
    
    const metrics = [];
    snapshot.forEach(doc => {
      metrics.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error(`Error al obtener métricas para ${req.params.platform}:`, error);
    res.status(500).json({ error: `Error al obtener métricas para ${req.params.platform}` });
  }
};

// Crear nuevas métricas
exports.createMetrics = async (req, res) => {
  try {
    const newMetric = {
      ...req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await socialCollection.add(newMetric);
    
    res.status(201).json({
      id: docRef.id,
      ...newMetric
    });
  } catch (error) {
    console.error('Error al crear métricas:', error);
    res.status(500).json({ error: 'Error al crear métricas' });
  }
};

// Actualizar métricas
exports.updateMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await socialCollection.doc(id).update(updateData);
    
    res.status(200).json({
      id,
      ...updateData
    });
  } catch (error) {
    console.error(`Error al actualizar métricas con ID ${req.params.id}:`, error);
    res.status(500).json({ error: `Error al actualizar métricas con ID ${req.params.id}` });
  }
};

// Eliminar métricas
exports.deleteMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    
    await socialCollection.doc(id).delete();
    
    res.status(200).json({ message: `Métricas con ID ${id} eliminadas correctamente` });
  } catch (error) {
    console.error(`Error al eliminar métricas con ID ${req.params.id}:`, error);
    res.status(500).json({ error: `Error al eliminar métricas con ID ${req.params.id}` });
  }
}; 