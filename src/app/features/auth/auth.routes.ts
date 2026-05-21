import { Routes } from '@angular/router';
import { memberAuthGuard } from './guards/member-auth.guard';

export const AUTH_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('../public/login/login').then((m) => m.Login),
	},
	{
		path: 'register/member',
		loadComponent: () => import('./register-member/register-member').then((m) => m.RegisterMember),
	},
	{
		path: 'register/internal',
		loadComponent: () => import('./register-internal/register-internal').then((m) => m.RegisterInternal),
	},
	{
		path: 'member',
		canActivate: [memberAuthGuard],
		loadComponent: () => import('./member-area/member-area').then((m) => m.MemberArea),
	},
];