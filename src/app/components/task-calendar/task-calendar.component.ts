import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';
import { Task } from '../../models/interface';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasDeadline: boolean;
  taskCount: number;
  tasks: Task[];
}

@Component({
  selector: 'app-task-calendar',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule],
  templateUrl: './task-calendar.component.html',
  styleUrl: './task-calendar.component.scss'
})
export class TaskCalendarComponent implements OnInit {
  commonService = inject(CommonService);
  languageService = inject(LanguageService);
  
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: CalendarDay[] = [];
  weekDays = signal<string[]>([]);
  
  constructor() {
    // Инициализируем дни недели
    this.updateWeekDays();
    
    // Автообновление календаря при изменении задач
    effect(() => {
      // Подписываемся на изменения tasks signal
      this.commonService.tasks();
      // Перегенерируем календарь
      this.generateCalendar();
    });
    
    // Автообновление календаря при изменении языка
    effect(() => {
      // Подписываемся на изменения языка
      this.languageService.currentLanguage();
      // Обновляем дни недели и перегенерируем календарь
      this.updateWeekDays();
      this.generateCalendar();
    });
  }
  
  updateWeekDays(): void {
    const lang = this.languageService.currentLanguage();
    if (lang === 'ru') {
      this.weekDays.set(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']);
    } else {
      this.weekDays.set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    }
  }
  
  ngOnInit(): void {
    this.generateCalendar();
  }
  
  generateCalendar(): void {
    this.calendarDays = [];
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
    
    // Получаем день недели (0 = Sunday, 1 = Monday, etc.)
    let firstDayIndex = firstDay.getDay();
    // Конвертируем в Monday-based (0 = Monday, 6 = Sunday)
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();
    
    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDayDate - i + 1);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
    
    // Current month days
    for (let i = 1; i <= lastDayDate; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }
    
    // Next month days
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }
  
  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const tasksOnDate = this.getTasksForDate(date);
    
    return {
      date: date,
      day: date.getDate(),
      isCurrentMonth: isCurrentMonth,
      isToday: checkDate.getTime() === today.getTime(),
      hasDeadline: tasksOnDate.length > 0,
      taskCount: tasksOnDate.length,
      tasks: tasksOnDate
    };
  }
  
  getTasksForDate(date: Date): Task[] {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return this.commonService.tasks().filter(task => {
      if (!task.deadline) return false;
      const taskDeadline = new Date(task.deadline);
      taskDeadline.setHours(0, 0, 0, 0);
      return taskDeadline.getTime() === checkDate.getTime();
    });
  }
  
  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }
  
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }
  
  getMonthName(): string {
    const lang = this.languageService.currentLanguage();
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(this.currentYear, this.currentMonth).toLocaleString(locale, { month: 'long', year: 'numeric' });
  }
  
  getTooltipText(day: CalendarDay): string {
    if (!day.hasDeadline) return '';
    return day.tasks.map(t => `• ${t.title}`).join('\n');
  }
}
