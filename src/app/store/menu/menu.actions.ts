import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { MenuItem, UserProfile } from './menu.models';

export const MenuActions = createActionGroup({
  source: 'Menu',
  events: {
    'Load Menu': props<{ profile: UserProfile }>(),
    'Load Menu Success': props<{ menuItems: MenuItem[]; profile: UserProfile }>(),
    'Load Menu Failure': props<{ error: string }>(),
    'Clear Menu': emptyProps()
  }
});
