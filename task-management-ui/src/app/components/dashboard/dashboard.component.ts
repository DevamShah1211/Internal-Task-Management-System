import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats } from '../../models/types';
import { ClickSparkDirective } from '../ui-effects/click-spark.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterLink, 
    NgxChartsModule, 
    ClickSparkDirective
  ],
  template: `
    <div class="dashboard-wrapper" *ngIf="stats">
      <!-- Top Bar / Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <div class="header-pre-title">
            <mat-icon>analytics</mat-icon>
            <span>PLATFORM INSIGHTS</span>
          </div>
          <h1 class="greeting">
            {{ isAdmin() ? 'Hello Admin,' : 'Welcome back,' }}
            <span class="user-highlight">@{{ getUserFirstName() }}</span>
          </h1>
          <p class="date-breadcrumb">
             Manage your project flow and team productivity.
          </p>
        </div>
        <div class="header-right">
          <div class="live-clock shadow-sm">
            <mat-icon>schedule</mat-icon>
            <span>{{ today | date:'hh:mm a' }}</span>
          </div>
          <button mat-flat-button color="primary" routerLink="/tasks/new" appClickSpark class="create-btn">
            <mat-icon>add</mat-icon> New Task
          </button>
        </div>
      </header>

      <!-- Bento Grid Layout -->
      <div class="dashboard-grid">
        <!-- Stat Cards Row (Perfect 5 in a row) -->
        <div class="grid-item stat-card blue">
          <div class="card-inner">
            <div class="icon-box"><mat-icon>assignment</mat-icon></div>
            <div class="stat-content">
              <span class="stat-label">Total Tasks</span>
              <h2 class="stat-value">{{stats.totalTasks}}</h2>
            </div>
            <div class="trend-indicator up">
               <mat-icon>trending_up</mat-icon>
            </div>
          </div>
        </div>

        <div class="grid-item stat-card orange">
          <div class="card-inner">
            <div class="icon-box"><mat-icon>pending_actions</mat-icon></div>
            <div class="stat-content">
              <span class="stat-label">Wait List</span>
              <h2 class="stat-value">{{stats.pendingTasks}}</h2>
            </div>
          </div>
        </div>

        <div class="grid-item stat-card purple">
          <div class="card-inner">
            <div class="icon-box"><mat-icon>speed</mat-icon></div>
            <div class="stat-content">
              <span class="stat-label">Working</span>
              <h2 class="stat-value">{{stats.inProgressTasks}}</h2>
            </div>
          </div>
        </div>

        <div class="grid-item stat-card green">
          <div class="card-inner">
            <div class="icon-box"><mat-icon>task_alt</mat-icon></div>
            <div class="stat-content">
              <span class="stat-label">Finished</span>
              <h2 class="stat-value">{{stats.completedTasks}}</h2>
            </div>
          </div>
        </div>

        <div class="grid-item stat-card red">
          <div class="card-inner">
            <div class="icon-box"><mat-icon>warning_amber</mat-icon></div>
            <div class="stat-content">
              <span class="stat-label">Late</span>
              <h2 class="stat-value">{{stats.overdueTasks || 0}}</h2>
            </div>
          </div>
        </div>

        <!-- Main Trend Area -->
        <div class="grid-item trend-area bento-item">
          <div class="card-inner">
             <div class="card-header">
                <div class="header-main">
                  <h3>Task Velocity</h3>
                  <p>Weekly completion frequency</p>
                </div>
                <div class="header-actions-placeholder">
                  <div class="pill-active">Last 7 Days</div>
                </div>
             </div>
             <div class="chart-container">
               <ngx-charts-area-chart
                [results]="trendData"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [autoScale]="true"
                [curve]="curve"
                [scheme]="customColors">
              </ngx-charts-area-chart>
             </div>
          </div>
        </div>

        <!-- Team Stats Chart (Admin Only) or Personal Breakdown (Employee) -->
        <div class="grid-item team-load bento-item">
          <div class="card-inner">
            <div class="card-header">
              <h3>{{ isAdmin() ? 'Team Distribution' : 'Priority Focus' }}</h3>
              <p>{{ isAdmin() ? 'Tasks assigned per team member' : 'Breaking down your workload' }}</p>
            </div>
            <div class="chart-container">
               <ngx-charts-bar-vertical
                 *ngIf="isAdmin()"
                 [results]="teamWorkloadData"
                 [scheme]="vibrantScheme"
                 [gradient]="true"
                 [xAxis]="true"
                 [yAxis]="true"
                 [showDataLabel]="true">
               </ngx-charts-bar-vertical>

               <div class="donut-chart-wrapper" *ngIf="!isAdmin()">
                 <ngx-charts-pie-chart
                   [results]="priorityData"
                   [scheme]="vibrantScheme"
                   [doughnut]="true"
                   [gradient]="true"
                   [legend]="false"
                   [labels]="false"
                   [animations]="true">
                 </ngx-charts-pie-chart>
                 
                 <!-- Custom Professional Legend -->
                 <div class="custom-legend">
                   <div class="legend-chip" *ngFor="let item of priorityData; let i = index">
                     <span class="dot" [style.background-color]="vibrantScheme.domain[i]"></span>
                     <span class="label">{{item.name}}</span>
                     <span class="count">{{item.value}}</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Completion Rate (Radial) -->
        <div class="grid-item insight-area bento-item">
          <div class="card-inner">
            <div class="card-header">
              <h3>Success Goal</h3>
              <p>Overall completion rate</p>
            </div>
            <div class="radial-viz">
               <ngx-charts-pie-chart
                [results]="progressChartData"
                [doughnut]="true"
                [scheme]="completionScheme">
              </ngx-charts-pie-chart>
              <div class="viz-overlay">
                <span class="val">{{getCompletionRate()}}%</span>
                <span class="sub">Progress</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Feed -->
        <div class="grid-item feed-area bento-item">
          <div class="card-inner">
            <div class="card-header flex">
              <div class="header-main">
                <h3>Latest Activity</h3>
                <p>Newest tasks needing attention</p>
              </div>
              <button mat-button class="text-btn" routerLink="/tasks">View All Activity</button>
            </div>
            <div class="feed-rows">
              <div class="feed-row" *ngFor="let task of recentTasks" [routerLink]="['/tasks', task.id]">
                <div class="p-icon" [ngClass]="getPriorityClass(task.priority)">
                   <mat-icon>{{getPriorityIcon(task.priority)}}</mat-icon>
                </div>
                <div class="row-info">
                  <span class="row-title">{{task.title}}</span>
                  <div class="row-meta-tags">
                    <span class="tag user"><mat-icon>person</mat-icon> {{task.assignedToName || 'Unassigned'}}</span>
                    <span class="tag date"><mat-icon>event</mat-icon> {{task.dueDate | date:'MMM d'}}</span>
                  </div>
                </div>
                <div class="row-badge" [ngClass]="getStatusClass(task.status)">{{getStatusLabel(task.status)}}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Smart Action Hub (New Hero) -->
        <div class="grid-item action-hub" [ngClass]="{'admin-theme': isAdmin()}">
          <div class="card-inner">
            <div class="hub-header">
              <div class="hub-badge"><mat-icon>bolt</mat-icon> SMART HUB</div>
              <div class="hub-time">{{ today | date:'EEEE, MMM d' }}</div>
            </div>
            
            <div class="hub-main">
              <h2>{{ isAdmin() ? 'Team Command Center' : 'Your Daily Mission' }}</h2>
              <p>{{ isAdmin() ? 'Oversee operations and optimize team performance.' : 'Keep the momentum going! You have focus areas today.' }}</p>
              
              <div class="hub-stats-row">
                <div class="hub-mini-stat">
                  <span class="val">{{stats.pendingTasks + stats.inProgressTasks}}</span>
                  <span class="lbl">Active Tasks</span>
                </div>
                <div class="hub-divider"></div>
                <div class="hub-mini-stat">
                  <span class="val">{{getCompletionRate()}}%</span>
                  <span class="lbl">Goal Progress</span>
                </div>
              </div>

              <div class="hub-actions">
                <button mat-flat-button class="hub-btn primary" routerLink="/tasks/new">
                   <mat-icon>add</mat-icon> Create Task
                </button>
                <button mat-stroked-button class="hub-btn secondary" routerLink="/tasks">
                   Manage All
                </button>
              </div>
            </div>

            <!-- Abstract Visual -->
            <div class="hub-visual">
               <div class="glow-sphere"></div>
               <mat-icon class="bg-icon">{{ isAdmin() ? 'admin_panel_settings' : 'auto_graph' }}</mat-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { padding: 40px; max-width: 1600px; margin: 0 auto; animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
    
    .header-pre-title { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 800; color: var(--primary); letter-spacing: 2px; margin-bottom: 8px; }
    .header-pre-title mat-icon { font-size: 16px; width: 16px; height: 16px; }
    
    .greeting { font-size: 3rem; font-weight: 950; margin: 0; letter-spacing: -2.5px; line-height: 1; color: var(--text-primary); }
    .user-highlight { color: var(--primary); background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .date-breadcrumb { margin: 12px 0 0; color: var(--text-muted); font-size: 1.1rem; font-weight: 500; }

    .header-right { display: flex; align-items: center; gap: 20px; }
    .live-clock { background: white; padding: 12px 24px; border-radius: 18px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: #1e293b; }
    .live-clock mat-icon { color: var(--primary); }
    .create-btn { height: 52px; padding: 0 28px !important; border-radius: 16px !important; font-weight: 800; font-size: 1rem; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2) !important; }

    /* Grid Layout */
    .dashboard-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 24px; }
    .grid-item { background: white; border-radius: 32px; border: 1px solid var(--border-color); overflow: hidden; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .bento-item { box-shadow: 0 4px 20px -5px rgba(0,0,0,0.04); }
    .grid-item:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); border-color: rgba(var(--primary-rgb), 0.2); }
    .card-inner { padding: 32px; height: 100%; display: flex; flex-direction: column; position: relative; }

    /* Stat Cards */
    .stat-card { grid-column: span 2; }
    .stat-card .card-inner { padding: 24px; flex-direction: row; align-items: center; gap: 20px; }
    .icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg-main); transition: all 0.3s; }
    .stat-card:hover .icon-box { transform: scale(1.1) rotate(5deg); }
    .stat-card mat-icon { font-size: 24px; width: 24px; height: 24px; }
    
    .blue .icon-box { background: #eff6ff; color: #3b82f6; }
    .orange .icon-box { background: #fff7ed; color: #f59e0b; }
    .purple .icon-box { background: #faf5ff; color: #a855f7; }
    .green .icon-box { background: #ecfdf5; color: #10b981; }
    .red .icon-box { background: #fef2f2; color: #ef4444; }

    .stat-label { font-size: 0.65rem; font-weight: 850; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 2px; display: block; }
    .stat-value { font-size: 2.4rem; font-weight: 900; margin: 0; letter-spacing: -1.5px; color: #1e293b; line-height: 1; }
    
    .trend-indicator { margin-left: auto; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; padding: 4px 8px; border-radius: 8px; }
    .trend-indicator.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .trend-indicator.up mat-icon { font-size: 14px; width: 14px; height: 14px; }

    /* Main Chart Areas */
    .trend-area { grid-column: span 6; grid-row: span 2; min-height: 480px; }
    .team-load { grid-column: span 4; grid-row: span 1; }
    .insight-area { grid-column: span 4; grid-row: span 1; }
    .feed-area { grid-column: span 6; grid-row: span 1; }
    .hero-area { grid-column: span 4; grid-row: span 1; border: none; }

    .card-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .card-header h3 { font-size: 1.6rem; font-weight: 900; margin: 0; letter-spacing: -0.8px; color: #1e293b; }
    .card-header p { font-size: 1rem; color: var(--text-muted); margin: 4px 0 0; font-weight: 500; }
    
    .pill-active { background: #eff6ff; color: #3b82f6; padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; border: 1px solid rgba(59, 130, 246, 0.1); }
    .chart-container { flex: 1; width: 100%; min-height: 200px; display: flex; align-items: center; justify-content: center; }

    .radial-viz { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .viz-overlay { position: absolute; text-align: center; display: flex; flex-direction: column; align-items: center; }
    .viz-overlay .val { font-size: 2.8rem; font-weight: 950; letter-spacing: -2px; line-height: 1; color: #1e293b; }
    .viz-overlay .sub { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); opacity: 0.7; letter-spacing: 1px; margin-top: 4px; }

    /* Feed Styling */
    .feed-rows { display: flex; flex-direction: column; gap: 14px; }
    .feed-row { display: flex; align-items: center; gap: 20px; padding: 18px; border-radius: 20px; background: #f8fafc; cursor: pointer; border: 1px solid transparent; transition: all 0.3s; }
    .feed-row:hover { background: white; border-color: #e2e8f0; transform: translateX(6px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    
    .p-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .p-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .p-icon.priority-2 { color: #ef4444; background: #fef2f2; }
    .p-icon.priority-1 { color: #f59e0b; background: #fff7ed; }
    .p-icon.priority-0 { color: #10b981; background: #ecfdf5; }
    
    .row-info { flex: 1; }
    .row-title { display: block; font-size: 1.05rem; font-weight: 850; color: #1e293b; margin-bottom: 6px; }
    .row-meta-tags { display: flex; gap: 16px; }
    .tag { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
    .tag mat-icon { font-size: 14px; width: 14px; height: 14px; }
    
    .row-badge { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; padding: 6px 12px; border-radius: 10px; background: #f1f5f9; color: #64748b; letter-spacing: 0.5px; }
    .row-badge.status-2 { background: #ecfdf5; color: #059669; }
    .row-badge.status-1 { background: #eff6ff; color: #2563eb; }

    /* Smart Action Hub */
    .action-hub { grid-column: span 4; grid-row: span 1; background: #0f172a; color: white !important; border: none; position: relative; }
    .action-hub.admin-theme { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); }
    .action-hub .card-inner { padding: 36px; z-index: 2; }
    
    .hub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .hub-badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 6px 12px; border-radius: 10px; font-size: 0.65rem; font-weight: 850; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
    .hub-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .hub-time { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.5); }

    .hub-main h2 { color: white !important; font-size: 2.2rem; font-weight: 900; margin: 0 0 8px; letter-spacing: -1.5px; -webkit-text-fill-color: white !important; }
    .hub-main p { color: rgba(255,255,255,0.7) !important; font-size: 1rem; margin: 0 0 28px; line-height: 1.4; -webkit-text-fill-color: rgba(255,255,255,0.7) !important; }

    .hub-stats-row { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; background: rgba(255,255,255,0.05); padding: 16px 20px; border-radius: 20px; width: fit-content; border: 1px solid rgba(255,255,255,0.05); }
    .hub-mini-stat { display: flex; flex-direction: column; }
    .hub-mini-stat .val { font-size: 1.4rem; font-weight: 900; color: white; line-height: 1; }
    .hub-mini-stat .lbl { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-top: 4px; }
    .hub-divider { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }

    .hub-actions { display: flex; gap: 16px; }
    .hub-btn { height: 48px; border-radius: 16px !important; font-weight: 800 !important; padding: 0 24px !important; }
    .hub-btn.primary { background: white !important; color: #0f172a !important; }
    .hub-btn.secondary { color: white !important; border: 1px solid rgba(255,255,255,0.2) !important; }

    /* Custom Legend Styles */
    .donut-chart-wrapper { width: 100%; display: flex; flex-direction: column; align-items: center; }
    ::ng-deep .ngx-charts-pie-chart { height: 220px !important; }
    
    .custom-legend { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 12px; 
      width: 100%; 
      margin-top: 20px; 
      padding: 0 10px;
    }
    .legend-chip { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      background: #f8fafc; 
      padding: 8px 12px; 
      border-radius: 12px; 
      border: 1px solid #f1f5f9;
      transition: all 0.2s;
    }
    .legend-chip:hover { background: #f1f5f9; transform: translateY(-2px); }
    .legend-chip .dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .legend-chip .label { font-size: 0.75rem; font-weight: 750; color: #64748b; flex: 1; text-transform: capitalize; }
    .legend-chip .count { font-size: 0.8rem; font-weight: 900; color: #1e293b; background: rgba(0,0,0,0.03); padding: 2px 6px; border-radius: 6px; }
    
    .hub-visual { position: absolute; right: 0; bottom: 0; top: 0; width: 40%; pointer-events: none; overflow: hidden; }
    .glow-sphere { position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); top: 50%; right: -50px; transform: translateY(-50%); opacity: 0.4; filter: blur(40px); }
    .bg-icon { position: absolute; font-size: 180px; width: 180px; height: 180px; right: -40px; top: 50%; transform: translateY(-50%) rotate(10deg); color: white; opacity: 0.05; }

    @keyframes float { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(30px, -20px) rotate(10deg); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

    /* Responsive */
    @media (max-width: 1500px) {
      .dashboard-grid { grid-template-columns: repeat(6, 1fr); }
      .stat-card { grid-column: span 2; }
      .stat-card:last-child { grid-column: span 6; }
      .trend-area, .team-load, .insight-area, .feed-area, .hero-area { grid-column: span 6; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  public LegendPosition = LegendPosition;
  private taskService = inject(TaskService);
  public authService = inject(AuthService);
  stats?: DashboardStats;
  recentTasks: any[] = [];
  statusData: any[] = [];
  priorityData: any[] = [];
  trendData: any[] = [];
  progressChartData: any[] = [];
  teamWorkloadData: any[] = [];
  today = new Date();

  // Chart Properties
  curve = shape.curveCardinal;
  customColors: Color = { name: 'custom', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#6366f1', '#a855f7', '#ec4899'] };
  vibrantScheme: Color = { name: 'vibrant', selectable: true, group: ScaleType.Ordinal, domain: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'] };
  completionScheme: Color = { name: 'completion', selectable: true, group: ScaleType.Ordinal, domain: ['#10b981', '#f1f5f9'] };

  getUserFirstName(): string {
    const name = this.authService.currentUserValue?.name || 'User';
    return name.split(' ')[0];
  }

  ngOnInit() {
    this.taskService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
      
      // Update Status and Priority Data from Stats
      this.statusData = stats.tasksByStatus.map(s => ({ name: s.status, value: s.count }));
      this.priorityData = stats.tasksByPriority.map(p => ({ name: p.priority, value: p.count }));
      
      this.progressChartData = [
        { name: 'Finished', value: stats.completedTasks },
        { name: 'Remaining', value: Math.max(0, stats.totalTasks - stats.completedTasks) }
      ];
    });

    this.taskService.getTasks().subscribe(tasks => {
      this.recentTasks = tasks.slice(0, 5);
      
      this.calculateTrendData(tasks);

      if (this.isAdmin()) {
        this.calculateTeamWorkload(tasks);
      }
    });
  }

  private calculateTeamWorkload(tasks: any[]) {
    const workloadMap = new Map<string, number>();
    tasks.forEach(task => {
      const name = task.assignedToName || 'Unassigned';
      workloadMap.set(name, (workloadMap.get(name) || 0) + 1);
    });

    this.teamWorkloadData = Array.from(workloadMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  private calculateTrendData(tasks: any[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days: { date: string, dayName: string, count: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      last7Days.push({
        date: d.toLocaleDateString(),
        dayName: days[d.getDay()],
        count: 0
      });
    }

    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt).toLocaleDateString();
      const day = last7Days.find(d => d.date === taskDate);
      if (day) {
        day.count++;
      }
    });

    this.trendData = [
      {
        name: 'Tasks',
        series: last7Days.map(d => ({
          name: d.dayName,
          value: d.count
        }))
      }
    ];
  }

  getPriorityClass(priority: number): string {
    return `priority-${priority}`;
  }

  getPriorityIcon(priority: number): string {
    return ['low_priority', 'flag', 'report_problem'][priority];
  }

  getStatusClass(status: number): string {
    return `status-${status}`;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getPriorityLabel(priority: number) {
    return ['Low', 'Medium', 'High'][priority];
  }

  getStatusLabel(status: number) {
    return ['Waiting', 'Working', 'Finished'][status];
  }

  getCompletionRate(): number {
    if (!this.stats || this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
  }
}
 