import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MenuState } from './menu.models';
import { menuFeatureKey } from './menu.reducer';

export const selectMenuState = createFeatureSelector<MenuState>(menuFeatureKey);

export const selectMenuItems = createSelector(selectMenuState, (state) => state.items);
export const selectMenuLoading = createSelector(selectMenuState, (state) => state.loading);
export const selectMenuError = createSelector(selectMenuState, (state) => state.error);
export const selectMenuProfile = createSelector(selectMenuState, (state) => state.profile);
