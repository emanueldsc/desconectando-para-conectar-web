import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem, MenuScope, UserProfile } from '../../store/menu/menu.models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly menuItems: MenuItem[] = [
    {
      id: 'member-area',
      label: 'Área de membros',
      route: '/login/member',
      scope: 'public',
      profiles: ['member']
    },
    {
      id: 'home',
      label: 'Inicio',
      route: '/public/home',
      scope: 'public',
      profiles: ['guest', 'member', 'admin']
    },
    {
      id: 'blog',
      label: 'Blog',
      route: '/public/blog',
      scope: 'public',
      profiles: ['guest', 'member', 'admin']
    },
    {
      id: 'raffles',
      label: 'Rifas',
      route: '/public/raffles',
      scope: 'public',
      profiles: ['guest', 'member', 'admin']
    },
    {
      id: 'login',
      label: 'Login',
      route: '/login',
      scope: 'public',
      profiles: ['guest']
    },
    {
      id: 'logout',
      label: 'Logout',
      route: '/public/home',
      scope: 'public',
      profiles: ['member', 'admin'],
      action: 'logout'
    },
    {
      id: 'dash-general',
      label: 'Visão Geral',
      route: '/dashboard',
      scope: 'dashboard',
      profiles: ['admin']
    },
    {
      id: 'dash-content',
      label: 'Conteúdo Blog',
      route: '/dashboard/content',
      scope: 'dashboard',
      profiles: ['admin']
    },
    {
      id: 'dash-raffle',
      label: 'Rifas',
      route: '/dashboard/raffle',
      scope: 'dashboard',
      profiles: ['admin']
    },
    {
      id: 'dash-donations',
      label: 'Doações',
      route: '/dashboard/donations',
      scope: 'dashboard',
      profiles: ['admin']
    },
    {
      id: 'dash-users',
      label: 'Usuários',
      route: '/dashboard/users',
      scope: 'dashboard',
      profiles: ['admin']
    },
    {
      id: 'dash-cms',
      label: 'CMS do Site',
      route: '/dashboard/cms',
      scope: 'dashboard',
      profiles: ['admin']
    }
  ];

  public getMenuByProfile(profile: UserProfile, scope: MenuScope): Observable<MenuItem[]> {
    if (profile === 'admin') {
      return of(
        this.menuItems.filter(
          (item) => item.profiles.includes(profile) && (item.scope === 'public' || item.scope === 'dashboard')
        )
      );
    }

    return of(this.menuItems.filter((item) => item.scope === scope && item.profiles.includes(profile)));
  }
}
