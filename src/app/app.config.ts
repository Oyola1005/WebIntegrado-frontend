// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorHttpInterceptor } from './core/interceptors/error-http.interceptor';
import { authTokenInterceptor } from './auth/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authTokenInterceptor,   // primero añadimos el token
        errorHttpInterceptor    // luego manejamos errores (401, etc.)
      ])
    )
  ]
};
