import { createReducer, on } from '@ngrx/store';
import { MenuActions } from './menu.actions';
import { initialMenuState } from './menu.models';

export const menuFeatureKey = 'menu';

export const menuReducer = createReducer(
  initialMenuState,
  on(MenuActions.loadMenu, (state, { profile, scope }) => ({
    ...state,
    loading: true,
    error: null,
    profile,
    scope
  })),
  on(MenuActions.loadMenuSuccess, (state, { menuItems, profile, scope }) => ({
    ...state,
    items: menuItems,
    loading: false,
    error: null,
    profile,
    scope
  })),
  on(MenuActions.loadMenuFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MenuActions.clearMenu, () => initialMenuState)
);
