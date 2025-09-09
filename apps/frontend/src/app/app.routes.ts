// app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './layout/dashboard.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./features/pacientes/list/pacientes-list.component')
            .then(m => m.PacientesListComponent),
      },
      {
        path: 'pacientes/novo',
        loadComponent: () =>
          import('./features/pacientes/form/paciente-form.component')
            .then(m => m.PacienteFormComponent),
      },
      {
        path: 'exames',
        loadComponent: () =>
          import('./features/exames/list/exames-list.component')
            .then(m => m.ExamesListComponent),
      },
      {
        path: 'exames/novo',
        loadComponent: () =>
          import('./features/exames/form/exame-form.component')
            .then(m => m.ExameFormComponent),
      },
      {
        path: 'pacientes/:id',
        loadComponent: () =>
          import('./features/pacientes/form/paciente-form.component')
            .then(m => m.PacienteFormComponent),
      },
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
    ],
  },
];
