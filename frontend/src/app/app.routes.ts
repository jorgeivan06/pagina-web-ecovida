import { Routes } from '@angular/router';
import { DocumentListComponent } from './components/document-list.component';
import { AdminComponent } from './components/admin.component';

export const routes: Routes = [
  { path: '', component: DocumentListComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
