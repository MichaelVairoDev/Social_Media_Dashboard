import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialService } from '../../services/social.service';
import { TestModeService } from '../../services/test-mode.service';
import { SocialMetric } from '../../models/social-metric.model';

@Component({
  selector: 'app-social-metrics',
  template: `
    <div class="dashboard-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="dashboard-title">Métricas de Redes Sociales</h1>
        <p class="text-muted">Gestiona tus métricas de redes sociales</p>
      </div>
      <div class="d-flex align-items-center">
        <div *ngIf="testMode" class="test-mode-badge me-3">
          <span class="badge bg-warning text-dark">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Modo Prueba Activo
          </span>
        </div>
        <div>
          <a routerLink="/metrics/new" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>Agregar métrica
          </a>
        </div>
      </div>
    </div>

    <div class="alert alert-info mb-4" *ngIf="testMode">
      <i class="bi bi-info-circle-fill me-2"></i>
      Estás viendo datos de prueba generados automáticamente. Estos datos no son reales.
      <strong>Nota:</strong> En modo de prueba, las operaciones de crear, editar y eliminar no afectarán a la base de datos real.
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar métricas..." 
            [(ngModel)]="searchTerm"
            (input)="filterMetrics()"
          >
        </div>
      </div>
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text">Plataforma</span>
          <select class="form-select" [(ngModel)]="selectedPlatform" (change)="filterMetrics()">
            <option value="">Todas las plataformas</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="pinterest">Pinterest</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>Plataforma</th>
                <th>Seguidores</th>
                <th>Engagement</th>
                <th>Publicaciones</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let metric of filteredMetrics">
                <td>
                  <i class="bi me-2" [ngClass]="getPlatformIcon(metric.platform)" [class]="getPlatformColor(metric.platform)"></i>
                  {{ metric.platform | titlecase }}
                </td>
                <td>{{ metric.followers | number }}</td>
                <td>{{ metric.engagement | number }}</td>
                <td>{{ metric.posts | number }}</td>
                <td>{{ metric.timestamp.toDate() | date:'short' }}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" (click)="editMetric(metric)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteMetric(metric)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
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
      <p class="mt-2">Cargando métricas...</p>
    </div>

    <div class="alert alert-info" *ngIf="!loading && metrics.length === 0">
      <p>No hay métricas disponibles. Comienza agregando datos de tus redes sociales.</p>
      <div class="d-flex gap-2">
        <a routerLink="/metrics/new" class="btn btn-primary">Agregar métrica</a>
        <button *ngIf="!testMode" class="btn btn-warning" (click)="enableTestMode()">
          Activar modo prueba para ver ejemplos
        </button>
      </div>
    </div>

    <div class="alert alert-info" *ngIf="!loading && metrics.length > 0 && filteredMetrics.length === 0">
      <p>No se encontraron métricas que coincidan con tu búsqueda.</p>
      <button class="btn btn-outline-primary" (click)="resetFilters()">Restablecer filtros</button>
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
export class SocialMetricsComponent implements OnInit {
  metrics: SocialMetric[] = [];
  filteredMetrics: SocialMetric[] = [];
  loading = true;
  searchTerm = '';
  selectedPlatform = '';
  testMode = false;

  constructor(
    private socialService: SocialService,
    private router: Router,
    private testModeService: TestModeService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
      this.loadMetrics();
    });
  }

  loadMetrics(): void {
    this.loading = true;
    this.socialService.getAllMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.filteredMetrics = [...this.metrics];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar métricas:', error);
        this.loading = false;
      }
    });
  }

  filterMetrics(): void {
    this.filteredMetrics = this.metrics.filter(metric => {
      const matchesPlatform = this.selectedPlatform ? 
        metric.platform.toLowerCase() === this.selectedPlatform.toLowerCase() : 
        true;
      
      const matchesSearch = this.searchTerm ? 
        metric.platform.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        metric.followers.toString().includes(this.searchTerm) ||
        metric.engagement.toString().includes(this.searchTerm) ||
        metric.posts.toString().includes(this.searchTerm) : 
        true;
      
      return matchesPlatform && matchesSearch;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedPlatform = '';
    this.filteredMetrics = [...this.metrics];
  }

  editMetric(metric: SocialMetric): void {
    this.router.navigate(['/metrics/edit', metric.id]);
  }

  deleteMetric(metric: SocialMetric): void {
    if (confirm(`¿Estás seguro de que deseas eliminar esta métrica de ${metric.platform}?`)) {
      if (metric.id) {
        this.socialService.deleteMetrics(metric.id).subscribe({
          next: () => {
            this.metrics = this.metrics.filter(m => m.id !== metric.id);
            this.filterMetrics();
          },
          error: (error) => {
            console.error('Error al eliminar métrica:', error);
          }
        });
      }
    }
  }

  enableTestMode(): void {
    this.testModeService.setTestMode(true);
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