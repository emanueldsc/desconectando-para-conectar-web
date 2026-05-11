import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import { MenuEffects } from './store/menu/menu.effects';
import { menuFeatureKey, menuReducer } from './store/menu/menu.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideStore({
      [menuFeatureKey]: menuReducer
    }),
    provideEffects(MenuEffects),
  ],
};
