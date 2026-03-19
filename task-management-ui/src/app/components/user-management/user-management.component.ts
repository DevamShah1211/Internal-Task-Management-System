import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { User } from '../../models/types';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatTooltipModule],
  template: `
    <div class="user-hub-wrapper">
      <!-- Header -->
      <header class="hub-header">
        <div class="header-content">
          <div class="hub-breadcrumb">
            <mat-icon>security</mat-icon>
            <span>Admin / <strong>Team Management</strong></span>
          </div>
          <h1 class="hub-title">Our Team</h1>
          <p class="hub-subtitle">Manage your team and their account details.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()" class="add-btn" appClickSpark>
          <mat-icon>person_add</mat-icon> Add Member
        </button>
      </header>

      <!-- Stats Row -->
      <div class="hub-stats">
        <div class="stat-tile">
          <span class="tile-label">Total Team Members</span>
          <span class="tile-value">{{users.length}}</span>
        </div>
        <div class="stat-tile blue">
          <span class="tile-label">Admins</span>
          <span class="tile-value">{{getAdminCount()}}</span>
        </div>
      </div>

      <!-- User List Card -->
      <div class="table-container bento-item">
        <div class="table-responsive">
          <mat-table [dataSource]="users" class="premium-table">
            <!-- ID -->
            <ng-container matColumnDef="id">
              <mat-header-cell *matHeaderCellDef> User # </mat-header-cell>
              <mat-cell *matCellDef="let user"> 
                 <span class="id-badge">#{{user.id}}</span>
              </mat-cell>
            </ng-container>

            <!-- Profile Info -->
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef> Profile </mat-header-cell>
              <mat-cell *matCellDef="let user"> 
                 <div class="member-profile">
                   <div class="member-avatar" [ngClass]="user.role.toLowerCase()">{{user.name[0]}}</div>
                   <div class="member-info">
                     <span class="full-name">{{user.name}}</span>
                     <span class="email-addr">{{user.email}}</span>
                   </div>
                 </div>
              </mat-cell>
             </ng-container>

            <!-- Role badge -->
            <ng-container matColumnDef="role">
              <mat-header-cell *matHeaderCellDef> Role </mat-header-cell>
              <mat-cell *matCellDef="let user"> 
                <span class="member-role-badge" [ngClass]="user.role.toLowerCase()">
                  {{user.role}}
                </span>
              </mat-cell>
            </ng-container>

            <!-- Standard Actions -->
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef> </mat-header-cell>
              <mat-cell *matCellDef="let user">
                <div class="cell-actions">
                  <button mat-icon-button (click)="openForm(user)" matTooltip="Edit Member" color="primary">
                    <mat-icon>settings</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteUser(user.id)" [disabled]="user.role === 'Admin'" matTooltip="Remove Member" color="warn">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>
        </div>

        <div class="hub-empty" *ngIf="users.length === 0">
           <mat-icon>people_outline</mat-icon>
           <h3>No one here yet</h3>
           <p>Start by adding your first team member.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-hub-wrapper { padding: 0; max-width: 1400px; margin: 0 auto; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    
    .hub-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
    .hub-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-muted); font-weight: 700; margin-bottom: 12px; }
    .hub-breadcrumb mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .hub-title { margin: 0; font-size: 3.2rem; font-weight: 900; letter-spacing: -2.5px; line-height: 1; }
    .hub-subtitle { margin: 12px 0 0; color: var(--text-muted); font-size: 1.15rem; font-weight: 500; }
    
    .add-btn { height: 52px; border-radius: 14px !important; font-weight: 800; padding: 0 28px !important; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2) !important; }

    .hub-stats { display: flex; gap: 28px; margin-bottom: 40px; }
    .stat-tile { flex: 1; padding: 24px 32px; border-radius: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
    .tile-label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1.5px; opacity: 0.8; }
    .tile-value { font-size: 2.4rem; font-weight: 900; color: var(--text-primary); letter-spacing: -1px; }
    .stat-tile.blue { border-left: 6px solid var(--primary); }

    /* Premium Table Container */
    .table-container { background: white; border-radius: 32px; border: 1px solid var(--border-color); box-shadow: 0 10px 40px rgba(0,0,0,0.04); overflow: hidden; }
    .premium-table { background: transparent; width: 100%; }
    
    mat-header-cell { 
      padding: 28px !important; 
      font-size: 0.75rem; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      color: var(--text-muted); 
      background: #fafbfc;
      border-bottom: 1px solid var(--border-color);
    }
    
    mat-cell { padding: 20px 28px !important; border-bottom: 1px solid #f8fafc; }

    .id-badge { font-family: 'JetBrains Mono', monospace; font-weight: 800; background: var(--bg-main); padding: 4px 10px; border-radius: 8px; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-color); }

    .member-profile { display: flex; align-items: center; gap: 18px; }
    .member-avatar { width: 48px; height: 48px; border-radius: 16px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .member-avatar.admin { background: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .member-avatar.employee { background: var(--primary); }
    
    .member-info { display: flex; flex-direction: column; }
    .full-name { font-weight: 800; font-size: 1.05rem; color: var(--text-primary); }
    .email-addr { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }

    .member-role-badge { padding: 6px 14px; border-radius: 10px; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; width: fit-content; }
    .member-role-badge.admin { background: rgba(30, 41, 59, 0.1); color: #1e293b; }
    .member-role-badge.employee { background: var(--primary-glow); color: var(--primary); }

    .cell-actions { display: flex; gap: 8px; }
    
    .hub-empty { padding: 80px; text-align: center; }
    .hub-empty mat-icon { font-size: 64px; height: 64px; width: 64px; color: var(--text-muted); opacity: 0.3; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  users: User[] = [];
  displayedColumns = ['id', 'name', 'role', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === 'Admin').length;
  }

  openForm(user?: User) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      maxWidth: '500px',
      width: '95%',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}
 