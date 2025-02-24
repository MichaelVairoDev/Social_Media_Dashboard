import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialService } from '../../services/social.service';
import { SocialMetric, SocialPlatform } from '../../models/social-metric.model';
import { TestModeService } from '../../services/test-mode.service';

@Component({
  selector: 'app-metric-form',
  template: `
    <div class="dashboard-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="dashboard-title">{{ isEditMode ? 'Editar' : 'Agregar' }} Métrica</h1>
        <p class="text-muted">{{ isEditMode ? 'Actualiza los datos de la métrica existente' : 'Ingresa los datos de la nueva métrica' }}</p>
      </div>
      <div *ngIf="testMode" class="test-mode-badge">
        <span class="badge bg-warning text-dark">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          Modo Prueba Activo
        </span>
      </div>
    </div>

    <div class="alert alert-info mb-4" *ngIf="testMode">
      <i class="bi bi-info-circle-fill me-2"></i>
      Estás en modo de prueba. Los cambios que realices no afectarán a la base de datos real.
    </div>

    <div class="card">
      <div class="card-body">
        <form [formGroup]="metricForm" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="platform" class="form-label">Plataforma *</label>
              <select id="platform" class="form-select" formControlName="platform">
                <option value="">Selecciona una plataforma</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="pinterest">Pinterest</option>
              </select>
              <div *ngIf="submitted && f['platform'].errors" class="text-danger mt-1">
                <small *ngIf="f['platform'].errors['required']">La plataforma es obligatoria</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="followers" class="form-label">Seguidores *</label>
              <input type="number" id="followers" class="form-control" formControlName="followers" min="0">
              <div *ngIf="submitted && f['followers'].errors" class="text-danger mt-1">
                <small *ngIf="f['followers'].errors['required']">El número de seguidores es obligatorio</small>
                <small *ngIf="f['followers'].errors['min']">El número de seguidores debe ser mayor o igual a 0</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="engagement" class="form-label">Engagement *</label>
              <input type="number" id="engagement" class="form-control" formControlName="engagement" min="0">
              <div *ngIf="submitted && f['engagement'].errors" class="text-danger mt-1">
                <small *ngIf="f['engagement'].errors['required']">El engagement es obligatorio</small>
                <small *ngIf="f['engagement'].errors['min']">El engagement debe ser mayor o igual a 0</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="posts" class="form-label">Publicaciones *</label>
              <input type="number" id="posts" class="form-control" formControlName="posts" min="0">
              <div *ngIf="submitted && f['posts'].errors" class="text-danger mt-1">
                <small *ngIf="f['posts'].errors['required']">El número de publicaciones es obligatorio</small>
                <small *ngIf="f['posts'].errors['min']">El número de publicaciones debe ser mayor o igual a 0</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="likes" class="form-label">Likes</label>
              <input type="number" id="likes" class="form-control" formControlName="likes" min="0">
              <div *ngIf="submitted && f['likes'].errors" class="text-danger mt-1">
                <small *ngIf="f['likes'].errors['min']">El número de likes debe ser mayor o igual a 0</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="comments" class="form-label">Comentarios</label>
              <input type="number" id="comments" class="form-control" formControlName="comments" min="0">
              <div *ngIf="submitted && f['comments'].errors" class="text-danger mt-1">
                <small *ngIf="f['comments'].errors['min']">El número de comentarios debe ser mayor o igual a 0</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="shares" class="form-label">Compartidos</label>
              <input type="number" id="shares" class="form-control" formControlName="shares" min="0">
              <div *ngIf="submitted && f['shares'].errors" class="text-danger mt-1">
                <small *ngIf="f['shares'].errors['min']">El número de compartidos debe ser mayor o igual a 0</small>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="views" class="form-label">Visualizaciones</label>
              <input type="number" id="views" class="form-control" formControlName="views" min="0">
              <div *ngIf="submitted && f['views'].errors" class="text-danger mt-1">
                <small *ngIf="f['views'].errors['min']">El número de visualizaciones debe ser mayor o igual a 0</small>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
              <i class="bi bi-arrow-left me-2"></i>Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              <i class="bi" [ngClass]="isEditMode ? 'bi-save' : 'bi-plus-circle'"></i>
              {{ isEditMode ? 'Actualizar' : 'Guardar' }}
              <span *ngIf="loading" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
            </button>
          </div>
        </form>
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
export class MetricFormComponent implements OnInit {
  metricForm: FormGroup;
  isEditMode = false;
  metricId: string | null = null;
  submitted = false;
  loading = false;
  testMode = false;

  constructor(
    private fb: FormBuilder,
    private socialService: SocialService,
    private route: ActivatedRoute,
    private router: Router,
    private testModeService: TestModeService
  ) {
    this.metricForm = this.fb.group({
      platform: ['', Validators.required],
      followers: [0, [Validators.required, Validators.min(0)]],
      engagement: [0, [Validators.required, Validators.min(0)]],
      posts: [0, [Validators.required, Validators.min(0)]],
      likes: [0, Validators.min(0)],
      comments: [0, Validators.min(0)],
      shares: [0, Validators.min(0)],
      views: [0, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    this.metricId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.metricId;

    if (this.isEditMode && this.metricId) {
      this.loading = true;
      this.socialService.getAllMetrics().subscribe({
        next: (metrics) => {
          const metric = metrics.find(m => m.id === this.metricId);
          if (metric) {
            this.metricForm.patchValue({
              platform: metric.platform,
              followers: metric.followers,
              engagement: metric.engagement,
              posts: metric.posts,
              likes: metric.likes || 0,
              comments: metric.comments || 0,
              shares: metric.shares || 0,
              views: metric.views || 0
            });
          } else {
            this.router.navigate(['/metrics']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar la métrica:', error);
          this.loading = false;
          this.router.navigate(['/metrics']);
        }
      });
    }

    // Suscribirse a los cambios del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
    });
  }

  get f() { return this.metricForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.metricForm.invalid) {
      return;
    }

    this.loading = true;
    const metricData: SocialMetric = {
      ...this.metricForm.value,
      timestamp: new Date()
    };

    if (this.isEditMode && this.metricId) {
      this.socialService.updateMetrics(this.metricId, metricData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/metrics']);
        },
        error: (error) => {
          console.error('Error al actualizar la métrica:', error);
          this.loading = false;
        }
      });
    } else {
      this.socialService.createMetrics(metricData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/metrics']);
        },
        error: (error) => {
          console.error('Error al crear la métrica:', error);
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/metrics']);
  }
} 