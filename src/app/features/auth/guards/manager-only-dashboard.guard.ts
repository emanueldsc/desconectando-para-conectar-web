import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

interface AuthUserStorage {
  role?: string;
}

export const managerOnlyDashboardGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  const userRaw = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');

  if (!token || !userRaw) {
    return router.createUrlTree(['/login']);
  }

  try {
    const user = JSON.parse(userRaw) as AuthUserStorage;

    if (user.role === 'manager') {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};
