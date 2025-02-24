const { admin } = require('../config/firebase');
const db = admin.firestore();
const socialCollection = db.collection('social_metrics');

// Obtener resumen de análisis
exports.getSummary = async (req, res) => {
  try {
    const snapshot = await socialCollection.orderBy('timestamp', 'desc').limit(20).get();
    
    let summary = {
      totalFollowers: 0,
      totalEngagement: 0,
      platformStats: {},
      recentMetrics: []
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      summary.recentMetrics.push({
        id: doc.id,
        ...data
      });
      
      // Acumular estadísticas por plataforma
      if (!summary.platformStats[data.platform]) {
        summary.platformStats[data.platform] = {
          followers: 0,
          engagement: 0,
          posts: 0
        };
      }
      
      summary.platformStats[data.platform].followers += data.followers || 0;
      summary.platformStats[data.platform].engagement += data.engagement || 0;
      summary.platformStats[data.platform].posts += data.posts || 0;
      
      // Totales
      summary.totalFollowers += data.followers || 0;
      summary.totalEngagement += data.engagement || 0;
    });
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen de análisis' });
  }
};

// Obtener datos por periodo
exports.getByTimeframe = async (req, res) => {
  try {
    const { timeframe } = req.params;
    let startDate = new Date();
    
    // Definir el período de tiempo
    switch(timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Por defecto, última semana
    }
    
    const snapshot = await socialCollection
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .orderBy('timestamp', 'asc')
      .get();
    
    const metrics = [];
    snapshot.forEach(doc => {
      metrics.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error(`Error al obtener métricas por período ${req.params.timeframe}:`, error);
    res.status(500).json({ error: `Error al obtener métricas por período` });
  }
};

// Comparar plataformas
exports.comparePlatforms = async (req, res) => {
  try {
    const { platforms } = req.query;
    let query = socialCollection;
    
    if (platforms) {
      const platformArray = platforms.split(',');
      query = query.where('platform', 'in', platformArray);
    }
    
    const snapshot = await query.orderBy('timestamp', 'desc').limit(100).get();
    
    const comparison = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;
      
      if (!comparison[platform]) {
        comparison[platform] = {
          followers: [],
          engagement: [],
          posts: [],
          timestamps: []
        };
      }
      
      comparison[platform].followers.push(data.followers || 0);
      comparison[platform].engagement.push(data.engagement || 0);
      comparison[platform].posts.push(data.posts || 0);
      comparison[platform].timestamps.push(data.timestamp);
    });
    
    res.status(200).json(comparison);
  } catch (error) {
    console.error('Error al comparar plataformas:', error);
    res.status(500).json({ error: 'Error al comparar plataformas' });
  }
};

// Obtener tendencias
exports.getTrends = async (req, res) => {
  try {
    // Obtener datos de las últimas 4 semanas
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const snapshot = await socialCollection
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(fourWeeksAgo))
      .orderBy('timestamp', 'asc')
      .get();
    
    const weeklyData = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate();
      const weekNumber = Math.floor((timestamp - fourWeeksAgo) / (7 * 24 * 60 * 60 * 1000));
      
      if (!weeklyData[weekNumber]) {
        weeklyData[weekNumber] = {
          platforms: {},
          startDate: new Date(fourWeeksAgo.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000)
        };
      }
      
      if (!weeklyData[weekNumber].platforms[data.platform]) {
        weeklyData[weekNumber].platforms[data.platform] = {
          followers: 0,
          engagement: 0,
          posts: 0,
          count: 0
        };
      }
      
      // Acumular datos para promedios
      weeklyData[weekNumber].platforms[data.platform].followers += data.followers || 0;
      weeklyData[weekNumber].platforms[data.platform].engagement += data.engagement || 0;
      weeklyData[weekNumber].platforms[data.platform].posts += data.posts || 0;
      weeklyData[weekNumber].platforms[data.platform].count += 1;
    });
    
    // Calcular promedios y tendencias
    const trends = Object.keys(weeklyData).map(week => {
      const weekData = weeklyData[week];
      
      // Procesar cada plataforma en la semana
      Object.keys(weekData.platforms).forEach(platform => {
        const platformData = weekData.platforms[platform];
        
        // Calcular promedios
        if (platformData.count > 0) {
          platformData.followers = Math.round(platformData.followers / platformData.count);
          platformData.engagement = Math.round(platformData.engagement / platformData.count);
          platformData.posts = Math.round(platformData.posts / platformData.count);
          delete platformData.count;
        }
      });
      
      return {
        week: parseInt(week) + 1,
        startDate: weekData.startDate,
        platforms: weekData.platforms
      };
    });
    
    res.status(200).json(trends);
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({ error: 'Error al obtener tendencias' });
  }
};

// Obtener predicciones simples basadas en tendencias recientes
exports.getPredictions = async (req, res) => {
  try {
    const recentSnapshot = await socialCollection
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const metrics = [];
    recentSnapshot.forEach(doc => {
      metrics.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Agrupar por plataforma
    const platformData = {};
    metrics.forEach(metric => {
      if (!platformData[metric.platform]) {
        platformData[metric.platform] = [];
      }
      platformData[metric.platform].push(metric);
    });
    
    // Calcular predicciones simples para cada plataforma
    const predictions = {};
    
    Object.keys(platformData).forEach(platform => {
      const data = platformData[platform].sort((a, b) => 
        a.timestamp.seconds - b.timestamp.seconds
      );
      
      if (data.length >= 2) {
        const lastPoint = data[data.length - 1];
        const secondLastPoint = data[data.length - 2];
        
        // Calcular tasas de crecimiento
        const followerGrowthRate = lastPoint.followers / secondLastPoint.followers;
        const engagementGrowthRate = lastPoint.engagement / secondLastPoint.engagement;
        
        // Predicción para el próximo período
        predictions[platform] = {
          estimatedFollowers: Math.round(lastPoint.followers * followerGrowthRate),
          estimatedEngagement: Math.round(lastPoint.engagement * engagementGrowthRate),
          basedOn: {
            current: lastPoint,
            previous: secondLastPoint
          }
        };
      }
    });
    
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error al generar predicciones:', error);
    res.status(500).json({ error: 'Error al generar predicciones' });
  }
}; 