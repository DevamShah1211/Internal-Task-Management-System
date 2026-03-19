import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskStatus } from '../../models/types';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatButtonModule, 
    MatIconModule, MatDividerModule, MatFormFieldModule, 
    MatInputModule, FormsModule, MatCheckboxModule, MatTooltipModule
  ],
  template: `
    <div class="task-detail-wrapper" *ngIf="task">
      <!-- Top Action Bar -->
      <nav class="detail-nav">
        <div class="nav-left">
          <button mat-icon-button routerLink="/tasks" class="back-pill">
            <mat-icon>west</mat-icon>
          </button>
          <div class="path">
            <span>Tasks</span>
            <mat-icon>chevron_right</mat-icon>
            <span>Tasks / <strong>Task Details</strong></span>
          </div>
        </div>
        <div class="nav-right">
          <button mat-flat-button color="primary" [routerLink]="['/tasks', task.id, 'edit']" *ngIf="isCreatorOrAdmin()" class="edit-btn">
            <mat-icon>edit_calendar</mat-icon> Edit Task
          </button>
        </div>
      </nav>

      <!-- Main Body -->
      <main class="detail-main">
        <!-- Content Column -->
        <div class="content-col">
          <header class="detail-header">
            <div class="header-tags">
               <span class="priority-badge" [ngClass]="getPriorityClass(task.priority)">
                 {{getPriorityLabel(task.priority)}} Priority
               </span>
               <span class="id-tag">#TASK-{{task.id}}</span>
            </div>
            <h1 class="task-title">{{task.title}}</h1>
            
            <div class="quick-actions" *ngIf="isAssignee()">
               <button *ngIf="task.status === TaskStatus.Pending" mat-flat-button color="accent" (click)="updateStatus(TaskStatus.InProgress)" class="pulse-btn">
                 <mat-icon>bolt</mat-icon> Start Work
               </button>
               <button *ngIf="task.status === TaskStatus.InProgress" mat-flat-button class="success-btn" (click)="updateStatus(TaskStatus.Completed)">
                 <mat-icon>done_all</mat-icon> Mark Completed
               </button>
            </div>
          </header>

          <!-- Core Description -->
          <section class="detail-section bento-item">
            <div class="section-head">
              <mat-icon>description</mat-icon>
              <h3>Description</h3>
              <p>Details about what needs to be done.</p>
            </div>
            <p class="description-body">{{task.description || 'No description provided for this task.'}}</p>
          </section>

          <!-- Subtasks -->
          <section class="detail-section bento-item">
            <div class="section-head">
              <mat-icon>fact_check</mat-icon>
              <h3>Checklist</h3>
              <p>Small steps to finish the task.</p>
            </div>
            <div class="objectives-list">
              <div *ngFor="let st of task.subtasks" class="objective-item" [class.done]="st.isCompleted">
                <mat-checkbox [checked]="st.isCompleted" (change)="toggleSubtask(st)">
                  {{st.title}}
                </mat-checkbox>
                <span class="st-status">{{st.isCompleted ? 'Done' : 'Waiting'}}</span>
              </div>
            </div>
            <div class="obj-adder" *ngIf="isCreatorOrAdmin()">
              <input type="text" [(ngModel)]="newSubtaskTitle" (keyup.enter)="addSubtask()" placeholder="Add a new step...">
              <button (click)="addSubtask()" [disabled]="!newSubtaskTitle.trim()">Add</button>
            </div>
          </section>

          <!-- Feedback / Comments -->
          <section class="detail-section bento-item">
            <div class="section-head">
              <mat-icon>forum</mat-icon>
              <h3>Chat & Comments</h3>
              <p>Talk with your team about this task.</p>
            </div>
            <div class="feed-list">
              <div *ngFor="let c of task.comments" class="feed-item">
                <div class="feed-avatar">{{c.userName[0]}}</div>
                <div class="feed-content">
                  <div class="feed-meta">
                    <strong>{{c.userName}}</strong>
                    <span class="time">{{c.createdAt | date:'short'}}</span>
                  </div>
                  <p class="f-text">{{c.comment}}</p>
                </div>
              </div>
            </div>
            <div class="feed-input">
              <textarea [(ngModel)]="newComment" placeholder="Write a message or update..."></textarea>
              <button mat-flat-button color="primary" (click)="addComment()" [disabled]="!newComment.trim()">Send Message</button>
            </div>
          </section>
        </div>

        <!-- Meta Sidebar -->
        <aside class="meta-col">
          <div class="meta-panel bento-item glass-effect">
            <div class="meta-header">Details</div>
            
            <div class="meta-item">
              <span class="m-label">Created by</span>
              <div class="sh-pill">
                <div class="sh-avatar creator">{{task.createdByName[0] || '?'}}</div>
                <span>{{task.createdByName}}</span>
              </div>
            </div>

            <div class="meta-group">
              <label>Current Status</label>
              <div class="status-indicator" [ngClass]="getStatusLabel(task.status).toLowerCase().replace(' ', '')">
                <span class="blink"></span>
                {{getStatusLabel(task.status)}}
              </div>
            </div>

            <div class="meta-group">
              <label>Due Date</label>
              <div class="date-box">
                <mat-icon>event_note</mat-icon>
                <span>{{task.dueDate | date:'longDate'}}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="stakeholder">
              <label>Created by</label>
              <div class="sh-pill">
                <div class="sh-avatar creator">{{task.createdByName[0] || '?'}}</div>
                <span>{{task.createdByName}}</span>
              </div>
            </div>

            <div class="stakeholder">
              <label>Primary Owner</label>
              <div class="sh-pill">
                <div class="sh-avatar owner">{{task.assignedToName[0] || '?'}}</div>
                <span>{{task.assignedToName || 'Unassigned'}}</span>
              </div>
            </div>
          </div>
          
          <div class="hint-panel glass-effect blue">
             <mat-icon>info</mat-icon>
             <p>All interactions with this task are encrypted and logged for compliance.</p>
          </div>
        </aside>
      </main>
    </div>
  `,
  styles: [`
    .task-detail-wrapper { padding: 0; max-width: 1400px; margin: 0 auto; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    
    /* Nav */
    .detail-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
    .nav-left { display: flex; align-items: center; gap: 24px; }
    .back-pill { background: white !important; color: var(--text-primary) !important; border: 1px solid var(--border-color) !important; border-radius: 14px !important; width: 44px !important; height: 44px !important; }
    .path { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 700; color: var(--text-muted); }
    .path .active { color: var(--text-primary); }
    .path mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Main Layout */
    .detail-main { display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
    
    .detail-header { margin-bottom: 48px; }
    .header-tags { display: flex; gap: 14px; align-items: center; margin-bottom: 20px; }
    .priority-badge { padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
    .priority-low { background: #ecfdf5; color: #047857; }
    .priority-medium { background: #fffbeb; color: #b45309; }
    .priority-high { background: #fef2f2; color: #b91c1c; }
    .id-tag { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; }
    
    .task-title { margin: 0; font-size: 4rem; font-weight: 900; letter-spacing: -3px; line-height: 1; margin-bottom: 32px; color: #0f172a; }
    
    .quick-actions { display: flex; gap: 16px; }
    .success-btn { background: #10b981 !important; color: white !important; font-weight: 800 !important; border-radius: 14px !important; height: 52px; padding: 0 28px !important; }
    .pulse-btn { height: 52px; border-radius: 14px !important; font-weight: 800; padding: 0 28px !important; }

    /* Sections */
    .detail-section { padding: 40px; margin-bottom: 32px; background: white; border-radius: 32px; border: 1px solid var(--border-color); box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
    .section-head { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
    .section-head mat-icon { color: var(--primary); font-size: 24px; width: 24px; height: 24px; }
    .section-head h3 { margin: 0; font-size: 1.4rem; font-weight: 900; letter-spacing: -0.5px; }
    
    .description-body { font-size: 1.25rem; line-height: 1.8; color: #334155; margin: 0; font-weight: 500; }

    /* Objectives */
    .objectives-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .objective-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; transition: all 0.2s; }
    .objective-item.done { opacity: 0.6; background: rgba(var(--primary-rgb), 0.02); }
    .st-status { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
    
    .obj-adder { display: flex; background: #f1f5f9; border-radius: 16px; overflow: hidden; height: 56px; border: 1px solid #e2e8f0; }
    .obj-adder input { flex: 1; border: none; padding: 0 20px; background: transparent; font-weight: 600; font-size: 1rem; }
    .obj-adder button { background: white; border: none; border-left: 1px solid #e2e8f0; padding: 0 24px; font-weight: 800; cursor: pointer; transition: all 0.2s; color: var(--primary); }
    .obj-adder button:hover { background: var(--primary); color: white; }

    /* Feed/Collaboration */
    .feed-list { display: flex; flex-direction: column; gap: 28px; margin-bottom: 40px; }
    .feed-item { display: flex; gap: 20px; }
    .feed-avatar { width: 44px; height: 44px; border-radius: 14px; background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; flex-shrink: 0; }
    .feed-content { flex: 1; }
    .feed-meta { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px; }
    .feed-meta strong { font-size: 1rem; color: #0f172a; font-weight: 800; }
    .feed-meta .time { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    .f-text { margin: 0; color: #475569; line-height: 1.6; font-size: 1.1rem; font-weight: 500; }
    
    .feed-input { display: flex; flex-direction: column; gap: 20px; }
    .feed-input textarea { width: 100%; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; background: #f8fafc; min-height: 120px; resize: none; font-weight: 600; font-size: 1rem; }
    .feed-input button { align-self: flex-end; border-radius: 14px !important; height: 48px; padding: 0 32px !important; font-weight: 800; }

    /* Meta Sidebar */
    .meta-panel { padding: 40px; display: flex; flex-direction: column; gap: 32px; background: white; border-radius: 32px; border: 1px solid var(--border-color); box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
    .meta-panel h3 { margin: 0; font-size: 1.25rem; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .meta-group { display: flex; flex-direction: column; gap: 10px; }
    .meta-group label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1.5px; }
    
    .status-indicator { display: flex; align-items: center; gap: 12px; font-weight: 900; padding: 10px 20px; border-radius: 14px; background: #f8fafc; width: fit-content; font-size: 0.95rem; border: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-indicator.pending { color: #d97706; }
    .status-indicator.inprogress { color: #2563eb; }
    .status-indicator.completed { color: #059669; }
    
    .blink { width: 10px; height: 10px; border-radius: 50%; background: currentColor; animation: blink 1.5s infinite; }

    .date-box { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #334155; font-size: 1.05rem; }
    .date-box mat-icon { color: var(--primary); }

    .stakeholder { display: flex; flex-direction: column; gap: 10px; }
    .stakeholder label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1.5px; }
    .sh-pill { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 16px; background: #f8fafc; border: 1px solid #f1f5f9; }
    .sh-pill span { font-weight: 800; font-size: 1rem; color: #1e293b; }
    .sh-avatar { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 0.9rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
    .sh-avatar.creator { background: #0f172a; }
    .sh-avatar.owner { background: var(--primary); }

    .hint-panel { padding: 24px; border-radius: 24px; display: flex; align-items: flex-start; gap: 16px; margin-top: 32px; border: 1px solid #dbeafe; background: #eff6ff; }
    .hint-panel mat-icon { color: #3b82f6; }
    .hint-panel p { margin: 0; font-size: 0.9rem; color: #1e40af; font-weight: 600; line-height: 1.5; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1100px) {
      .detail-main { grid-template-columns: 1fr; }
      .meta-col { order: -1; }
      .task-title { font-size: 3rem; }
    }
  `]
})
export class TaskDetailComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  public TaskStatus = TaskStatus;
  task?: Task;
  newComment = '';
  newSubtaskTitle = '';

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadTask(id);
  }

  loadTask(id: number) {
    this.taskService.getTask(id).subscribe(task => this.task = task);
  }

  addComment() {
    if (this.newComment.trim()) {
      this.taskService.addComment(this.task!.id, this.newComment).subscribe(() => {
        this.newComment = '';
        this.loadTask(this.task!.id);
      });
    }
  }

  addSubtask() {
    if (this.newSubtaskTitle.trim() && this.task) {
      this.taskService.addSubtask(this.task.id, this.newSubtaskTitle).subscribe(() => {
        this.newSubtaskTitle = '';
        this.loadTask(this.task!.id);
      });
    }
  }

  toggleSubtask(st: any) {
    this.taskService.toggleSubtask(st.id, !st.isCompleted).subscribe(() => {
      this.loadTask(this.task!.id);
    });
  }

  updateStatus(newStatus: TaskStatus) {
    this.taskService.updateTaskStatus(this.task!.id, newStatus).subscribe(() => {
      this.loadTask(this.task!.id);
    });
  }

  isAssignee(): boolean {
    const user = this.authService.currentUserValue;
    return user?.id === this.task?.assignedToId;
  }

  isCreatorOrAdmin(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'Admin' || user?.id === this.task?.createdById;
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
}
 