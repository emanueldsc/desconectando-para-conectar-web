import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem, UserProfile } from '../../store/menu/menu.models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      route: '/public/home',
      profiles: ['guest', 'member', 'admin']
    },
    {
      id: 'blog',
      label: 'Blog',
      route: '/public/blog',
      profiles: ['guest', 'member', 'admin']
    },
    {
      id: 'raffles',
      label: 'Rifas',
      route: '/public/raffles',
      profiles: ['guest', 'member', 'admin']
    },
    {
      id: 'login',
      label: 'Login',
      route: '/login',
      profiles: ['guest']
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      profiles: ['member', 'admin']
    }
  ];

  public getMenuByProfile(profile: UserProfile): Observable<MenuItem[]> {
    return of(this.menuItems.filter((item) => item.profiles.includes(profile)));
  }
}
