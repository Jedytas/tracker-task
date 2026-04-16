import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-add-task',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent {
  taskService = inject(TaskService);
  toastr = inject(ToastrService);
  commonService = inject(CommonService);
  languageService = inject(LanguageService);
  
  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      taskTitle: ['', Validators.required],
      deadline: [this.getDefaultDeadline()],
      description: [''],
      category: ['other'],
      priority: ['medium']
    });
  }

  addTask(): void {
    if (this.taskForm.valid) {
      const deadlineValue = this.taskForm.value.deadline;
      const deadline = deadlineValue && typeof deadlineValue === 'string' && deadlineValue.trim() !== '' 
        ? new Date(deadlineValue) 
        : undefined;
      const description = this.taskForm.value.description || '';
      const category = this.taskForm.value.category || 'other';
      const priority = this.taskForm.value.priority || 'medium';
      this.taskService.addTask(this.taskForm.value.taskTitle, deadline, description, category, priority).subscribe({
        next: (task) => {
          this.commonService.tasks.update((currentTasks) => [...currentTasks, task]);
          this.commonService.totalTasks.update((total) => total + 1);
          if (task.done) {
            this.commonService.completedTasks.update((completed) => completed + 1);
          } else {
            this.commonService.pendingTasks.update((pending) => pending + 1);
          }
          this.taskForm.reset();
          this.taskForm.patchValue({
            deadline: this.getDefaultDeadline(),
            category: 'other',
            priority: 'medium'
          });
          this.toastr.success(this.languageService.t('common.taskAdded'));
        },
        error: (error) => {
          console.error('Failed to add task:', error);
          this.toastr.error(this.languageService.t('common.taskAddFailed'));
        },
      });
    }
  }

  getDefaultDeadline(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00`;
  }
}
