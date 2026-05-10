export type UserProfile = 'guest' | 'member' | 'admin';

export interface MenuItem {
  id: string;
  label: string;
  route: string;
  profiles: UserProfile[];
}

export interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  profile: UserProfile;
}

export const initialMenuState: MenuState = {
  items: [],
  loading: false,
  error: null,
  profile: 'guest'
};
