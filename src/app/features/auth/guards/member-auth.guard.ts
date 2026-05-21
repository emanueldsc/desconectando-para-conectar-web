import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

interface AuthUserStorage {
  role?: string;
}

export const memberAuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  const userRaw = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');

  if (!token || !userRaw) {
    return router.createUrlTree(['/login']);
  }

  try {
    const user = JSON.parse(userRaw) as AuthUserStorage;

    if (typeof user.role !== 'string' || user.role.trim().length === 0) {
      return router.createUrlTree(['/login']);
    }

    return true;
  } catch {
    return router.createUrlTree(['/login']);
  }
};
