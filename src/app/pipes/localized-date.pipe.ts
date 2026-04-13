import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(value: any, format: string = 'short'): string | null {
    const locale = this.languageService.currentLanguage() === 'ru' ? 'ru-RU' : 'en-US';
    const datePipe = new DatePipe(locale);
    return datePipe.transform(value, format);
  }
}
