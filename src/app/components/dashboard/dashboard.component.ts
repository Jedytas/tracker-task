import { Component, inject } from '@angular/core';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskSummaryComponent } from '../task-summary/task-summary.component';
import { TaskStatisticsComponent } from '../task-statistics/task-statistics.component';
import { TaskCalendarComponent } from '../task-calendar/task-calendar.component';
import { ProductivityChartComponent } from '../productivity-chart/productivity-chart.component';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    AddTaskComponent, 
    TaskListComponent, 
    TaskSummaryComponent, 
    TaskStatisticsComponent,
    TaskCalendarComponent,
    ProductivityChartComponent,
    TitleCasePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  commonService = inject(CommonService);
  languageService = inject(LanguageService);

}
