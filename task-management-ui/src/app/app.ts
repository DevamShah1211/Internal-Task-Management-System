import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';
import { AuroraBackgroundComponent } from './components/ui-effects/aurora-background.component';
import { ClickSparkDirective } from './components/ui-effects/click-spark.directive';
import { Notification } from './models/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    AuroraBackgroundComponent,
    ClickSparkDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  themeService = inject(ThemeService);
  router = inject(Router);
  isMobile = false;
  notifications: Notification[] = [];

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadNotifications();
        // Setup polling every 30 seconds
        setInterval(() => this.loadNotifications(), 30000);
      }
    });
  }

  loadNotifications() {
    if (this.authService.isLoggedIn()) {
      this.notificationService.getNotifications().subscribe(notifs => {
        this.notifications = notifs;
      });
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(notification: Notification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get showLayout(): boolean {
    const currentUrl = this.router.url.split('?')[0];
    const hiddenRoutes = ['/login', '/register'];
    return !hiddenRoutes.includes(currentUrl) && this.authService.isLoggedIn();
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/tasks/new')) return 'New Task';
    if (url.includes('/tasks/')) return 'Task Details';
    if (url.includes('/tasks')) return 'My Tasks';
    if (url.includes('/users')) return 'Team Members';
    if (url.includes('/profile')) return 'Settings';
    return 'TaskFlow';
  }

  getPageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Overview of your work';
    if (url.includes('/tasks/new')) return 'Create a new task';
    if (url.includes('/tasks/')) return 'View full task info';
    if (url.includes('/tasks')) return 'Manage your assignments';
    if (url.includes('/users')) return 'Manage your team';
    if (url.includes('/profile')) return 'Manage your profile';
    return 'Work Smarter';
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
  }
}
 