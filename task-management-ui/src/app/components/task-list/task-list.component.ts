import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ClickSparkDirective } from '../ui-effects/click-spark.directive';
import { Task, TaskPriority, TaskStatus, User } from '../../models/types';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatCardModule, 
    MatButtonModule, MatIconModule, MatChipsModule,
    MatFormFieldModule, MatSelectModule, FormsModule, MatTooltipModule,
    ClickSparkDirective
  ],
  template: `
    <div class="task-list-wrapper">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-left">
          <div class="breadcrumb">
            <mat-icon>assignment</mat-icon>
            <span>Workspace / <strong>My Tasks</strong></span>
          </div>
          <h1 class="page-title">All Tasks</h1>
        </div>
        <div class="header-right">
          <button mat-flat-button color="primary" routerLink="/tasks/new" class="create-btn" appClickSpark>
            <mat-icon>add</mat-icon> Add Task
          </button>
        </div>
      </header>

      <!-- Quick Stats & Filters Layer -->
      <div class="dashboard-controls">
        <div class="info-strip">
          <div class="strip-item">
            <span class="label">Total Tasks</span>
            <span class="value">{{tasks.length}}</span>
          </div>
          <div class="strip-divider"></div>
          <div class="strip-item">
            <span class="label">Waiting</span>
            <span class="value">{{getTaskCountByStatus(0)}}</span>
          </div>
          <div class="strip-divider"></div>
          <div class="strip-item">
            <span class="label">Finished</span>
            <span class="value text-green">{{getTaskCountByStatus(2)}}</span>
          </div>
        </div>

        <div class="filters-bar glass-effect">
          <div class="filter-group">
            <mat-icon>filter_list</mat-icon>
            <mat-form-field appearance="outline" class="filter-select">
              <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadTasks()" placeholder="All Status">
                <mat-option [value]="undefined">All Status</mat-option>
                <mat-option [value]="0">Pending</mat-option>
                <mat-option [value]="1">In Progress</mat-option>
                <mat-option [value]="2">Completed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-select">
              <mat-select [(ngModel)]="filterPriority" (selectionChange)="loadTasks()" placeholder="All Priority">
                <mat-option [value]="undefined">All Priority</mat-option>
                <mat-option [value]="0">Low</mat-option>
                <mat-option [value]="1">Medium</mat-option>
                <mat-option [value]="2">High</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-select" *ngIf="isAdmin()">
              <mat-select [(ngModel)]="filterUser" (selectionChange)="loadTasks()" placeholder="All Members">
                <mat-option [value]="undefined">All Members</mat-option>
                <mat-option *ngFor="let user of users" [value]="user.id">{{user.name}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <button mat-icon-button (click)="loadTasks()" class="refresh-btn">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Main Content Table -->
      <div class="table-container bento-item">
        <div class="table-responsive">
          <mat-table [dataSource]="tasks" class="premium-table">
            <!-- Title -->
            <ng-container matColumnDef="title">
              <mat-header-cell *matHeaderCellDef> Task Name </mat-header-cell>
              <mat-cell *matCellDef="let task">
                <div class="title-cell" [routerLink]="['/tasks', task.id]">
                  <div class="priority-indicator" [ngClass]="getPriorityClass(task.priority)"></div>
                  <div class="title-stack">
                    <span class="main-title">{{task.title}}</span>
                    <span class="sub-id">#{{task.id}}</span>
                  </div>
                </div>
              </mat-cell>
            </ng-container>

            <!-- Priority -->
            <ng-container matColumnDef="priority">
              <mat-header-cell *matHeaderCellDef> Priority </mat-header-cell>
              <mat-cell *matCellDef="let task">
                <span class="pill-badge" [ngClass]="getPriorityClass(task.priority)">
                  {{getPriorityLabel(task.priority)}}
                </span>
              </mat-cell>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <mat-header-cell *matHeaderCellDef> Status </mat-header-cell>
              <mat-cell *matCellDef="let task">
                <span class="status-badge" [ngClass]="getStatusClass(task.status)">
                  {{getStatusLabel(task.status)}}
                </span>
              </mat-cell>
            </ng-container>

            <!-- Due Date -->
            <ng-container matColumnDef="dueDate">
              <mat-header-cell *matHeaderCellDef> Due Date </mat-header-cell>
              <mat-cell *matCellDef="let task">
                <div class="deadline-cell" [ngClass]="{'overdue': isOverdue(task.dueDate) && task.status !== 2}">
                  <span class="date">{{task.dueDate | date:'mediumDate'}}</span>
                  <span class="overdue-dot" *ngIf="isOverdue(task.dueDate) && task.status !== 2"></span>
                </div>
              </mat-cell>
            </ng-container>

            <!-- Assigned To -->
            <ng-container matColumnDef="assignedTo">
              <mat-header-cell *matHeaderCellDef> Assignee </mat-header-cell>
              <mat-cell *matCellDef="let task">
                <div class="assignee-cell">
                  <div class="mini-avatar">{{(task.assignedToName || '?')[0]}}</div>
                  <span class="name">{{task.assignedToName || 'Nobody'}}</span>
                </div>
              </mat-cell>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef> </mat-header-cell>
              <mat-cell *matCellDef="let task">
                <div class="actions-stack">
                  <button mat-icon-button [routerLink]="['/tasks', task.id]" matTooltip="View">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" [routerLink]="['/tasks', task.id, 'edit']" *ngIf="isCreatorOrAdmin(task)" matTooltip="Edit">
                    <mat-icon>edit_note</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteTask(task.id)" *ngIf="isCreatorOrAdmin(task)" matTooltip="Remove">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>
        </div>

        <div class="empty-state" *ngIf="tasks.length === 0">
          <div class="empty-icon">
             <mat-icon>inbox</mat-icon>
          </div>
          <h3>All clear!</h3>
          <p>No tasks found. Try changing your filters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-list-wrapper { padding: 0; max-width: 1400px; margin: 0 auto; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-muted); font-weight: 700; margin-bottom: 12px; }
    .breadcrumb mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .page-title { margin: 0; font-size: 3.2rem; font-weight: 900; letter-spacing: -2.5px; line-height: 1; }
    .create-btn { height: 52px; border-radius: 14px !important; font-weight: 800; padding: 0 28px !important; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2) !important; }

    /* Info Strip */
    .dashboard-controls { margin-bottom: 40px; display: flex; flex-direction: column; gap: 24px; }
    .info-strip { display: flex; gap: 28px; }
    .strip-item { flex: 1; padding: 24px 32px; border-radius: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
    .strip-item .label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1.5px; opacity: 0.8; }
    .strip-item .value { font-size: 2.4rem; font-weight: 900; color: var(--text-primary); letter-spacing: -1px; }
    .text-green { color: #10b981; }

    /* Filter Bar */
    .filters-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-radius: 24px; border: 1px solid var(--border-color); background: white; }
    .filter-group { display: flex; align-items: center; gap: 16px; flex: 1; }
    .filter-group mat-icon { color: var(--text-muted); font-size: 20px; width: 20px; height: 20px; }
    .filter-select { width: 200px; }
    
    ::ng-deep .filter-select .mat-mdc-text-field-wrapper { height: 48px !important; background: #f8fafc !important; }

    /* Premium Table */
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
    
    mat-cell { padding: 20px 28px !important; color: var(--text-primary); border-bottom: 1px solid #f8fafc; }
    mat-row { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; }
    mat-row:hover { background: rgba(var(--primary-rgb), 0.02); }

    /* Table Cells */
    .title-cell { display: flex; align-items: center; gap: 18px; }
    .priority-indicator { width: 4px; height: 36px; border-radius: 10px; }
    .priority-low { background: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
    .priority-medium { background: #f59e0b; box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); }
    .priority-high { background: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
    
    .title-stack { display: flex; flex-direction: column; }
    .main-title { font-weight: 800; font-size: 1.05rem; color: #1e293b; }
    .sub-id { font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-weight: 600; }

    .pill-badge { padding: 6px 12px; border-radius: 10px; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; width: fit-content; }
    .status-badge { padding: 6px 14px; border-radius: 12px; font-weight: 900; font-size: 0.75rem; border: 1px solid var(--border-color); text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.status-todo { background: #f1f5f9; color: #475569; }
    .status-badge.status-started { background: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
    .status-badge.status-completed { background: #ecfdf5; color: #047857; border-color: #d1fae5; }

    .deadline-cell { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 0.95rem; }
    .overdue { color: #ef4444; }
    .overdue-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; }

    .assignee-cell { display: flex; align-items: center; gap: 14px; }
    .mini-avatar { width: 36px; height: 36px; border-radius: 12px; background: #f1f5f9; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.9rem; border: 1px solid #e2e8f0; }
    .assignee-cell .name { font-weight: 700; font-size: 0.95rem; }
    
    .actions-stack { display: flex; gap: 8px; }
    .actions-stack button { background: #f8fafc !important; border: 1px solid #f1f5f9 !important; border-radius: 10px !important; }
    .actions-stack button:hover { background: white !important; transform: scale(1.1); box-shadow: 0 4px 8px rgba(0,0,0,0.05); }

    .empty-state { padding: 100px 40px; text-align: center; }
    .empty-icon mat-icon { font-size: 80px; width: 80px; height: 80px; color: var(--text-muted); opacity: 0.2; }
    .empty-state h3 { margin: 24px 0 8px; font-size: 1.8rem; font-weight: 900; letter-spacing: -1px; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  tasks: Task[] = [];
  users: User[] = [];
  displayedColumns = ['title', 'priority', 'status', 'dueDate', 'assignedTo', 'actions'];

  filterStatus?: TaskStatus;
  filterPriority?: TaskPriority;
  filterUser?: number;

  ngOnInit() {
    this.loadTasks();
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  loadTasks() {
    this.taskService.getTasks(this.filterStatus, this.filterPriority, this.filterUser)
      .subscribe(tasks => this.tasks = tasks);
  }

  getTaskCountByStatus(status: number): number {
    return this.tasks.filter(t => t.status === status).length;
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
    }
  }

  isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'Admin';
  }

  isCreatorOrAdmin(task: Task): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'Admin' || user?.id === task.createdById;
  }

  getPriorityLabel(priority: number) {
    return ['Low', 'Medium', 'High'][priority];
  }

  getPriorityClass(priority: number) {
    return ['priority-low', 'priority-medium', 'priority-high'][priority];
  }

  getStatusLabel(status: number) {
    return ['Pending', 'In Progress', 'Completed'][status];
  }

  getStatusClass(status: number) {
    return ['status-todo', 'status-started', 'status-completed'][status];
  }

  isOverdue(dueDate: Date) {
    return new Date(dueDate) < new Date();
  }
}
 