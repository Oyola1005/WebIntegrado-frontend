// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

// Interceptor que agrega el token JWT
import { authTokenInterceptor } from './auth/auth-token.interceptor';

// Interceptor global que maneja errores HTTP
import { errorHttpInterceptor } from './core/interceptors/error-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // HttpClient + Interceptores globales
    provideHttpClient(
      withInterceptors([
        authTokenInterceptor,   // agrega el JWT automáticamente
        errorHttpInterceptor    // maneja errores del backend
      ])
    )
  ]
};