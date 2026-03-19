import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { ClickSparkDirective } from '../ui-effects/click-spark.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    ClickSparkDirective
  ],
  template: `
    <div class="auth-container" appClickSpark>
      <!-- Premium Background Effects -->
      <div class="bg-gradient-mesh"></div>
      
      <div class="auth-content">
        <div class="brand-reveal">
          <div class="logo-orb accent">
             <mat-icon>sensor_occupied</mat-icon>
          </div>
          <h1 class="brand-name">TaskFlow <span>Management</span></h1>
        </div>

        <div class="auth-card">
          <div class="card-header">
            <h2>Join the Platform</h2>
            <p>Empower your team and organize your projects with precision.</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="input-grid">
              <mat-form-field appearance="outline" class="premium-field">
                <mat-label>Full Name</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="name" placeholder="John Doe">
              </mat-form-field>

              <mat-form-field appearance="outline" class="premium-field">
                <mat-label>Email Address</mat-label>
                <mat-icon matPrefix>alternate_email</mat-icon>
                <input matInput formControlName="email" type="email" placeholder="john@company.com">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="premium-field">
                <mat-label>Secure Password</mat-label>
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput formControlName="password" type="password" placeholder="••••••••">
              </mat-form-field>

            </div>

            <div *ngIf="error" class="error-pill">
              <mat-icon>warning_amber</mat-icon>
              <span>{{error}}</span>
            </div>

            <button mat-flat-button class="submit-btn" [disabled]="registerForm.invalid || loading">
              <div class="btn-content" *ngIf="!loading">
                <span>Configure My Workspace</span>
                <mat-icon>auto_awesome</mat-icon>
              </div>
              <mat-spinner diameter="24" *ngIf="loading"></mat-spinner>
            </button>
          </form>

          <footer class="card-footer">
            <span class="footer-text">Already configured?</span>
            <a routerLink="/login" class="login-link">
              Return to Login
              <mat-icon>login</mat-icon>
            </a>
          </footer>
        </div>

        <div class="auth-legal">
          <span>&copy; 2026 TaskFlow Inc.</span>
          <div class="legal-dots"></div>
          <span>Security Protocol: AES-256</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; overflow-y: auto; }
    
    .auth-container { 
      position: relative; 
      width: 100%; 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      background: #f8fafc;
      padding: 40px 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .bg-gradient-mesh {
      position: absolute;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.08) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%);
      filter: blur(100px);
    }

    .auth-content {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 520px;
      padding: 0 24px;
      animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .brand-reveal { text-align: center; margin-bottom: 32px; }
    .logo-orb {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 20px 40px rgba(37, 99, 235, 0.2);
    }
    .logo-orb.accent { background: #1e293b; }
    .logo-orb mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .brand-name { font-size: 1.4rem; font-weight: 900; letter-spacing: -1px; margin: 0; color: #1e293b; }
    .brand-name span { color: #64748b; font-weight: 600; letter-spacing: 0; font-size: 0.95rem; margin-top: 4px; display: block; }

    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 36px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 40px 80px -20px rgba(0,0,0,0.08);
    }

    .card-header h2 { font-size: 2.2rem; font-weight: 950; margin: 0; letter-spacing: -2px; color: #0f172a; line-height: 1.1; }
    .card-header p { margin: 12px 0 32px; color: #64748b; font-size: 1rem; font-weight: 500; line-height: 1.5; }

    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .input-grid { display: flex; flex-direction: column; gap: 4px; }
    .premium-field { width: 100%; }
    
    ::ng-deep .premium-field .mdc-text-field--outlined {
      border-radius: 16px !important;
      background: #f8fafc !important;
      border-color: #f1f5f9 !important;
      height: 60px !important;
    }
    
    ::ng-deep .premium-field .mdc-notched-outline__leading,
    ::ng-deep .premium-field .mdc-notched-outline__notch,
    ::ng-deep .premium-field .mdc-notched-outline__trailing {
      border-color: #e2e8f0 !important;
    }

    ::ng-deep .premium-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .premium-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .premium-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #2563eb !important;
      border-width: 2px !important;
    }

    .premium-field mat-icon { color: #94a3b8; font-size: 20px; width: 20px; height: 20px; margin-right: 12px; transition: color 0.3s; }
    ::ng-deep .premium-field.mat-focused mat-icon { color: #2563eb; }

    .submit-btn {
      height: 60px;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%) !important;
      color: white !important;
      border-radius: 18px !important;
      margin-top: 24px;
      font-weight: 850 !important;
      font-size: 1.05rem !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2) !important;
    }

    .submit-btn:not([disabled]):hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(37, 99, 235, 0.3) !important;
    }

    .btn-content { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .btn-content mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .card-footer { text-align: center; margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
    .footer-text { color: #64748b; font-weight: 500; font-size: 0.95rem; }
    .login-link { 
      color: #2563eb; 
      text-decoration: none; 
      font-weight: 800; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 8px; 
      transition: color 0.3s;
    }
    .login-link:hover { color: #1d4ed8; text-decoration: underline; }
    .login-link mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .error-pill {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      margin: 12px 0;
      animation: shake 0.4s both;
    }

    .auth-legal {
      margin-top: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .legal-dots { width: 4px; height: 4px; background: #e2e8f0; border-radius: 50%; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['User', Validators.required]
  });

  loading = false;
  error = '';

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      this.authService.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/login']),
        error: err => {
          this.error = err.error?.message || 'Configuration failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}
 