import { Component, OnInit } from '@angular/core';
import { TestModeService } from '../../services/test-mode.service';
import { SocialService } from '../../services/social.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="bi bi-bar-chart-fill me-2"></i>
          Social Media Dashboard
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/metrics" routerLinkActive="active">Métricas</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/charts" routerLinkActive="active">Gráficos</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/predictions" routerLinkActive="active">Predicciones</a>
            </li>
          </ul>
          
          <ul class="navbar-nav ms-auto">
            <li class="nav-item d-flex align-items-center me-3">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="testModeSwitch" 
                  [checked]="testMode"
                  (change)="toggleTestMode()"
                >
                <label class="form-check-label text-light" for="testModeSwitch">
                  Modo Prueba
                </label>
              </div>
            </li>
            
            <!-- Opciones para usuarios no autenticados -->
            <ng-container *ngIf="!isAuthenticated">
              <li class="nav-item">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">
                  <i class="bi bi-box-arrow-in-right me-1"></i>
                  Iniciar Sesión
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/register" routerLinkActive="active">
                  <i class="bi bi-person-plus me-1"></i>
                  Registrarse
                </a>
              </li>
            </ng-container>
            
            <!-- Opciones para usuarios autenticados -->
            <li class="nav-item dropdown" *ngIf="isAuthenticated">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i>
                {{ currentUser?.displayName || 'Usuario' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person me-2"></i>
                    Mi Perfil
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" (click)="logout($event)">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: 600;
    }
    .nav-link {
      font-weight: 500;
      padding: 0.5rem 1rem;
    }
    .nav-link.active {
      color: #fff !important;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .form-check-input {
      cursor: pointer;
    }
    .form-check-label {
      cursor: pointer;
      font-size: 0.9rem;
    }
    .dropdown-menu {
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    .dropdown-item {
      padding: 0.5rem 1rem;
    }
    .dropdown-item:active {
      background-color: #007bff;
    }
  `]
})
export class NavbarComponent implements OnInit {
  testMode = false;
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    private testModeService: TestModeService,
    private socialService: SocialService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
      this.socialService.testMode = mode;
    });
    
    // Suscribirse a los cambios del estado de autenticación
    this.authService.authState$.subscribe(authState => {
      this.isAuthenticated = authState.isAuthenticated;
      this.currentUser = authState.user;
    });
  }

  toggleTestMode(): void {
    this.testModeService.toggleTestMode();
  }
  
  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: error => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }
} 