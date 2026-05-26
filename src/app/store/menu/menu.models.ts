export type UserProfile = 'guest' | 'member' | 'admin';
export type MenuScope = 'public' | 'dashboard';

export interface MenuItem {
  id: string;
  label: string;
  route: string;
  scope: MenuScope;
  profiles: UserProfile[];
  icon?: string;
  action?: 'logout';
}

export interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  profile: UserProfile;
  scope: MenuScope;
}

export const initialMenuState: MenuState = {
  items: [],
  loading: false,
  error: null,
  profile: 'guest',
  scope: 'public'
};
