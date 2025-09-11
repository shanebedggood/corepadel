import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { MessageService } from 'primeng/api';
import { StickyMessageService } from './app/services/sticky-message.service';
import { registerLocaleData } from '@angular/common';
import localeEnZA from '@angular/common/locales/en-ZA';
import localeEnZAExtra from '@angular/common/locales/extra/en-ZA';
// Firebase imports - use our configured instances
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideStorage } from '@angular/fire/storage';
import { app, auth, storage } from './environments/firebase.config';
import { authTokenInterceptorFn } from './app/interceptors/auth-token.interceptor';
import { httpErrorInterceptor } from './app/interceptors/http-error.interceptor';
import { GlobalErrorHandlerService } from './app/services/global-error-handler.service';

// Register South African locale data
registerLocaleData(localeEnZA, 'en-ZA', localeEnZAExtra);

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withInterceptors([authTokenInterceptorFn, httpErrorInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Lara, options: { darkModeSelector: '.app-dark' } } }),
        // Custom providers - added to the default ones above.
        provideFirebaseApp(() => app),
        provideAuth(() => auth),
        provideStorage(() => storage),

        MessageService,
        StickyMessageService,
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
    ]
};
