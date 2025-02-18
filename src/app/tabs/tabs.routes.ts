import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'visaogeral',
        loadComponent: () =>
          import('../visaogeral/visaogeral.page').then((m) => m.VisaoGeralPage),
      },
      {
        path: 'dividendos',
        loadComponent: () =>
          import('../dividendos/dividendos.page').then((m) => m.DividendosPage),
      },
      {
        path: 'aporte',
        loadComponent: () =>
          import('../aporte/aporte.page').then((m) => m.AportePage),
      },
      {
        path: 'carteira',
        loadComponent: () =>
          import('../carteira/carteira.page').then((m) => m.CarteiraPage),
      },
      {
        path: 'adicionar-fi',
        loadComponent: () =>
          import('../carteira/adicionar-fi/adicionar-fi.page').then((m) => m.AdicionarFiPage),
      },
      {
        path: 'edit-asset/:code',
        loadComponent: () =>
          import('../carteira/edit-asset/edit-asset.page').then((m) => m.EditAssetPage),
      },
      {
        path: '',
        redirectTo: '/tabs/visaogeral',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/visaogeral',
    pathMatch: 'full',
  },
];
