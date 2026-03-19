import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { User, TaskPriority, TaskStatus } from '../../models/types';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatIconModule
  ],
  template: `
    <div class="task-form-wrapper">
      <header class="form-header">
        <button mat-icon-button (click)="cancel()" class="back-btn">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <div class="title-meta">
          <h1 class="form-title">{{isEdit ? 'Edit Task' : 'Create Task'}}</h1>
          <p class="form-subtitle">Fill in the details below to set up your task.</p>
        </div>
      </header>

      <div class="main-layout">
        <div class="form-column">
          <mat-card class="bento-item form-card">
            <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="premium-form">
              <div class="form-section">
                <div class="section-title">Task Details</div>
                <mat-form-field appearance="outline" class="full-width premium-field">
                  <mat-label>Task Title</mat-label>
                  <mat-icon matPrefix>title</mat-icon>
                  <input matInput formControlName="title" placeholder="e.g. Redesign Landing Page">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width premium-field">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="5" placeholder="What needs to be done?"></textarea>
                </mat-form-field>
              </div>

              <div class="form-section">
                <div class="section-title">Date & Importance</div>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="flex-field">
                    <mat-label>Priority</mat-label>
                    <mat-icon matPrefix>grade</mat-icon>
                    <mat-select formControlName="priority">
                      <mat-option [value]="0">Low</mat-option>
                      <mat-option [value]="1">Medium</mat-option>
                      <mat-option [value]="2">High</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-field">
                    <mat-label>Status</mat-label>
                    <mat-icon matPrefix>sync_alt</mat-icon>
                    <mat-select formControlName="status">
                      <mat-option [value]="0">Waiting</mat-option>
                      <mat-option [value]="1">Working</mat-option>
                      <mat-option [value]="2">Done</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="flex-field">
                    <mat-label>Due Date</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="dueDate">
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-field">
                    <mat-label>Due Time</mat-label>
                    <mat-icon matPrefix>timer</mat-icon>
                    <input matInput type="time" formControlName="dueTime">
                  </mat-form-field>
                </div>
              </div>

              <div class="form-section">
                <div class="section-title">Assign To</div>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Who should do this?</mat-label>
                  <mat-icon matPrefix>person_pin</mat-icon>
                  <mat-select formControlName="assignedToId">
                    <mat-option *ngFor="let user of users" [value]="user.id">
                      <div class="user-item">
                        <div class="user-avatar">{{user.name[0]}}</div>
                        <span>{{user.name}}</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancel()">Cancel</button>
                <button mat-flat-button color="primary" [disabled]="taskForm.invalid" class="action-btn">
                  <mat-icon>{{isEdit ? 'done_all' : 'save'}}</mat-icon>
                  {{isEdit ? 'Update Task' : 'Save Task'}}
                </button>
              </div>
            </form>
          </mat-card>
        </div>

        <aside class="side-column">
          <div class="info-card glass-effect orange">
            <mat-icon>lightbulb</mat-icon>
            <h4>Tips</h4>
            <p>Try to set clear goals and due dates so everyone knows what to do.</p>
          </div>
          <div class="info-card glass-effect blue">
            <mat-icon>security</mat-icon>
            <h4>Automatic Saving</h4>
            <p>Your work is saved as soon as you hit the button.</p>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .task-form-wrapper { padding: 40px; max-width: 1100px; margin: 0 auto; animation: slideIn 0.4s ease; }
    
    .form-header { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 40px; }
    .back-btn { background: var(--bg-surface) !important; border: 1px solid var(--border-color) !important; color: var(--text-primary) !important; }
    .form-title { margin: 0; font-size: 2.5rem; font-weight: 900; letter-spacing: -2px; line-height: 1; }
    .form-subtitle { margin: 8px 0 0; color: var(--text-muted); font-size: 1.1rem; }

    .main-layout { display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
    .form-card { padding: 32px; }
    
    .form-section { margin-bottom: 40px; }
    .section-title { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: var(--primary); margin-bottom: 24px; padding-bottom: 8px; border-bottom: 1px solid rgba(var(--primary-rgb), 0.1); }
    
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 24px; margin-bottom: 16px; }
    .flex-field { flex: 1; }

    .user-item { display: flex; align-items: center; gap: 12px; }
    .user-avatar { width: 28px; height: 28px; border-radius: 8px; background: var(--primary-glow); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }

    .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px; padding-top: 24px; border-top: 1px solid var(--border-color); }
    .action-btn { height: 52px; border-radius: 12px !important; font-weight: 800; padding: 0 32px !important; }

    .side-column { display: flex; flex-direction: column; gap: 24px; }
    .info-card { padding: 24px; border-radius: 20px; border-left: 6px solid; }
    .info-card mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 12px; }
    .info-card h4 { margin: 0 0 8px; font-weight: 800; font-size: 1.1rem; }
    .info-card p { margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary); }

    .blue { border-left-color: var(--primary); }
    .blue mat-icon { color: var(--primary); }
    .orange { border-left-color: #f59e0b; }
    .orange mat-icon { color: #f59e0b; }

    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

    @media (max-width: 900px) {
      .main-layout { grid-template-columns: 1fr; }
      .side-column { display: none; }
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: [1, Validators.required],
    status: [0, Validators.required],
    dueDate: [new Date(), Validators.required],
    dueTime: ['12:00', Validators.required],
    assignedToId: [null as number | null, Validators.required]
  });

  isEdit = false;
  taskId?: number;
  users: User[] = [];

  ngOnInit() {
    this.userService.getUsers().subscribe(users => this.users = users);
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.taskId = +id;
      this.taskService.getTask(this.taskId).subscribe(task => {
        const date = new Date(task.dueDate);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: date,
          dueTime: `${hours}:${minutes}`,
          assignedToId: task.assignedToId
        });
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const dueDate = new Date(formValue.dueDate!);
      const [hours, minutes] = formValue.dueTime!.split(':').map(Number);
      dueDate.setHours(hours, minutes, 0, 0);

      const taskData = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        status: formValue.status,
        dueDate: dueDate,
        assignedToId: formValue.assignedToId
      };

      if (this.isEdit) {
        this.taskService.updateTask(this.taskId!, taskData).subscribe(() => this.router.navigate(['/tasks']));
      } else {
        this.taskService.createTask(taskData).subscribe(() => this.router.navigate(['/tasks']));
      }
    }
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }
}
 