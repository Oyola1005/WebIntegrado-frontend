// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authTokenInterceptor } from './auth/auth-token.interceptor';
// (Cuando lo agreguemos) import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // HttpClient + interceptores
    provideHttpClient(
      withInterceptors([
        authTokenInterceptor,
        // errorInterceptor   <-- lo activarás cuando lo creemos
      ])
    )
  ]
};