import { Component, OnInit } from '@angular/core';
import { SocialService } from '../../services/social.service';
import { TestModeService } from '../../services/test-mode.service';
import { PredictionData } from '../../models/social-metric.model';

@Component({
  selector: 'app-predictions',
  template: `
    <div class="dashboard-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="dashboard-title">Predicciones</h1>
        <p class="text-muted">Predicciones basadas en tendencias recientes</p>
      </div>
      <div *ngIf="testMode" class="test-mode-badge">
        <span class="badge bg-warning text-dark">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          Modo Prueba Activo
        </span>
      </div>
    </div>

    <div class="alert alert-info mb-4">
      <i class="bi bi-info-circle-fill me-2"></i>
      Las predicciones se basan en las tendencias recientes y son estimaciones aproximadas. Los resultados reales pueden variar.
      <span *ngIf="testMode"><strong>Actualmente estás viendo predicciones basadas en datos de prueba.</strong></span>
    </div>

    <div class="row">
      <div class="col-md-6 col-lg-4 mb-4" *ngFor="let platform of getPlatforms()">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi me-2" [ngClass]="getPlatformIcon(platform)" [class]="getPlatformColor(platform)"></i>
              {{ platform | titlecase }}
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <h6 class="text-muted mb-2">Seguidores estimados (próximo período)</h6>
              <div class="d-flex align-items-center">
                <h3 class="mb-0 me-2">{{ getEstimatedFollowers(platform) | number }}</h3>
                <span [class]="getGrowthClass(getFollowerGrowthRate(platform))">
                  <i class="bi" [ngClass]="getGrowthIcon(getFollowerGrowthRate(platform))"></i>
                  {{ getFollowerGrowthRate(platform) | percent:'1.1-1' }}
                </span>
              </div>
            </div>
            
            <div class="mb-4">
              <h6 class="text-muted mb-2">Engagement estimado (próximo período)</h6>
              <div class="d-flex align-items-center">
                <h3 class="mb-0 me-2">{{ getEstimatedEngagement(platform) | number }}</h3>
                <span [class]="getGrowthClass(getEngagementGrowthRate(platform))">
                  <i class="bi" [ngClass]="getGrowthIcon(getEngagementGrowthRate(platform))"></i>
                  {{ getEngagementGrowthRate(platform) | percent:'1.1-1' }}
                </span>
              </div>
            </div>
            
            <div class="mt-4">
              <h6 class="text-muted mb-2">Basado en datos de:</h6>
              <div class="small">
                <div class="mb-1">
                  <strong>Actual:</strong> {{ getCurrentTimestamp(platform) }}
                </div>
                <div>
                  <strong>Anterior:</strong> {{ getPreviousTimestamp(platform) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center p-5" *ngIf="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Calculando predicciones...</p>
    </div>

    <div class="alert alert-warning" *ngIf="!loading && (!predictions || getPlatforms().length === 0)">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      No hay suficientes datos para generar predicciones. Se necesitan al menos dos puntos de datos por plataforma.
      <div class="mt-2" *ngIf="!testMode">
        <button class="btn btn-sm btn-warning" (click)="enableTestMode()">
          Activar modo prueba para ver ejemplos
        </button>
      </div>
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
export class PredictionsComponent implements OnInit {
  predictions: PredictionData | null = null;
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
      this.loadPredictions();
    });
  }

  loadPredictions(): void {
    this.loading = true;
    this.socialService.getPredictions().subscribe({
      next: (data) => {
        this.predictions = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar predicciones:', error);
        this.loading = false;
      }
    });
  }

  enableTestMode(): void {
    this.testModeService.setTestMode(true);
  }

  getPlatforms(): string[] {
    if (!this.predictions) return [];
    return Object.keys(this.predictions);
  }

  getEstimatedFollowers(platform: string): number {
    if (!this.predictions || !this.predictions[platform]) return 0;
    return this.predictions[platform].estimatedFollowers;
  }

  getEstimatedEngagement(platform: string): number {
    if (!this.predictions || !this.predictions[platform]) return 0;
    return this.predictions[platform].estimatedEngagement;
  }

  getCurrentTimestamp(platform: string): string {
    if (!this.predictions || !this.predictions[platform] || !this.predictions[platform].basedOn.current.timestamp) {
      return 'N/A';
    }
    const timestamp = this.predictions[platform].basedOn.current.timestamp;
    return timestamp.toDate ? timestamp.toDate().toLocaleDateString() : new Date(timestamp).toLocaleDateString();
  }

  getPreviousTimestamp(platform: string): string {
    if (!this.predictions || !this.predictions[platform] || !this.predictions[platform].basedOn.previous.timestamp) {
      return 'N/A';
    }
    const timestamp = this.predictions[platform].basedOn.previous.timestamp;
    return timestamp.toDate ? timestamp.toDate().toLocaleDateString() : new Date(timestamp).toLocaleDateString();
  }

  getFollowerGrowthRate(platform: string): number {
    if (!this.predictions || !this.predictions[platform]) return 0;
    
    const current = this.predictions[platform].basedOn.current.followers;
    const previous = this.predictions[platform].basedOn.previous.followers;
    
    if (previous === 0) return 0;
    return (current / previous) - 1;
  }

  getEngagementGrowthRate(platform: string): number {
    if (!this.predictions || !this.predictions[platform]) return 0;
    
    const current = this.predictions[platform].basedOn.current.engagement;
    const previous = this.predictions[platform].basedOn.previous.engagement;
    
    if (previous === 0) return 0;
    return (current / previous) - 1;
  }

  getGrowthClass(rate: number): string {
    if (rate > 0) return 'text-success';
    if (rate < 0) return 'text-danger';
    return 'text-muted';
  }

  getGrowthIcon(rate: number): string {
    if (rate > 0) return 'bi-arrow-up-right';
    if (rate < 0) return 'bi-arrow-down-right';
    return 'bi-dash';
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
} 