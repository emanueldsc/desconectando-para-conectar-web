import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { MenuItem, MenuScope, UserProfile } from './menu.models';

export const MenuActions = createActionGroup({
  source: 'Menu',
  events: {
    'Load Menu': props<{ profile: UserProfile; scope: MenuScope }>(),
    'Load Menu Success': props<{ menuItems: MenuItem[]; profile: UserProfile; scope: MenuScope }>(),
    'Load Menu Failure': props<{ error: string }>(),
    'Clear Menu': emptyProps()
  }
});
