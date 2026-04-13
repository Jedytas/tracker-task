import { Component, inject, effect, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

interface ChartData {
  label: string;
  completed: number;
  total: number;
}

@Component({
  selector: 'app-productivity-chart',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatButtonToggleModule, MatTooltipModule, CommonModule],
  templateUrl: './productivity-chart.component.html',
  styleUrl: './productivity-chart.component.scss'
})
export class ProductivityChartComponent implements OnInit {
  commonService = inject(CommonService);
  languageService = inject(LanguageService);
  
  chartData: ChartData[] = [];
  viewMode: 'week' | 'month' = 'week';
  maxValue = 0;
  
  constructor() {
    // Автообновление графика при изменении задач
    effect(() => {
      // Подписываемся на изменения tasks signal
      const tasks = this.commonService.tasks();
      // Перегенерируем график при любом изменении
      if (tasks.length > 0) {
        this.generateChartData();
      }
    });
    
    // Автообновление графика при изменении языка
    effect(() => {
      // Подписываемся на изменения языка
      this.languageService.currentLanguage();
      // Перегенерируем график для обновления меток дней
      this.generateChartData();
    });
  }
  
  ngOnInit(): void {
    // Инициализируем график при загрузке
    this.generateChartData();
  }
  
  generateChartData(): void {
    if (this.viewMode === 'week') {
      this.generateWeekData();
    } else {
      this.generateMonthData();
    }
  }
  
  generateWeekData(): void {
    this.chartData = [];
    const today = new Date();
    const lang = this.languageService.currentLanguage();
    const dayNames = lang === 'ru' 
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Начинаем с понедельника текущей недели
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - daysFromMonday + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const allTasks = this.commonService.tasks();
      
      // Завершенные задачи в этот день (по completedDate)
      const completedOnDay = allTasks.filter(task => {
        if (!task.done || !task.completedDate) return false;
        const completedDate = new Date(task.completedDate);
        return completedDate >= date && completedDate < nextDay;
      }).length;
      
      // Незавершенные задачи с дедлайном в этот день
      const pendingOnDay = allTasks.filter(task => {
        if (task.done || !task.deadline) return false;
        const deadline = new Date(task.deadline);
        return deadline >= date && deadline < nextDay;
      }).length;
      
      this.chartData.push({
        label: dayNames[i],
        completed: completedOnDay,
        total: completedOnDay + pendingOnDay
      });
    }
    
    // Устанавливаем максимум минимум 5 для нормального отображения
    const maxTotal = Math.max(...this.chartData.map(d => d.total), 1);
    this.maxValue = Math.max(maxTotal, 5);
    
    console.log('Week Data:', this.chartData, 'Max Value:', this.maxValue);
  }
  
  generateMonthData(): void {
    this.chartData = [];
    const today = new Date();
    
    // Находим понедельник текущей недели
    const currentDay = today.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - daysFromMonday);
    currentWeekMonday.setHours(0, 0, 0, 0);
    
    // Последние 4 недели (с понедельника по воскресенье)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(currentWeekMonday);
      weekStart.setDate(currentWeekMonday.getDate() - (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7); // Следующий понедельник
      
      const allTasks = this.commonService.tasks();
      
      // Завершенные задачи на этой неделе (по completedDate)
      const completedInWeek = allTasks.filter(task => {
        if (!task.done || !task.completedDate) return false;
        const completedDate = new Date(task.completedDate);
        return completedDate >= weekStart && completedDate < weekEnd;
      }).length;
      
      // Незавершенные задачи с дедлайном на этой неделе
      const pendingInWeek = allTasks.filter(task => {
        if (task.done || !task.deadline) return false;
        const deadline = new Date(task.deadline);
        return deadline >= weekStart && deadline < weekEnd;
      }).length;
      
      // Форматируем метку с датами
      const startDay = weekStart.getDate();
      const startMonth = weekStart.getMonth() + 1;
      const endDate = new Date(weekEnd);
      endDate.setDate(endDate.getDate() - 1); // Воскресенье (последний день недели)
      const endDay = endDate.getDate();
      const endMonth = endDate.getMonth() + 1;
      
      let label = '';
      if (startMonth === endMonth) {
        label = `${startDay}-${endDay}/${startMonth}`;
      } else {
        label = `${startDay}/${startMonth}-${endDay}/${endMonth}`;
      }
      
      this.chartData.push({
        label: label,
        completed: completedInWeek,
        total: completedInWeek + pendingInWeek
      });
    }
    
    // Устанавливаем максимум минимум 5 для нормального отображения
    const maxTotal = Math.max(...this.chartData.map(d => d.total), 1);
    this.maxValue = Math.max(maxTotal, 5);
    
    console.log('Month Data:', this.chartData, 'Max Value:', this.maxValue);
  }
  
  changeView(mode: 'week' | 'month'): void {
    this.viewMode = mode;
    this.generateChartData();
  }
  
  getBarHeight(value: number): number {
    if (this.maxValue === 0) return 0;
    if (value === 0) return 0;
    // Рассчитываем высоту в пикселях (максимум 180px для десктопа, 130px для мобильных)
    const isMobile = window.innerWidth <= 768;
    const maxHeight = isMobile ? 130 : 180;
    const height = (value / this.maxValue) * maxHeight;
    // Минимальная высота 5px для видимости
    return value > 0 ? Math.max(height, 5) : 0;
  }
  
  getCompletionRate(data: ChartData): number {
    if (data.total === 0) return 0;
    return Math.round((data.completed / data.total) * 100);
  }
  
  getTotalCompleted(): number {
    // Считаем все завершенные задачи
    return this.commonService.tasks().filter(task => task.done).length;
  }
  
  getTotalPending(): number {
    // Считаем все незавершенные задачи
    return this.commonService.tasks().filter(task => !task.done).length;
  }
}
