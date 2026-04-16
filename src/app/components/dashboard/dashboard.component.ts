import { Component, inject } from '@angular/core';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskSummaryComponent } from '../task-summary/task-summary.component';
import { TaskCalendarComponent } from '../task-calendar/task-calendar.component';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    AddTaskComponent, 
    TaskListComponent, 
    TaskSummaryComponent, 
    TaskCalendarComponent,
    TitleCasePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  commonService = inject(CommonService);
  languageService = inject(LanguageService);

}
