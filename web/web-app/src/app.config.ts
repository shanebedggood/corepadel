import { ApplicationConfig, provideEnvironmentInitializer, inject, EnvironmentProviders, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authTokenInterceptorFn } from './app/interceptors/auth-token.interceptor';
import { providePrimeNG } from 'primeng/config';
import { NgZone } from '@angular/core';
import { appRoutes } from './app.routes';
import { environment } from './environments';
import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';
import { MessageService } from 'primeng/api';
import { StickyMessageService } from './app/services/sticky-message.service';
import { registerLocaleData } from '@angular/common';
import localeEnZA from '@angular/common/locales/en-ZA';
import localeEnZAExtra from '@angular/common/locales/extra/en-ZA';

// Firebase imports - use our configured instances
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideFunctions } from '@angular/fire/functions';
import { app, auth, functions } from './environments/firebase.config';

// Register South African locale data
registerLocaleData(localeEnZA, 'en-ZA', localeEnZAExtra);

// Create a custom Lara-based preset with your desired styling
const CustomLaraPreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: 'rgb(239 246 255)',
            100: 'rgb(219 234 254)',
            200: 'rgb(191 219 254)',
            300: 'rgb(147 197 253)',
            400: 'rgb(96 165 250)',
            500: 'rgb(59 130 246)',
            600: 'rgb(37 99 235)',
            700: 'rgb(29 78 216)',
            800: 'rgb(30 64 175)',
            900: 'rgb(30 58 138)',
            950: 'rgb(23 37 84)'
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: LOCALE_ID, useValue: 'en-ZA' },
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(
            withInterceptors([authTokenInterceptorFn])
        ),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: CustomLaraPreset,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        }),
        
        // Firebase providers - use our pre-configured instances
        provideFirebaseApp(() => app),
        provideAuth(() => auth),
        provideFunctions(() => functions),

        MessageService,
        StickyMessageService
    ]
}; 