import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/types';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatIconModule
  ],
  template: `
    <div class="user-dialog">
      <header class="dialog-header">
         <div class="header-icon" [class.edit-mode]="data.user">
           <mat-icon>{{ data.user ? 'person_search' : 'person_add' }}</mat-icon>
         </div>
         <div class="header-content">
           <h2 class="dialog-title">{{ data.user ? 'Edit Member' : 'Add New Member' }}</h2>
           <p class="dialog-subtitle">{{ data.user ? 'Change member info or their role.' : 'Create an account for a new team member.' }}</p>
         </div>
      </header>

      <mat-dialog-content class="dialog-body">
        <form [formGroup]="userForm" class="premium-form">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <input matInput formControlName="name" placeholder="Enter their name">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email Address</mat-label>
            <mat-icon matPrefix>alternate_email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="example@company.com">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field" *ngIf="!data.user">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input matInput type="password" formControlName="password">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Role</mat-label>
            <mat-icon matPrefix>admin_panel_settings</mat-icon>
            <mat-select formControlName="role">
              <mat-option value="Employee">Team Member</mat-option>
              <mat-option value="Admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button mat-dialog-close class="cancel-btn">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="userForm.invalid" (click)="onSubmit()" class="save-btn" appClickSpark>
          <mat-icon>save</mat-icon>
          {{ data.user ? 'Save Changes' : 'Create Account' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-dialog { width: 540px; max-width: 100%; overflow: hidden; background: white; border-radius: 28px; }
    .dialog-header { display: flex; align-items: center; gap: 24px; padding: 40px 40px 20px; }
    
    .header-icon { 
      width: 64px; 
      height: 64px; 
      border-radius: 20px; 
      background: #eff6ff; 
      color: var(--primary); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }
    .header-icon.edit-mode { background: #fff7ed; color: #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1); }
    .header-icon mat-icon { font-size: 32px; width: 32px; height: 32px; }
    
    .dialog-title { margin: 0; font-size: 1.8rem; font-weight: 900; letter-spacing: -1.5px; line-height: 1; }
    .dialog-subtitle { margin: 8px 0 0; color: var(--text-muted); font-size: 1rem; font-weight: 600; }
    
    .dialog-body { padding: 20px 40px !important; }
    .premium-form { display: flex; flex-direction: column; gap: 4px; }
    .form-field { width: 100%; }

    .dialog-actions { padding: 20px 40px 40px !important; gap: 16px; align-items: center; }
    .save-btn { height: 54px; border-radius: 16px !important; font-weight: 800; padding: 0 32px !important; font-size: 1rem; }
    .cancel-btn { height: 54px; font-weight: 800; color: var(--text-muted); border-radius: 16px !important; }
  `]
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  
  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['Employee', Validators.required]
  });

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User | null }
  ) {
    if (data?.user) {
      this.userForm.patchValue(data.user);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.get('password')?.setValidators(Validators.required);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      if (this.data?.user) {
        this.userService.updateUser(this.data.user.id, userData).subscribe(() => this.dialogRef.close(true));
      } else {
        this.userService.createUser(userData).subscribe(() => this.dialogRef.close(true));
      }
    }
  }
}
 