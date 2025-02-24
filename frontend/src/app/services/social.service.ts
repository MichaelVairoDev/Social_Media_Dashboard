import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  SocialMetric, 
  AnalyticsSummary, 
  PlatformComparison, 
  PredictionData 
} from '../models/social-metric.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private apiUrl = environment.apiUrl;
  private _testMode = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Getter y setter para el modo de prueba
  get testMode(): boolean {
    return this._testMode;
  }

  set testMode(value: boolean) {
    this._testMode = value;
  }

  // Obtener todas las métricas
  getAllMetrics(): Observable<SocialMetric[]> {
    if (this._testMode) {
      return of(this.generateTestMetrics());
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    
    return this.http.get<SocialMetric[]>(`${this.apiUrl}/social?userId=${userId}`);
  }

  // Obtener métricas por plataforma
  getMetricsByPlatform(platform: string): Observable<SocialMetric[]> {
    if (this._testMode) {
      return of(this.generateTestMetrics().filter(metric => metric.platform === platform));
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    
    return this.http.get<SocialMetric[]>(`${this.apiUrl}/social/${platform}?userId=${userId}`);
  }

  // Crear nuevas métricas
  createMetrics(metrics: SocialMetric): Observable<SocialMetric> {
    if (this._testMode) {
      return of({...metrics, id: 'test-id-' + Date.now()});
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of({...metrics, id: 'error-no-user'});
    }
    
    // Añadir el ID del usuario a las métricas
    const metricsWithUserId = {
      ...metrics,
      userId
    };
    
    return this.http.post<SocialMetric>(`${this.apiUrl}/social`, metricsWithUserId);
  }

  // Actualizar métricas
  updateMetrics(id: string, metrics: Partial<SocialMetric>): Observable<SocialMetric> {
    if (this._testMode) {
      return of({...metrics, id} as SocialMetric);
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of({...metrics, id} as SocialMetric);
    }
    
    // Añadir el ID del usuario a las métricas
    const metricsWithUserId = {
      ...metrics,
      userId
    };
    
    return this.http.put<SocialMetric>(`${this.apiUrl}/social/${id}`, metricsWithUserId);
  }

  // Eliminar métricas
  deleteMetrics(id: string): Observable<any> {
    if (this._testMode) {
      return of({success: true});
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of({success: false, error: 'No user authenticated'});
    }
    
    return this.http.delete(`${this.apiUrl}/social/${id}?userId=${userId}`);
  }

  // Obtener resumen de analíticas
  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    if (this._testMode) {
      return of(this.generateTestSummary());
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of({
        totalFollowers: 0,
        totalEngagement: 0,
        platformStats: {},
        recentMetrics: []
      });
    }
    
    return this.http.get<AnalyticsSummary>(`${this.apiUrl}/analytics/summary?userId=${userId}`);
  }

  // Obtener datos por período
  getAnalyticsByTimeframe(timeframe: string): Observable<SocialMetric[]> {
    if (this._testMode) {
      return of(this.generateTestMetricsByTimeframe(timeframe));
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    
    return this.http.get<SocialMetric[]>(`${this.apiUrl}/analytics/period/${timeframe}?userId=${userId}`);
  }

  // Obtener comparativa entre plataformas
  comparePlatforms(platforms?: string[]): Observable<PlatformComparison> {
    if (this._testMode) {
      return of(this.generateTestComparison(platforms));
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of({});
    }
    
    let url = `${this.apiUrl}/analytics/compare?userId=${userId}`;
    if (platforms && platforms.length > 0) {
      url += `&platforms=${platforms.join(',')}`;
    }
    
    return this.http.get<PlatformComparison>(url);
  }

  // Obtener tendencias
  getTrends(): Observable<any> {
    if (this._testMode) {
      return of(this.generateTestTrends());
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    
    return this.http.get(`${this.apiUrl}/analytics/trends?userId=${userId}`);
  }

  // Obtener predicciones
  getPredictions(): Observable<PredictionData> {
    if (this._testMode) {
      return of(this.generateTestPredictions());
    }
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return of({});
    }
    
    return this.http.get<PredictionData>(`${this.apiUrl}/analytics/predictions?userId=${userId}`);
  }

  // Métodos privados para generar datos de prueba
  private generateTestMetrics(): SocialMetric[] {
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'];
    const metrics: SocialMetric[] = [];
    
    // Generar datos para los últimos 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      platforms.forEach(platform => {
        const baseFollowers = this.getBaseFollowersForPlatform(platform);
        const baseEngagement = this.getBaseEngagementForPlatform(platform);
        const basePosts = this.getBasePostsForPlatform(platform);
        
        // Añadir algo de variación aleatoria
        const randomFactor = 0.95 + Math.random() * 0.1; // Entre 0.95 y 1.05
        
        metrics.push({
          id: `${platform}-${i}`,
          platform,
          followers: Math.round(baseFollowers * (1 - i * 0.01) * randomFactor),
          engagement: Math.round(baseEngagement * (1 - i * 0.015) * randomFactor),
          posts: Math.round(basePosts * (1 - i * 0.02) * randomFactor),
          likes: Math.round(baseEngagement * 0.6 * randomFactor),
          comments: Math.round(baseEngagement * 0.2 * randomFactor),
          shares: Math.round(baseEngagement * 0.2 * randomFactor),
          views: Math.round(baseEngagement * 3 * randomFactor),
          timestamp: {
            toDate: () => date
          },
          userId: this.authService.getCurrentUserId() || 'test-user'
        });
      });
    }
    
    return metrics;
  }

  private generateTestMetricsByTimeframe(timeframe: string): SocialMetric[] {
    const metrics = this.generateTestMetrics();
    let daysToInclude = 7;
    
    switch(timeframe) {
      case 'day':
        daysToInclude = 1;
        break;
      case 'week':
        daysToInclude = 7;
        break;
      case 'month':
        daysToInclude = 30;
        break;
      case 'year':
        daysToInclude = 30; // Simulamos solo 30 días para el ejemplo
        break;
    }
    
    // Filtrar por fecha
    return metrics.filter((_, index) => index < daysToInclude * 7); // 7 plataformas por día
  }

  private generateTestSummary(): AnalyticsSummary {
    const metrics = this.generateTestMetrics();
    const recentMetrics = metrics.slice(0, 20);
    
    const platformStats: {[key: string]: {followers: number, engagement: number, posts: number}} = {};
    let totalFollowers = 0;
    let totalEngagement = 0;
    
    // Agrupar por plataforma
    metrics.forEach(metric => {
      if (!platformStats[metric.platform]) {
        platformStats[metric.platform] = {
          followers: 0,
          engagement: 0,
          posts: 0
        };
      }
      
      // Solo sumamos los valores más recientes (primer día)
      if (metrics.findIndex(m => m.id === metric.id) < 7) {
        platformStats[metric.platform].followers = metric.followers;
        platformStats[metric.platform].engagement = metric.engagement;
        platformStats[metric.platform].posts = metric.posts;
        
        totalFollowers += metric.followers;
        totalEngagement += metric.engagement;
      }
    });
    
    return {
      totalFollowers,
      totalEngagement,
      platformStats,
      recentMetrics
    };
  }

  private generateTestComparison(platforms?: string[]): PlatformComparison {
    const metrics = this.generateTestMetrics();
    const comparison: PlatformComparison = {};
    
    const platformsToInclude = platforms || ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'];
    
    platformsToInclude.forEach(platform => {
      const platformMetrics = metrics.filter(m => m.platform === platform);
      
      comparison[platform] = {
        followers: platformMetrics.map(m => m.followers),
        engagement: platformMetrics.map(m => m.engagement),
        posts: platformMetrics.map(m => m.posts),
        timestamps: platformMetrics.map(m => m.timestamp)
      };
    });
    
    return comparison;
  }

  private generateTestTrends(): any {
    const trends = [];
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'];
    
    // Generar tendencias para 4 semanas
    for (let week = 0; week < 4; week++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (week + 1) * 7);
      
      const weekData: any = {
        week: week + 1,
        startDate,
        platforms: {}
      };
      
      platforms.forEach(platform => {
        const baseFollowers = this.getBaseFollowersForPlatform(platform);
        const baseEngagement = this.getBaseEngagementForPlatform(platform);
        const basePosts = this.getBasePostsForPlatform(platform);
        
        // Añadir tendencia creciente
        const growthFactor = 1 + (3 - week) * 0.05;
        
        weekData.platforms[platform] = {
          followers: Math.round(baseFollowers * growthFactor),
          engagement: Math.round(baseEngagement * growthFactor),
          posts: Math.round(basePosts * growthFactor)
        };
      });
      
      trends.push(weekData);
    }
    
    return trends;
  }

  private generateTestPredictions(): PredictionData {
    const predictions: PredictionData = {};
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'];
    
    platforms.forEach(platform => {
      const baseFollowers = this.getBaseFollowersForPlatform(platform);
      const baseEngagement = this.getBaseEngagementForPlatform(platform);
      
      // Crear datos actuales y anteriores
      const currentDate = new Date();
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - 7);
      
      // Simular crecimiento
      const growthRate = 1.05 + Math.random() * 0.1; // Entre 1.05 y 1.15
      
      const current = {
        id: `${platform}-current`,
        platform,
        followers: baseFollowers,
        engagement: baseEngagement,
        posts: this.getBasePostsForPlatform(platform),
        timestamp: {
          toDate: () => currentDate
        }
      };
      
      const previous = {
        id: `${platform}-previous`,
        platform,
        followers: Math.round(baseFollowers / growthRate),
        engagement: Math.round(baseEngagement / growthRate),
        posts: Math.round(this.getBasePostsForPlatform(platform) / growthRate),
        timestamp: {
          toDate: () => previousDate
        }
      };
      
      predictions[platform] = {
        estimatedFollowers: Math.round(current.followers * growthRate),
        estimatedEngagement: Math.round(current.engagement * growthRate),
        basedOn: {
          current,
          previous
        }
      };
    });
    
    return predictions;
  }

  private getBaseFollowersForPlatform(platform: string): number {
    const baseCounts: {[key: string]: number} = {
      facebook: 50000,
      twitter: 35000,
      instagram: 80000,
      linkedin: 25000,
      youtube: 45000,
      tiktok: 100000,
      pinterest: 30000
    };
    
    return baseCounts[platform] || 10000;
  }

  private getBaseEngagementForPlatform(platform: string): number {
    const baseCounts: {[key: string]: number} = {
      facebook: 5000,
      twitter: 8000,
      instagram: 15000,
      linkedin: 3000,
      youtube: 12000,
      tiktok: 25000,
      pinterest: 7000
    };
    
    return baseCounts[platform] || 5000;
  }

  private getBasePostsForPlatform(platform: string): number {
    const baseCounts: {[key: string]: number} = {
      facebook: 30,
      twitter: 80,
      instagram: 45,
      linkedin: 20,
      youtube: 15,
      tiktok: 60,
      pinterest: 40
    };
    
    return baseCounts[platform] || 20;
  }
} 