import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

interface HeatmapDay {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isCurrentYear: boolean;
}

@Component({
  selector: 'app-activity-heatmap',
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './activity-heatmap.component.html',
  styleUrl: './activity-heatmap.component.scss'
})
export class ActivityHeatmapComponent {
  commonService = inject(CommonService);
  languageService = inject(LanguageService);

  heatmapWeeks: HeatmapDay[][] = [];
  totalActiveDays = 0;
  totalActivities = 0;

  readonly weekDayLabels = computed(() => this.languageService.currentLanguage() === 'ru'
    ? ['Пн', 'Ср', 'Пт']
    : ['Mon', 'Wed', 'Fri']);

  readonly monthLabels = computed(() => this.buildMonthLabels());

  constructor() {
    effect(() => {
      this.commonService.tasks();
      this.languageService.currentLanguage();
      this.buildHeatmap();
    });
  }

  buildHeatmap(): void {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentYear, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    const startWeekMonday = this.getWeekStart(startDate);
    const endWeekSunday = this.getWeekEnd(endDate);
    const activityMap = this.buildActivityMap();
    const days: HeatmapDay[] = [];

    for (let date = new Date(startWeekMonday); date <= endWeekSunday; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      const count = activityMap.get(this.toDateKey(currentDate)) || 0;
      days.push({
        date: currentDate,
        count,
        level: this.getActivityLevel(count),
        isCurrentYear: currentDate.getFullYear() === currentYear,
      });
    }

    this.heatmapWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.heatmapWeeks.push(days.slice(i, i + 7));
    }

    const currentYearDays = days.filter(day => day.isCurrentYear);
    this.totalActiveDays = currentYearDays.filter(day => day.count > 0).length;
    this.totalActivities = currentYearDays.reduce((sum, day) => sum + day.count, 0);

  }

  buildActivityMap(): Map<string, number> {
    const map = new Map<string, number>();

    this.commonService.tasks().forEach(task => {
      const createdKey = this.toDateKey(new Date(task.date));
      map.set(createdKey, (map.get(createdKey) || 0) + 1);

      if (task.done && task.completedDate) {
        const completedKey = this.toDateKey(new Date(task.completedDate));
        map.set(completedKey, (map.get(completedKey) || 0) + 1);
      }
    });

    return map;
  }

  getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  getWeekEnd(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? 0 : 7 - day;
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

  buildMonthLabels(): { label: string; index: number }[] {
    const labels: { label: string; index: number }[] = [];
    const locale = this.languageService.currentLanguage() === 'ru' ? 'ru-RU' : 'en-US';
    let previousMonth = -1;

    this.heatmapWeeks.forEach((week, index) => {
      const firstCurrentYearDay = week.find(day => day.isCurrentYear);
      if (!firstCurrentYearDay) {
        return;
      }

      const month = firstCurrentYearDay.date.getMonth();
      if (month !== previousMonth) {
        const monthFormat = this.languageService.currentLanguage() === 'ru' ? 'long' : 'short';
        labels.push({
          label: firstCurrentYearDay.date.toLocaleString(locale, { month: monthFormat }),
          index,
        });
        previousMonth = month;
      }
    });

    return labels;
  }

  getTooltip(day: HeatmapDay): string {
    const lang = this.languageService.currentLanguage();
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    const dateLabel = day.date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (lang === 'ru') {
      if (day.count === 0) {
        return `${dateLabel}: активности не было`;
      }

      return `${dateLabel}: ${day.count} ${this.getRussianActivityWord(day.count)}`;
    }

    return `${dateLabel}: ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`;
  }

  getRussianActivityWord(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return 'активность';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'активности';
    return 'активностей';
  }
}
