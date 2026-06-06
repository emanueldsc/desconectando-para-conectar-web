import { Routes } from "@angular/router";
import { managerOnlyDashboardGuard } from '../auth/guards/manager-only-dashboard.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./general/general').then((m) => m.General)
  },
  {
    path: 'content',
    loadComponent: () => import('./content/content').then((m) => m.Content)
  },
  {
    path: 'raffle',
    loadComponent: () => import('./raffle/raffle').then((m) => m.Raffle)
  },
  {
    path: 'cms',
    canActivate: [managerOnlyDashboardGuard],
    loadComponent: () => import('./cms/cms').then((m) => m.Cms)
  },
  {
    path: 'donations',
    canActivate: [managerOnlyDashboardGuard],
    loadComponent: () => import('./donations/donations').then((m) => m.Donations)
  },
  {
    path: 'users',
    canActivate: [managerOnlyDashboardGuard],
    loadComponent: () => import('./users/users').then((m) => m.Users)
  }
]