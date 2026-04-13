import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-task-summary',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './task-summary.component.html',
  styleUrl: './task-summary.component.scss'
})
export class TaskSummaryComponent {

  taskSummary: string = '';
  showSummary: boolean = false;
  commonService = inject(CommonService);
  languageService = inject(LanguageService);
  tasks: Task[] = [];

 
  generateSummary() {
    const total = this.commonService.totalTasks();
    const completed = this.commonService.completedTasks();
    const pending = this.commonService.pendingTasks(); 
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const lang = this.languageService.currentLanguage();
    
    if (lang === 'ru') {
      this.taskSummary = `Вы завершили ${completed} из ${total} задач (${completionRate}% выполнено). У вас осталось ${pending} задач. ${this.getMotivationalMessage(completionRate)}`;
    } else {
      this.taskSummary = `You have completed ${completed} out of ${total} tasks (${completionRate}% completion rate). You still have ${pending} tasks pending. ${this.getMotivationalMessage(completionRate)}`;
    }
    
    this.showSummary = true;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(task => !task.completed).length;
  }


  getMotivationalMessage(completionRate: number): string {
    const lang = this.languageService.currentLanguage();
    
    if (lang === 'ru') {
      if (completionRate >= 80) {
        return "Отличная работа! Вы почти у цели, продолжайте в том же духе!";
      } else if (completionRate >= 50) {
        return "Хороший прогресс! Вы на полпути, продолжайте двигаться вперед!";
      } else if (completionRate > 0) {
        return "Вы начали! Сосредоточьтесь на выполнении большего количества задач.";
      } else {
        return "Время начать! Разбейте задачи и выполняйте их одну за другой.";
      }
    } else {
      if (completionRate >= 80) {
        return "Excellent work! You're almost there, keep up the great momentum!";
      } else if (completionRate >= 50) {
        return "Good progress! You're halfway there, keep pushing forward!";
      } else if (completionRate > 0) {
        return "You've made a start! Focus on completing more tasks to build momentum.";
      } else {
        return "Time to get started! Break down your tasks and tackle them one by one.";
      }
    }
  }

}
