import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { ActivityHeatmapComponent } from '../activity-heatmap/activity-heatmap.component';
import { TaskStatisticsComponent } from '../task-statistics/task-statistics.component';
import { ProductivityChartComponent } from '../productivity-chart/productivity-chart.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../services/common.service';

interface WeeklyActivityDay {
  date: Date;
  label: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, ActivityHeatmapComponent, TaskStatisticsComponent, ProductivityChartComponent, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  commonService = inject(CommonService);
  languageService = inject(LanguageService);

  mostActiveDay: { date: Date; count: number } | null = null;
  currentWeekActivity: WeeklyActivityDay[] = [];

  readonly currentWeekMaxCount = computed(() => Math.max(...this.currentWeekActivity.map(day => day.count), 0));

  constructor() {
    effect(() => {
      this.commonService.tasks();
      this.languageService.currentLanguage();
      this.buildInsights();
    });
  }

  buildInsights(): void {
    const completedActivityMap = this.buildCompletedActivityMap();
    this.mostActiveDay = this.buildMostActiveDay(completedActivityMap);
    this.currentWeekActivity = this.buildCurrentWeekActivity(completedActivityMap);
  }

  buildCompletedActivityMap(): Map<string, number> {
    const map = new Map<string, number>();

    this.commonService.tasks().forEach(task => {
      if (!task.done || !task.completedDate) {
        return;
      }

      const completedKey = this.toDateKey(new Date(task.completedDate));
      map.set(completedKey, (map.get(completedKey) || 0) + 1);
    });

    return map;
  }

  buildMostActiveDay(activityMap: Map<string, number>): { date: Date; count: number } | null {
    let bestDay: { date: Date; count: number } | null = null;

    activityMap.forEach((count, key) => {
      if (count === 0) {
        return;
      }

      const date = new Date(`${key}T00:00:00`);
      if (!bestDay || count > bestDay.count || (count === bestDay.count && date > bestDay.date)) {
        bestDay = { date, count };
      }
    });

    return bestDay;
  }

  buildCurrentWeekActivity(activityMap: Map<string, number>): WeeklyActivityDay[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = this.getWeekStart(today);
    const labels = this.languageService.currentLanguage() === 'ru'
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      date.setHours(0, 0, 0, 0);

      const count = activityMap.get(this.toDateKey(date)) || 0;

      return {
        date,
        label: labels[index],
        count,
        level: this.getActivityLevel(count),
        isToday: date.getTime() === today.getTime(),
      };
    });
  }

  getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  toDateKey(date: Date): string {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    const year = normalized.getFullYear();
    const month = String(normalized.getMonth() + 1).padStart(2, '0');
    const day = String(normalized.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  getMostActiveDayName(): string {
    if (!this.mostActiveDay) {
      return this.languageService.currentLanguage() === 'ru' ? 'Нет данных' : 'No data';
    }

    const locale = this.languageService.currentLanguage() === 'ru' ? 'ru-RU' : 'en-US';
    return this.mostActiveDay.date.toLocaleDateString(locale, { weekday: 'long' });
  }

  getMostActiveDayDate(): string {
    if (!this.mostActiveDay) {
      return this.languageService.currentLanguage() === 'ru' ? 'Добавьте завершенные задачи' : 'Complete tasks to see insights';
    }

    const locale = this.languageService.currentLanguage() === 'ru' ? 'ru-RU' : 'en-US';
    return this.mostActiveDay.date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }

  getCompletedTasksLabel(count: number): string {
    if (this.languageService.currentLanguage() === 'ru') {
      return `${count} ${this.getRussianCompletedTaskWord(count)}`;
    }

    return `${count} completed task${count === 1 ? '' : 's'}`;
  }

  getWeeklyDayTooltip(day: WeeklyActivityDay): string {
    const locale = this.languageService.currentLanguage() === 'ru' ? 'ru-RU' : 'en-US';
    const dateLabel = day.date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return `${dateLabel}: ${this.getCompletedTasksLabel(day.count)}`;
  }

  getWeeklyCellTitle(day: WeeklyActivityDay): string {
    return `${day.label} ${day.date.getDate()}`;
  }

  getRussianCompletedTaskWord(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return 'выполненная задача';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'выполненные задачи';
    return 'выполненных задач';
  }
}
