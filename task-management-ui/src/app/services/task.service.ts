import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, Task, TaskPriority, TaskStatus } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5209/api/tasks';

  getTasks(status?: TaskStatus, priority?: TaskPriority, assignedTo?: number): Observable<Task[]> {
    let params = new HttpParams();
    if (status !== undefined) params = params.set('status', status.toString());
    if (priority !== undefined) params = params.set('priority', priority.toString());
    if (assignedTo !== undefined) params = params.set('assignedTo', assignedTo.toString());
    
    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: any): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addComment(taskId: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${taskId}/comments`, JSON.stringify(comment), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  updateTaskStatus(taskId: number, newStatus: TaskStatus): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${taskId}/status`, newStatus, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  addSubtask(taskId: number, title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${taskId}/subtasks`, { title });
  }

  toggleSubtask(subtaskId: number, isCompleted: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/subtasks/${subtaskId}/toggle`, isCompleted, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
 