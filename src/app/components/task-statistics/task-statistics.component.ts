import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-task-statistics',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './task-statistics.component.html',
  styleUrl: './task-statistics.component.scss'
})
export class TaskStatisticsComponent {

  taskService= inject(TaskService);
  commonService= inject(CommonService);
  languageService= inject(LanguageService);

  ngOnInit(): void {  
    this.fetchTaskStatistics();
  }

  fetchTaskStatistics(): void {
    this.taskService.getTaskStatistics().subscribe({
      next: (stats) => {
        this.commonService.totalTasks.set(stats.total);
        this.commonService.completedTasks.set(stats.done);
        this.commonService.pendingTasks.set(stats.pending);
      },
      error: (error) => {
        console.error('Failed to fetch task statistics:', error);
      },
    });
  }

  getCompletionRate(): number {
    const total = this.commonService.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.commonService.completedTasks() / total) * 100);
  }

  getMotivationalMessage(): string {
    const rate = this.getCompletionRate();
    const lang = this.languageService.currentLanguage();
    
    if (lang === 'ru') {
      if (rate === 100) {
        return "🎉 Отлично! Все задачи выполнены!";
      } else if (rate >= 70) {
        return "🔥 Отличный прогресс! Продолжайте!";
      } else if (rate >= 50) {
        return "💪 Половина пути! Вы молодец!";
      } else if (rate > 0) {
        return "🚀 Хорошее начало! Продолжайте двигаться вперед!";
      } else {
        return "📝 Время начать!";
      }
    } else {
      if (rate === 100) {
        return "🎉 Perfect! All tasks completed!";
      } else if (rate >= 70) {
        return "🔥 Great progress! Keep it up!";
      } else if (rate >= 50) {
        return "💪 Halfway there! You're doing well!";
      } else if (rate > 0) {
        return "🚀 Good start! Keep pushing forward!";
      } else {
        return "📝 Time to get started!";
      }
    }
  }

  getOverdueTasks(): number {
    const now = new Date();
    return this.commonService.tasks().filter(task => 
      !task.done && task.deadline && new Date(task.deadline) < now
    ).length;
  }

  getTodayTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.commonService.tasks().filter(task => 
      !task.done && task.deadline && 
      new Date(task.deadline) >= today && 
      new Date(task.deadline) < tomorrow
    ).length;
  }

  getThisWeekTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return this.commonService.tasks().filter(task => 
      !task.done && task.deadline && 
      new Date(task.deadline) >= today && 
      new Date(task.deadline) < nextWeek
    ).length;
  }

  getNoDeadlineTasks(): number {
    return this.commonService.tasks().filter(task => 
      !task.done && !task.deadline
    ).length;
  }

}
