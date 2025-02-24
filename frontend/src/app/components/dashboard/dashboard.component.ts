import { Component, OnInit } from '@angular/core';
import { SocialService } from '../../services/social.service';
import { TestModeService } from '../../services/test-mode.service';
import { AnalyticsSummary, SocialMetric } from '../../models/social-metric.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="text-muted">Resumen de métricas de redes sociales</p>
        </div>
        <div *ngIf="testMode" class="test-mode-badge">
          <span class="badge bg-warning text-dark">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Modo Prueba Activo
          </span>
        </div>
      </div>
    </div>

    <div class="alert alert-info mb-4" *ngIf="testMode">
      <i class="bi bi-info-circle-fill me-2"></i>
      Estás viendo datos de prueba generados automáticamente. Estos datos no son reales.
    </div>

    <div class="row" *ngIf="summary">
      <!-- Tarjetas de resumen -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="bi bi-people-fill platform-icon"></i>
            <h3 class="metric-value">{{ summary.totalFollowers | number }}</h3>
            <p class="metric-label">Seguidores totales</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="bi bi-hand-thumbs-up-fill platform-icon"></i>
            <h3 class="metric-value">{{ summary.totalEngagement | number }}</h3>
            <p class="metric-label">Engagement total</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="bi bi-graph-up platform-icon"></i>
            <h3 class="metric-value">{{ getAverageEngagementRate() | percent:'1.1-2' }}</h3>
            <p class="metric-label">Tasa de engagement promedio</p>
          </div>
        </div>
      </div>
      
      <!-- Tarjetas por plataforma -->
      <div class="col-12 mb-4">
        <h2 class="h4 mb-3">Métricas por plataforma</h2>
        <div class="row">
          <div class="col-md-4 col-lg-3 mb-4" *ngFor="let platform of getPlatforms()">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi" [ngClass]="getPlatformIcon(platform)" [class]="getPlatformColor(platform)"></i>
                <h4 class="h5 mt-2 mb-3">{{ platform | titlecase }}</h4>
                <div class="d-flex justify-content-between mb-2">
                  <span class="metric-label">Seguidores:</span>
                  <span class="fw-bold">{{ summary.platformStats[platform]?.followers | number }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="metric-label">Engagement:</span>
                  <span class="fw-bold">{{ summary.platformStats[platform]?.engagement | number }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="metric-label">Publicaciones:</span>
                  <span class="fw-bold">{{ summary.platformStats[platform]?.posts | number }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Métricas recientes -->
      <div class="col-12">
        <h2 class="h4 mb-3">Métricas recientes</h2>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Plataforma</th>
                <th>Seguidores</th>
                <th>Engagement</th>
                <th>Publicaciones</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let metric of summary.recentMetrics">
                <td>
                  <i class="bi me-2" [ngClass]="getPlatformIcon(metric.platform)" [class]="getPlatformColor(metric.platform)"></i>
                  {{ metric.platform | titlecase }}
                </td>
                <td>{{ metric.followers | number }}</td>
                <td>{{ metric.engagement | number }}</td>
                <td>{{ metric.posts | number }}</td>
                <td>{{ metric.timestamp.toDate() | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="text-center p-5" *ngIf="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando datos...</p>
    </div>

    <div class="alert alert-info" *ngIf="!loading && !summary">
      <p>No hay datos disponibles. Comienza agregando métricas de redes sociales.</p>
      <a routerLink="/metrics/new" class="btn btn-primary">Agregar métricas</a>
    </div>
  `,
  styles: [`
    .test-mode-badge {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
      100% {
        opacity: 1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: AnalyticsSummary | null = null;
  loading = true;
  testMode = false;

  constructor(
    private socialService: SocialService,
    private testModeService: TestModeService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
      this.loadSummary();
    });
  }

  loadSummary(): void {
    this.loading = true;
    this.socialService.getAnalyticsSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el resumen:', error);
        this.loading = false;
      }
    });
  }

  getPlatforms(): string[] {
    if (!this.summary || !this.summary.platformStats) return [];
    return Object.keys(this.summary.platformStats);
  }

  getPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      facebook: 'bi-facebook',
      twitter: 'bi-twitter',
      instagram: 'bi-instagram',
      linkedin: 'bi-linkedin',
      youtube: 'bi-youtube',
      tiktok: 'bi-tiktok',
      pinterest: 'bi-pinterest'
    };
    return icons[platform.toLowerCase()] || 'bi-question-circle';
  }

  getPlatformColor(platform: string): string {
    return `${platform.toLowerCase()}-color`;
  }

  getAverageEngagementRate(): number {
    if (!this.summary || this.summary.totalFollowers === 0) return 0;
    return this.summary.totalEngagement / this.summary.totalFollowers;
  }
} 