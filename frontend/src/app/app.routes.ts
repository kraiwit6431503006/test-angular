import { Routes } from '@angular/router';
import { DefaultLayout } from './layouts/default-layout/default-layout';
import { Home } from './pages/home/home';
import { Favorite } from './pages/favorite/favorite';
import { Naruto } from './pages/naruto/naruto';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayout,
    children: [
      { path: '', component: Home },
      { path: 'favorite', component: Favorite },
      { path: 'naruto', component: Naruto },
      {
        path: 'post/:id',
        loadComponent: () => import('./pages/post-detail/post-detail').then((m) => m.PostDetail),
      },
    ],
  },
];
