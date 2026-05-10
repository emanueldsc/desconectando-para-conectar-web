import { Routes } from "@angular/router";

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        loadComponent: () => import('./home/home').then((m) => m.Home)
    },
    {
        path: 'blog',
        loadComponent: () => import('./blog/blog').then((m) => m.Blog)
    },
    {
        path: 'raffles',
        loadComponent: () => import('./raffle/raffle').then((m) => m.Raffle)
    }
] 