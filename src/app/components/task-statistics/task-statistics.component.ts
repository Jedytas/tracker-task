import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-task-statistics',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './task-statistics.component.html',
  styleUrl: './task-statistics.component.scss'
})
export class TaskStatisticsComponent {

  taskService= inject(TaskService);
  commonService= inject(CommonService);
  languageService= inject(LanguageService);

  ngOnInit(): void {  
    this.fetchTaskStatistics();
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.commonService.tasks.set(tasks);
      },
      error: (error) => {
        console.error('Failed to fetch tasks:', error);
      },
    });
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
      !task.done &&
      task.deadline && 
      new Date(task.deadline) >= today && 
      new Date(task.deadline) < tomorrow
    ).length;
  }

  getTomorrowTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    return this.commonService.tasks().filter(task =>
      !task.done &&
      task.deadline &&
      new Date(task.deadline) >= tomorrow &&
      new Date(task.deadline) < dayAfterTomorrow
    ).length;
  }

  getThisWeekTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Получаем день недели (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
    const dayOfWeek = today.getDay();
    
    // Вычисляем понедельник текущей недели
    const monday = new Date(today);
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Если воскресенье, то 6 дней назад
    monday.setDate(today.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Вычисляем воскресенье текущей недели
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return this.commonService.tasks().filter(task => 
      !task.done &&
      task.deadline && 
      new Date(task.deadline) >= monday && 
      new Date(task.deadline) <= sunday
    ).length;
  }

}
