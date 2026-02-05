import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  orgId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TasksClient {
  private base = 'http://localhost:3000/api/tasks';
  constructor(private http: HttpClient) {}

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.base);
  }

  get(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  create(payload: { title: string; description?: string; status?: TaskStatus }) {
    return this.http.post<Task>(this.base, payload);
  }

  update(id: string, payload: Partial<{ title: string; description: string; status: TaskStatus }>) {
    return this.http.patch<Task>(`${this.base}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/${id}`);
  }
}
