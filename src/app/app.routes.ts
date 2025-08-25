import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tickets',
    pathMatch: 'full'
  },
  {
    path: 'tickets/:id',
    loadComponent: () => 
      import('./features/ticket/pages/ticket-detail/ticket-detail.component').then(
        m => m.TicketDetailComponent
      ),
    title: 'TicketFlow - Ticket Details'
  },
  {
    path: 'tickets',
    loadComponent: () => 
      import('./features/ticket/pages/ticket-list/ticket-list.component').then(
        m => m.TicketListComponent
      ),
    title: 'TicketFlow - Tickets'
  },
  {
    path: '**',
    redirectTo: '/tickets'
  }
];
