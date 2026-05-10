import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import { MenuEffects } from './store/menu/menu.effects';
import { menuFeatureKey, menuReducer } from './store/menu/menu.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      [menuFeatureKey]: menuReducer
    }),
    provideEffects(MenuEffects),
  ],
};
