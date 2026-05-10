import { createReducer, on } from '@ngrx/store';
import { MenuActions } from './menu.actions';
import { initialMenuState } from './menu.models';

export const menuFeatureKey = 'menu';

export const menuReducer = createReducer(
  initialMenuState,
  on(MenuActions.loadMenu, (state, { profile }) => ({
    ...state,
    loading: true,
    error: null,
    profile
  })),
  on(MenuActions.loadMenuSuccess, (state, { menuItems, profile }) => ({
    ...state,
    items: menuItems,
    loading: false,
    error: null,
    profile
  })),
  on(MenuActions.loadMenuFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MenuActions.clearMenu, () => initialMenuState)
);
