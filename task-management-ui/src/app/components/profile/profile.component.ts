import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-page-wrapper">
      <div class="header-section">
        <h1 class="page-title">My Profile</h1>
        <p class="subtitle">Change your account info and password</p>
      </div>

      <div class="profile-layout">
        <div class="profile-sidebar">
          <mat-card class="glass-card user-identity">
            <div class="avatar-large">{{currentUser?.name?.[0] || 'U'}}</div>
            <h2 class="user-display-name">{{currentUser?.name}}</h2>
            <span class="user-role-badge" [ngClass]="currentUser?.role?.toLowerCase()">{{currentUser?.role}}</span>
            
            <mat-divider></mat-divider>
            
            <div class="system-meta">
              <div class="meta-item">
                <mat-icon>terminal</mat-icon>
                <span>User ID: #{{currentUser?.id}}</span>
              </div>
              <div class="meta-item">
                <mat-icon>verified</mat-icon>
                <span>Verified Account</span>
              </div>
            </div>
          </mat-card>
        </div>

        <div class="profile-main">
          <mat-card class="glass-card settings-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>settings</mat-icon>
              <mat-card-title>Account Settings</mat-card-title>
              <mat-card-subtitle>Changes will save for your next visit</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="settings-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Display Name</mat-label>
                    <mat-icon matPrefix>person</mat-icon>
                    <input matInput formControlName="name">
                    <mat-hint>This is how others will see you</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email Address</mat-label>
                    <mat-icon matPrefix>alternate_email</mat-icon>
                    <input matInput type="email" formControlName="email">
                    <mat-hint>Used for logging in and messages</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Security Key (New Password)</mat-label>
                    <mat-icon matPrefix>key</mat-icon>
                    <input matInput type="password" formControlName="newPassword" placeholder="••••••••">
                    <mat-hint>Leave this blank if you don't want to change it</mat-hint>
                  </mat-form-field>
                </div>

                <div class="footer-actions">
                  <button mat-flat-button color="primary" [disabled]="profileForm.invalid || isLoading" class="save-btn">
                     <mat-icon *ngIf="!isLoading">save</mat-icon>
                     <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                     {{ isLoading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page-wrapper { padding: 40px 24px; max-width: 1200px; margin: 0 auto; }
    
    .header-section { margin-bottom: 40px; }
    .profile-container { padding: 32px; max-width: 1200px; margin: 0 auto; transition: all 0.3s ease; }
    .page-title { margin: 0 0 40px; font-size: 2.8rem; font-weight: 800; color: var(--text-primary); letter-spacing: -2px; }

    .profile-layout { display: grid; grid-template-columns: 380px 1fr; gap: 40px; align-items: start; }
    
    .glass-card { background: var(--bg-surface) !important; border-radius: 32px !important; border: 1px solid var(--border-color) !important; box-shadow: var(--card-shadow) !important; padding: 40px !important; }
    
    .user-identity { text-align: center; }
    .avatar-large { 
      width: 140px; 
      height: 140px; 
      border-radius: 48px; 
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); 
      color: white; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 4rem; 
      font-weight: 800; 
      margin: 0 auto 32px; 
      box-shadow: 0 25px 30px -10px rgba(99,102,241,0.3); 
    }
    .user-display-name { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0 0 16px; letter-spacing: -0.5px; }
    
    .user-role-badge { padding: 8px 20px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; }
    .admin { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .employee { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    mat-divider { margin: 32px 0; border-top-color: var(--border-color); }
    
    .system-meta { display: flex; flex-direction: column; gap: 16px; text-align: left; }
    .meta-item { display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 0.95rem; font-weight: 600; }
    .meta-item mat-icon { font-size: 1.3rem; width: 22px; height: 22px; color: var(--primary); }

    .settings-card mat-card-header { margin-bottom: 40px; padding: 0; }
    .settings-card mat-card-title { font-weight: 900; font-size: 1.6rem; color: var(--text-primary); letter-spacing: -0.5px; }
    
    .full-width { width: 100%; margin-bottom: 28px; }
    .footer-actions { display: flex; justify-content: flex-end; margin-top: 32px; }
    .save-btn { 
      height: 56px; 
      padding: 0 40px !important; 
      border-radius: 16px !important; 
      font-weight: 800; 
      box-shadow: 0 10px 15px -3px var(--primary-glow) !important; 
      background: var(--primary) !important;
      font-size: 1.1rem;
    }

    @media (max-width: 1000px) {
      .profile-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  currentUser: any;
  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['']
  });

  isLoading = false;

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email
      });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.userService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully!', 'Close', { 
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Something went wrong. Please try again.', 'Close', { duration: 4000 });
          this.isLoading = false;
        }
      });
    }
  }
}
 