import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './app/services/loading-interceptor';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([loadingInterceptor])),
    provideRouter(routes) 
  ]
});