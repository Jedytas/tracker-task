import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { Task } from '../../models/interface';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';
import { finalize } from 'rxjs';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
  selector: 'app-task-list',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatDividerModule, MatCheckboxModule, NgClass, MatSelectModule, ReactiveFormsModule, LocalizedDatePipe, MatTooltipModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  readonly commonService = inject(CommonService);
  readonly languageService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  isLoading = false;
  isEditDialogOpen = false;
  editForm: FormGroup;
  currentEditingTask: Task | null = null;
  selectedCompletedTasks: Set<string> = new Set();
  isSelectionMode = false;
  isCompletedTasksExpanded = false;

  constructor() {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['other'],
      priority: ['medium'],
      deadline: ['']
    });
  }

  ngOnInit(): void {
    this.fetchTasks();  
  }

  fetchTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (tasks: Task[]) => {
          this.commonService.tasks.set(tasks);
        },
        error: (error) => {
          console.error('Error fetching tasks:', error);
          this.toastr.error(this.languageService.t('common.taskLoadFailed'));
        }
      });
  }

  toggleTaskCompletion(task: Task): void {
    const updatedStatus = !task.done;
    this.taskService.updateTaskStatus(task._id, updatedStatus).subscribe({
      next: (response) => {
        // Update the local task state
        this.updateLocalTaskStatus(task._id, updatedStatus);
      if (updatedStatus) {
        this.commonService.completedTasks.update((completed) => completed + 1);
        this.commonService.pendingTasks.update((pending) => pending - 1);
      } else {
        this.commonService.completedTasks.update((completed) => completed - 1);
        this.commonService.pendingTasks.update((pending) => pending + 1);
      }
        this.toastr.success(this.languageService.t('common.taskStatusUpdated'));
      },
      error: (error) => {
        console.error('Failed to update task status:', error);
        this.toastr.error(this.languageService.t('common.taskStatusUpdateFailed'));
      }
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(this.languageService.t('common.confirmDeleteTask'))) {
      return;
    }
    
    this.taskService.deleteTask(task._id).subscribe({
      next: (response) => {
        // Remove task from local state instead of refetching all tasks
        this.removeTaskFromLocalState(task._id);
        this.commonService.totalTasks.update((total) => total - 1);
        if (task.done) {
          this.commonService.completedTasks.update((completed) => completed - 1);
        } else {
          this.commonService.pendingTasks.update((pending) => pending - 1);
        }
        this.toastr.success(this.languageService.t('common.taskDeleted'));
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.toastr.error(this.languageService.t('common.taskDeleteFailed'));
      }
    });
  }

  private updateLocalTaskStatus(taskId: string, status: boolean): void {
    this.commonService.tasks.update(tasks => 
      tasks.map(t => t._id === taskId ? { ...t, done: status } : t)
    );
  }

  private removeTaskFromLocalState(taskId: string): void {
    this.commonService.tasks.update(tasks => tasks.filter(t => t._id !== taskId));
  }

  isOverdue(deadline: Date): boolean {
    return new Date(deadline) < new Date();
  }

  isUpcoming(deadline: Date): boolean {
    return new Date(deadline) >= new Date();
  }

  getDaysUntilDeadline(deadline: Date): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffInMs = deadlineDate.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return 0;
    }

    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDeadlineLabel(deadline: Date): string {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffInMs = deadlineDate.getTime() - now.getTime();

    if (deadlineDate < now) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const normalizedDeadline = new Date(deadlineDate);
      normalizedDeadline.setHours(0, 0, 0, 0);

      const overdueDays = Math.floor((today.getTime() - normalizedDeadline.getTime()) / (1000 * 60 * 60 * 24));

      if (this.languageService.currentLanguage() === 'ru') {
        if (overdueDays <= 0) {
          return 'Просрочено';
        }

        if (overdueDays === 1) {
          return 'Просрочено на 1 день';
        }

        if (overdueDays >= 2 && overdueDays <= 4) {
          return `Просрочено на ${overdueDays} дня`;
        }

        return `Просрочено на ${overdueDays} дней`;
      }

      if (overdueDays <= 0) {
        return 'Overdue';
      }

      return `${overdueDays} day(s) overdue`;
    }

    if (diffInMs < 1000 * 60 * 60 * 24) {
      const totalMinutesLeft = Math.ceil(diffInMs / (1000 * 60));
      const hoursLeft = Math.floor(totalMinutesLeft / 60);
      const minutesLeft = totalMinutesLeft % 60;

      if (this.languageService.currentLanguage() === 'ru') {
        if (hoursLeft <= 0) {
          return `${minutesLeft} мин.`;
        }

        if (minutesLeft === 0) {
          return `${hoursLeft} ч.`;
        }

        return `${hoursLeft} ч. ${minutesLeft} мин.`;
      }

      if (hoursLeft <= 0) {
        return `${minutesLeft} min`;
      }

      if (minutesLeft === 0) {
        return `${hoursLeft} h`;
      }

      return `${hoursLeft} h ${minutesLeft} min`;
    }

    const daysLeft = this.getDaysUntilDeadline(deadline);
    const remainingMs = diffInMs - daysLeft * 1000 * 60 * 60 * 24;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const showMinutes = diffInMs < 1000 * 60 * 60 * 24;

    if (this.languageService.currentLanguage() === 'ru') {
      if (daysLeft === 1) {
        if (remainingHours > 0) {
          if (showMinutes && remainingMinutes > 0) {
            return `1 день ${remainingHours} ч. ${remainingMinutes} мин.`;
          }

          return `1 день ${remainingHours} ч.`;
        }

        if (showMinutes && remainingMinutes > 0) {
          return `1 день ${remainingMinutes} мин.`;
        }

        return '1 день';
      }

      if (daysLeft >= 2 && daysLeft <= 4) {
        if (daysLeft > 3) {
          return `${daysLeft} дня`;
        }

        if (remainingHours > 0) {
          if (showMinutes && remainingMinutes > 0) {
            return `${daysLeft} дня ${remainingHours} ч. ${remainingMinutes} мин.`;
          }

          return `${daysLeft} дня ${remainingHours} ч.`;
        }

        if (showMinutes && remainingMinutes > 0) {
          return `${daysLeft} дня ${remainingMinutes} мин.`;
        }

        return `${daysLeft} дня`;
      }

      if (daysLeft > 3) {
        return `${daysLeft} дней`;
      }

      if (remainingHours > 0) {
        if (showMinutes && remainingMinutes > 0) {
          return `${daysLeft} дней ${remainingHours} ч. ${remainingMinutes} мин.`;
        }

        return `${daysLeft} дней ${remainingHours} ч.`;
      }

      if (showMinutes && remainingMinutes > 0) {
        return `${daysLeft} дней ${remainingMinutes} мин.`;
      }

      return `${daysLeft} дней`;
    }

    if (daysLeft === 1) {
      if (remainingHours > 0) {
        if (showMinutes && remainingMinutes > 0) {
          return `1 day ${remainingHours} h ${remainingMinutes} min`;
        }

        return `1 day ${remainingHours} h`;
      }

      if (showMinutes && remainingMinutes > 0) {
        return `1 day ${remainingMinutes} min`;
      }

      return '1 day';
    }

    if (daysLeft > 3) {
      return `${daysLeft} days`;
    }

    if (remainingHours > 0) {
      if (showMinutes && remainingMinutes > 0) {
        return `${daysLeft} days ${remainingHours} h ${remainingMinutes} min`;
      }

      return `${daysLeft} days ${remainingHours} h`;
    }

    if (showMinutes && remainingMinutes > 0) {
      return `${daysLeft} days ${remainingMinutes} min`;
    }

    return `${daysLeft} days`;
  }

  getDeadlineState(deadline: Date): 'danger' | 'warning' | 'success' {
    const deadlineDate = new Date(deadline);

    if (deadlineDate < new Date()) {
      return 'danger';
    }

    const daysLeft = this.getDaysUntilDeadline(deadline);

    if (daysLeft <= 2) {
      return 'warning';
    }

    return 'success';
  }

  getCategoryClass(category?: string): string {
    const categoryMap: { [key: string]: string } = {
      'work': 'bg-primary',
      'study': 'bg-info',
      'personal': 'bg-success',
      'shopping': 'bg-warning',
      'other': 'bg-secondary'
    };
    return categoryMap[category || 'other'] || 'bg-secondary';
  }

  getCategoryLabel(category?: string): string {
    const cat = category || 'other';
    return this.languageService.t(`category.${cat}`);
  }

  getPriorityClass(priority?: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'bg-success',
      'medium': 'bg-warning',
      'high': 'bg-danger'
    };
    return priorityMap[priority || 'medium'] || 'bg-warning';
  }

  getPriorityLabel(priority?: string): string {
    const pri = priority || 'medium';
    return this.languageService.t(`priority.${pri}`);
  }

  editTask(task: Task): void {
    this.currentEditingTask = task;
    this.isEditDialogOpen = true;
    
    const deadlineValue = task.deadline ? this.formatDateForInput(new Date(task.deadline)) : '';
    
    this.editForm.patchValue({
      title: task.title,
      description: task.description || '',
      category: task.category || 'other',
      priority: task.priority || 'medium',
      deadline: deadlineValue
    });
  }

  closeEditDialog(): void {
    this.isEditDialogOpen = false;
    this.currentEditingTask = null;
    this.editForm.reset();
  }

  saveTask(): void {
    if (this.editForm.valid && this.currentEditingTask) {
      const deadlineValue = this.editForm.value.deadline;
      const deadline = deadlineValue && deadlineValue.trim() !== '' ? new Date(deadlineValue) : undefined;
      
      const updatedData = {
        title: this.editForm.value.title,
        description: this.editForm.value.description,
        category: this.editForm.value.category,
        priority: this.editForm.value.priority,
        deadline: deadline
      };

      this.taskService.updateTask(this.currentEditingTask._id, updatedData).subscribe({
        next: (response) => {
          this.commonService.tasks.update(tasks => 
            tasks.map(t => t._id === this.currentEditingTask!._id ? response.task : t)
          );
          this.toastr.success(this.languageService.t('common.taskUpdated'));
          this.closeEditDialog();
        },
        error: (error) => {
          console.error('Failed to update task:', error);
          this.toastr.error(this.languageService.t('common.taskUpdateFailed'));
        }
      });
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  getActiveTasks(): Task[] {
    return this.commonService.tasks()
      .filter(task => !task.done)
      .sort((a, b) => {
        // Сортировка по deadline: сначала те, у кого есть deadline
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        // Если у обоих нет deadline, сортируем по дате создания
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  getCompletedTasks(): Task[] {
    return this.commonService.tasks()
      .filter(task => task.done)
      .sort((a, b) => {
        // Сортировка по дате завершения (или создания)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  toggleTaskSelection(taskId: string): void {
    if (this.selectedCompletedTasks.has(taskId)) {
      this.selectedCompletedTasks.delete(taskId);
    } else {
      this.selectedCompletedTasks.add(taskId);
    }
  }

  deleteSelectedTasks(): void {
    if (this.selectedCompletedTasks.size === 0) return;

    const confirmMessage = this.languageService.currentLanguage() === 'ru' 
      ? `Вы уверены, что хотите удалить ${this.selectedCompletedTasks.size} выбранных задач(и)?`
      : `Are you sure you want to delete ${this.selectedCompletedTasks.size} selected task(s)?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const tasksToDelete = Array.from(this.selectedCompletedTasks);
    let deletedCount = 0;

    tasksToDelete.forEach(taskId => {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          deletedCount++;
          this.removeTaskFromLocalState(taskId);
          this.commonService.totalTasks.update((total) => total - 1);
          this.commonService.completedTasks.update((completed) => completed - 1);
          
          if (deletedCount === tasksToDelete.length) {
            this.selectedCompletedTasks.clear();
            const successMessage = this.languageService.currentLanguage() === 'ru'
              ? `${deletedCount} задач(и) успешно удалено!`
              : `${deletedCount} task(s) deleted successfully!`;
            this.toastr.success(successMessage);
          }
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.toastr.error(this.languageService.t('common.taskDeleteFailed'));
        }
      });
    });
  }

  deleteAllCompletedTasks(): void {
    const completedTasks = this.getCompletedTasks();
    
    if (completedTasks.length === 0) return;

    const confirmMessage = this.languageService.currentLanguage() === 'ru'
      ? `Вы уверены, что хотите удалить все ${completedTasks.length} завершенных задач(и)?`
      : `Are you sure you want to delete all ${completedTasks.length} completed task(s)?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    let deletedCount = 0;

    completedTasks.forEach(task => {
      this.taskService.deleteTask(task._id).subscribe({
        next: () => {
          deletedCount++;
          this.removeTaskFromLocalState(task._id);
          this.commonService.totalTasks.update((total) => total - 1);
          this.commonService.completedTasks.update((completed) => completed - 1);
          
          if (deletedCount === completedTasks.length) {
            this.selectedCompletedTasks.clear();
            const successMessage = this.languageService.currentLanguage() === 'ru'
              ? `Все ${deletedCount} завершенных задач(и) успешно удалено!`
              : `All ${deletedCount} completed task(s) deleted successfully!`;
            this.toastr.success(successMessage);
          }
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.toastr.error(this.languageService.t('common.taskDeleteFailed'));
        }
      });
    });
  }

  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedCompletedTasks.clear();
    }
  }

  toggleCompletedTasksExpanded(): void {
    this.isCompletedTasksExpanded = !this.isCompletedTasksExpanded;
  }
}
