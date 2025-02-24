/**
 * Modelo de datos para métricas de redes sociales
 * 
 * Este archivo define la estructura esperada de los datos
 * y proporciona funciones de validación.
 */

class SocialMetric {
  constructor(data) {
    this.platform = data.platform;
    this.followers = data.followers || 0;
    this.engagement = data.engagement || 0;
    this.posts = data.posts || 0;
    this.likes = data.likes || 0;
    this.comments = data.comments || 0;
    this.shares = data.shares || 0;
    this.views = data.views || 0;
    this.timestamp = data.timestamp || new Date();
    this.metadata = data.metadata || {};
  }

  static validate(data) {
    // Verificar campos obligatorios
    if (!data.platform) {
      return { isValid: false, error: 'El campo "platform" es obligatorio' };
    }

    // Verificar que los valores numéricos sean válidos
    const numericFields = ['followers', 'engagement', 'posts', 'likes', 'comments', 'shares', 'views'];
    for (const field of numericFields) {
      if (data[field] !== undefined && (isNaN(data[field]) || data[field] < 0)) {
        return { isValid: false, error: `El campo "${field}" debe ser un número positivo` };
      }
    }

    // Verificar plataformas válidas
    const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'];
    if (!validPlatforms.includes(data.platform.toLowerCase())) {
      return { 
        isValid: false, 
        error: `Plataforma "${data.platform}" no reconocida. Plataformas válidas: ${validPlatforms.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return new SocialMetric(data);
  }

  toFirestore() {
    return {
      platform: this.platform,
      followers: this.followers,
      engagement: this.engagement,
      posts: this.posts,
      likes: this.likes,
      comments: this.comments,
      shares: this.shares,
      views: this.views,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
}

module.exports = SocialMetric; 