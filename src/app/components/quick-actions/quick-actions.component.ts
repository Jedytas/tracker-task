import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-quick-actions',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss'
})
export class QuickActionsComponent {
  commonService = inject(CommonService);
  router = inject(Router);
  languageService = inject(LanguageService);

  getTodayTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.commonService.tasks().filter(task => {
      if (!task.deadline || task.done) return false;
      const deadline = new Date(task.deadline);
      return deadline >= today && deadline < tomorrow;
    }).length;
  }

  getOverdueTasks(): number {
    const now = new Date();
    return this.commonService.tasks().filter(task => {
      if (!task.deadline || task.done) return false;
      return new Date(task.deadline) < now;
    }).length;
  }

  getHighPriorityTasks(): number {
    return this.commonService.tasks().filter(task => 
      task.priority === 'high' && !task.done
    ).length;
  }

  scrollToTaskList(): void {
    const taskListElement = document.querySelector('app-task-list');
    if (taskListElement) {
      taskListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
