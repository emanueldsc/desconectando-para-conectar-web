import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('../public/login/login').then((m) => m.Login),
	},
	{
		path: 'member',
		loadComponent: () => import('./member-area/member-area').then((m) => m.MemberArea),
	},
];