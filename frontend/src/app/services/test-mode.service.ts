import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestModeService {
  private testModeSubject = new BehaviorSubject<boolean>(true);
  public testMode$: Observable<boolean> = this.testModeSubject.asObservable();

  constructor() {
    // Intentar cargar el estado del modo de prueba desde localStorage
    const savedMode = localStorage.getItem('testMode');
    if (savedMode) {
      this.testModeSubject.next(savedMode === 'true');
    } else {
      // Si no hay valor guardado, establecer a true por defecto y guardarlo
      localStorage.setItem('testMode', 'true');
    }
  }

  toggleTestMode(): void {
    const newValue = !this.testModeSubject.value;
    this.testModeSubject.next(newValue);
    // Guardar en localStorage para persistencia
    localStorage.setItem('testMode', newValue.toString());
  }

  getTestMode(): boolean {
    return this.testModeSubject.value;
  }

  setTestMode(value: boolean): void {
    this.testModeSubject.next(value);
    localStorage.setItem('testMode', value.toString());
  }
} 