import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TestModeService } from '../../../services/test-mode.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-header bg-primary text-white text-center">
              <h4 class="mb-0">Iniciar Sesión</h4>
            </div>
            <div class="card-body">
              <div *ngIf="error" class="alert alert-danger">
                {{ error }}
              </div>
              
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Correo electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email" 
                    class="form-control" 
                    [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                  >
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    <div *ngIf="f['email'].errors['required']">El correo electrónico es obligatorio</div>
                    <div *ngIf="f['email'].errors['email']">Ingrese un correo electrónico válido</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    id="password" 
                    formControlName="password" 
                    class="form-control"
                    [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                  >
                  <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
                    <div *ngIf="f['password'].errors['required']">La contraseña es obligatoria</div>
                    <div *ngIf="f['password'].errors['minlength']">La contraseña debe tener al menos 6 caracteres</div>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Iniciar Sesión
                  </button>
                </div>
              </form>
              
              <div class="mt-3 text-center">
                <p>¿No tienes una cuenta? <a routerLink="/register">Regístrate</a></p>
              </div>
              
              <div class="mt-4">
                <div class="alert alert-info">
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="testModeSwitch" 
                      [checked]="testMode"
                      (change)="toggleTestMode()"
                    >
                    <label class="form-check-label" for="testModeSwitch">
                      Modo Prueba
                    </label>
                  </div>
                  <small class="d-block mt-2">
                    El modo prueba te permite explorar la aplicación sin necesidad de crear una cuenta.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 10px;
      overflow: hidden;
    }
    .card-header {
      border-bottom: none;
      padding: 1.25rem;
    }
    .form-check-input {
      cursor: pointer;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '/dashboard';
  testMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private testModeService: TestModeService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener la URL de retorno de los parámetros de consulta o usar el valor predeterminado
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Suscribirse al estado del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
    });
    
    // Si el usuario ya está autenticado, redirigir al dashboard
    this.authService.authState$.subscribe(authState => {
      if (authState.isAuthenticated) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    
    // Detener si el formulario es inválido
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        this.error = error.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }

  toggleTestMode(): void {
    this.testModeService.toggleTestMode();
    
    // Si se activa el modo de prueba, redirigir al dashboard
    if (this.testMode) {
      this.router.navigate(['/dashboard']);
    }
  }
} 