import { Routes } from '@angular/router';
import { Agendar } from './agendar';
import { Equipe } from './equipe';

export const routes: Routes = [
  { path: '', component: Agendar, title: 'Agende seu horário - Barbearia LS' },
  { path: 'equipe', component: Equipe, title: 'Área da equipe - Barbearia LS' },
  { path: '**', redirectTo: '' },
];
