import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TestModeService } from '../../../services/test-mode.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-header bg-primary text-white text-center">
              <h4 class="mb-0">Crear Cuenta</h4>
            </div>
            <div class="card-body">
              <div *ngIf="error" class="alert alert-danger">
                {{ error }}
              </div>
              
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="displayName" class="form-label">Nombre</label>
                  <input 
                    type="text" 
                    id="displayName" 
                    formControlName="displayName" 
                    class="form-control" 
                    [ngClass]="{'is-invalid': submitted && f['displayName'].errors}"
                  >
                  <div *ngIf="submitted && f['displayName'].errors" class="invalid-feedback">
                    <div *ngIf="f['displayName'].errors['required']">El nombre es obligatorio</div>
                  </div>
                </div>
                
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
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    formControlName="confirmPassword" 
                    class="form-control"
                    [ngClass]="{'is-invalid': submitted && f['confirmPassword'].errors}"
                  >
                  <div *ngIf="submitted && f['confirmPassword'].errors" class="invalid-feedback">
                    <div *ngIf="f['confirmPassword'].errors['required']">Confirmar la contraseña es obligatorio</div>
                    <div *ngIf="f['confirmPassword'].errors['mustMatch']">Las contraseñas no coinciden</div>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Registrarse
                  </button>
                </div>
              </form>
              
              <div class="mt-3 text-center">
                <p>¿Ya tienes una cuenta? <a routerLink="/login">Iniciar sesión</a></p>
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  testMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private testModeService: TestModeService
  ) {
    this.registerForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    // Suscribirse al estado del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
    });
    
    // Si el usuario ya está autenticado, redirigir al dashboard
    this.authService.authState$.subscribe(authState => {
      if (authState.isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() { return this.registerForm.controls; }

  // Validador personalizado para verificar que las contraseñas coincidan
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        // Retornar si otro validador ya ha encontrado un error
        return;
      }

      // Establecer error si las contraseñas no coinciden
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Detener si el formulario es inválido
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.authService.register({
      displayName: this.f['displayName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.error = error.message || 'Error al registrarse';
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