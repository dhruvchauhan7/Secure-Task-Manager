import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

type Task = {
  id: string;
  orgId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category?: string | null;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
};

type SortKey = 'UPDATED_AT' | 'CREATED_AT' | 'TITLE' | 'STATUS';
type SortDir = 'ASC' | 'DESC';

@Component({
  selector: 'stm-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  private readonly API = 'http://localhost:3000/api';

  // Create form
  title = '';
  description = '';
  status: TaskStatus = 'OPEN';
  category = 'Work'; 
  creating = false;

  // List
  loading = false;
  error = '';
  tasks: Task[] = [];

  // Edit state
  editingId: string | null = null;
  editTitle = '';
  editDescription = '';
  editStatus: TaskStatus = 'OPEN';
  editCategory = 'Work';
  saving = false;
  deletingId: string | null = null;

  statuses: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];

 
  categories: string[] = ['Work', 'Personal', 'School', 'Other'];

  
  filterStatus: 'ALL' | TaskStatus = 'ALL';
  filterCategory: 'ALL' | string = 'ALL';
  sortKey: SortKey = 'UPDATED_AT';
  sortDir: SortDir = 'DESC';

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.error = '';
    this.loading = true;

    this.http.get<Task[]>(`${this.API}/tasks`).subscribe({
      next: (res) => {
        // normalize category so UI doesn't break if missing
        this.tasks = (res ?? []).map((t) => ({
          ...t,
          category: t.category ?? null,
        }));
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.status === 401 ? 'Unauthorized' : 'Failed to load tasks';
      },
    });
  }

  
  get visibleTasks(): Task[] {
    let list = [...this.tasks];

    // filter by status
    if (this.filterStatus !== 'ALL') {
      list = list.filter((t) => t.status === this.filterStatus);
    }

    // filter by category
    if (this.filterCategory !== 'ALL') {
      list = list.filter((t) => (t.category ?? 'Uncategorized') === this.filterCategory);
    }

    // sort
    list.sort((a, b) => {
      const dir = this.sortDir === 'ASC' ? 1 : -1;

      switch (this.sortKey) {
        case 'TITLE':
          return dir * (a.title ?? '').localeCompare(b.title ?? '');
        case 'STATUS':
          return dir * (a.status ?? '').localeCompare(b.status ?? '');
        case 'CREATED_AT':
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'UPDATED_AT':
        default:
          return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      }
    });

    return list;
  }

  
  get filterCategoryOptions(): string[] {
    const set = new Set<string>();
    for (const t of this.tasks) set.add((t.category ?? 'Uncategorized') as string);
    // include known categories too
    for (const c of this.categories) set.add(c);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  async create() {
    if (!this.auth.canWrite()) return;
    this.error = '';
    this.creating = true;

    this.http
      .post<Task>(`${this.API}/tasks`, {
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        status: this.status,
        category: this.category?.trim() || null, 
      })
      .subscribe({
        next: (created) => {
          const normalized: Task = { ...created, category: created.category ?? this.category ?? null };
          this.tasks = [normalized, ...this.tasks];

          this.title = '';
          this.description = '';
          this.status = 'OPEN';
          this.category = 'Work';
          this.creating = false;
        },
        error: (e) => {
          this.creating = false;
          this.error =
            e?.status === 403
              ? 'Forbidden (role does not allow creating tasks)'
              : 'Failed to create task';
        },
      });
  }

  startEdit(t: Task) {
    if (!this.auth.canWrite()) return;
    this.editingId = t.id;
    this.editTitle = t.title;
    this.editDescription = t.description ?? '';
    this.editStatus = t.status;
    this.editCategory = (t.category ?? 'Work') as string;
    this.error = '';
  }

  cancelEdit() {
    this.editingId = null;
    this.editTitle = '';
    this.editDescription = '';
    this.editStatus = 'OPEN';
    this.editCategory = 'Work';
  }

  saveEdit(t: Task) {
    if (!this.auth.canWrite()) return;
    if (!this.editingId) return;

    this.saving = true;
    this.error = '';

    this.http
      .put<Task>(`${this.API}/tasks/${t.id}`, {
        title: this.editTitle.trim(),
        description: this.editDescription.trim() || null,
        status: this.editStatus,
        category: this.editCategory?.trim() || null,
      })
      .subscribe({
        next: (updated) => {
          const normalized: Task = { ...updated, category: updated.category ?? this.editCategory ?? null };
          this.tasks = this.tasks.map((x) => (x.id === normalized.id ? normalized : x));
          this.saving = false;
          this.cancelEdit();
        },
        error: (e) => {
          this.saving = false;
          this.error =
            e?.status === 403
              ? 'Forbidden (role does not allow editing tasks)'
              : e?.status === 404
              ? 'Not found (API route mismatch)'
              : 'Failed to save task';
        },
      });
  }


  deleteTask(t: Task) {
    if (!this.auth.canWrite()) return;

    const ok = confirm(`Delete "${t.title}"? This cannot be undone.`);
    if (!ok) return;

    this.deletingId = t.id;
    this.error = '';

    this.http.delete(`${this.API}/tasks/${t.id}`).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((x) => x.id !== t.id);
        if (this.editingId === t.id) this.cancelEdit();
        this.deletingId = null;
      },
      error: (e) => {
        this.deletingId = null;
        this.error =
          e?.status === 403
            ? 'Forbidden (role does not allow deleting tasks)'
            : 'Failed to delete task';
      },
    });
  }

  clearFilters() {
    this.filterStatus = 'ALL';
    this.filterCategory = 'ALL';
    this.sortKey = 'UPDATED_AT';
    this.sortDir = 'DESC';
  }

  trackById(_: number, t: Task) {
    return t.id;
  }
}
