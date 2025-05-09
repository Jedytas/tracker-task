import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonService } from '../../services/common.service'; 

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-task-summary',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatExpansionModule],
  templateUrl: './task-summary.component.html',
  styleUrl: './task-summary.component.scss'
})
export class TaskSummaryComponent {

  taskSummary: string = '';
  showSummary: boolean = false;
  commonService = inject(CommonService);
  tasks: Task[] = [];

 
  generateSummary() {
    const total = this.commonService.totalTasks();
    const completed = this.commonService.completedTasks();
    const pending = this.commonService.pendingTasks(); 
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.taskSummary = `You have completed ${completed} out of ${total} tasks (${completionRate}% completion rate). You still have ${pending} tasks pending. ${this.getMotivationalMessage(completionRate)}`;
    this.showSummary = true;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(task => !task.completed).length;
  }


  getMotivationalMessage(completionRate: number): string {
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
