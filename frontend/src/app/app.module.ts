import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

// Componentes
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SocialMetricsComponent } from './components/social-metrics/social-metrics.component';
import { MetricFormComponent } from './components/metric-form/metric-form.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ChartsComponent } from './components/charts/charts.component';
import { PredictionsComponent } from './components/predictions/predictions.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';

// Servicios
import { SocialService } from './services/social.service';
import { TestModeService } from './services/test-mode.service';
import { AuthService } from './services/auth.service';

// Guardias
import { AuthGuard } from './guards/auth.guard';

// Entorno
import { environment } from '../environments/environment';

// Rutas
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { 
    path: 'metrics', 
    component: SocialMetricsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'metrics/new', 
    component: MetricFormComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'metrics/edit/:id', 
    component: MetricFormComponent,
    canActivate: [AuthGuard]
  },
  { path: 'charts', component: ChartsComponent },
  { path: 'predictions', component: PredictionsComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SocialMetricsComponent,
    MetricFormComponent,
    NavbarComponent,
    ChartsComponent,
    PredictionsComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ],
  providers: [
    SocialService,
    TestModeService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 