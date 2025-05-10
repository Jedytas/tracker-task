import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskStatistics } from '../models/interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private baseUrl = 'https://backend-tracker-mauve.vercel.app/api/task';
  //private baseUrl = 'http://localhost:5000/api/task';

  http= inject(HttpClient);

  constructor() { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/list`);
  }

  addTask(title: string): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/add`, { title });
  }

  updateTaskStatus(taskId: string, done: boolean): Observable<{ message: string; task: Task }> {
    return this.http.patch<{ message: string; task: Task }>(`${this.baseUrl}/done/${taskId}`, { done });
  }

  deleteTask(taskId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${taskId}`);
  }

  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(`${this.baseUrl}/stats`);
  }
}
