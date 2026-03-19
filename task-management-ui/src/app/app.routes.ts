import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'tasks', 
    component: TaskListComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'tasks/new', 
    component: TaskFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'tasks/:id', 
    component: TaskDetailComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'tasks/:id/edit', 
    component: TaskFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'users', 
    component: UserManagementComponent, 
    canActivate: [adminGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
 