import { Routes } from '@angular/router';
import { AnalysesResults } from './components/analyses-results/analyses-results';
import { Home } from './components/home/home';

export const routes: Routes = [
    {
        path: 'home',
        component: Home
    },
    {
        path: 'results',
        component: AnalysesResults
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
