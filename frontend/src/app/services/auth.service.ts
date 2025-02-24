import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User as FirebaseUser,
  onAuthStateChanged
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  authState$ = this.authStateSubject.asObservable();

  constructor(private auth: Auth) {
    // Suscribirse a los cambios de autenticación
    onAuthStateChanged(this.auth, (firebaseUser) => {
      const user = this.firebaseUserToUser(firebaseUser);
      this.authStateSubject.next({
        isAuthenticated: !!user,
        user,
        loading: false,
        error: null
      });
    });
  }

  // Convertir usuario de Firebase a nuestro modelo
  private firebaseUserToUser(firebaseUser: FirebaseUser | null): User | null {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      lastLogin: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined,
      createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined
    };
  }

  // Registrar un nuevo usuario
  register(credentials: RegisterCredentials): Observable<User> {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      loading: true,
      error: null
    });

    return from(createUserWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    )).pipe(
      switchMap(userCredential => {
        // Si se proporcionó un nombre para mostrar, actualizarlo
        if (credentials.displayName) {
          return from(updateProfile(userCredential.user, {
            displayName: credentials.displayName
          })).pipe(
            map(() => userCredential.user)
          );
        }
        return of(userCredential.user);
      }),
      map(firebaseUser => this.firebaseUserToUser(firebaseUser) as User),
      tap(user => {
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        this.authStateSubject.next({
          ...this.authStateSubject.value,
          loading: false,
          error: error.message
        });
        throw error;
      })
    );
  }

  // Iniciar sesión
  login(credentials: LoginCredentials): Observable<User> {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      loading: true,
      error: null
    });

    return from(signInWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    )).pipe(
      map(userCredential => this.firebaseUserToUser(userCredential.user) as User),
      tap(user => {
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        this.authStateSubject.next({
          ...this.authStateSubject.value,
          loading: false,
          error: error.message
        });
        throw error;
      })
    );
  }

  // Cerrar sesión
  logout(): Observable<void> {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      loading: true
    });

    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.authStateSubject.next({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        this.authStateSubject.next({
          ...this.authStateSubject.value,
          loading: false,
          error: error.message
        });
        throw error;
      })
    );
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  // Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  // Obtener el ID del usuario actual
  getCurrentUserId(): string | null {
    return this.authStateSubject.value.user?.uid || null;
  }
} 