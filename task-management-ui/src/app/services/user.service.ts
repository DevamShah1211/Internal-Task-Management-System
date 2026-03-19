import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5209/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createUser(user: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, user);
  }

  updateProfile(data: any): Observable<void> {
    const authService = inject(AuthService);
    return this.http.put<void>(`${this.apiUrl}/profile`, data).pipe(
      tap(() => {
        const user = authService.currentUserValue;
        if (user) {
          const updatedUser = { ...user, name: data.name, email: data.email };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          authService.updateLocalUser(updatedUser);
        }
      })
    );
  }
}
 