import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserProfile } from '../../models/interface';
import { LanguageService, Language } from '../../services/language.service';
import { Router } from '@angular/router';

type Theme = 'blue' | 'green' | 'black';

@Component({
  selector: 'app-top-nav',
  imports: [MatIconModule, MatMenuModule, NgIf, MatButtonModule, MatDividerModule, MatTooltipModule, MatCardModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss'
})
export class TopNavComponent implements OnInit {
  currentTheme: Theme = 'black';

  commonService = inject(CommonService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  languageService = inject(LanguageService);
  router = inject(Router);

  isSettingsOpen = false;

  constructor() {
    this.loadTheme();
  };

  ngOnInit() {
    this.getProfile();
  }

  getProfile(){
    if (this.authService.isLoggedIn()) {
      this.authService.getUserProfile().subscribe({
        next: (profile: UserProfile) => {
          this.commonService.userName.set(profile.name);
          this.commonService.userAvatar.set(profile.avatar || null);
        },
        error: (error) => {
          console.error('Failed to fetch user profile:', error);
        },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.toastr.info(this.languageService.t('common.loggedOut'));
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('black');
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }

  setLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
  }

  openSettings() {
    this.isSettingsOpen = true;
  }

  closeSettings() {
    this.isSettingsOpen = false;
  }

  openHome() {
    this.router.navigate([this.authService.isLoggedIn() ? '/dashboard' : '/login']);
  }

  openDashboard() {
    this.router.navigate(['/dashboard']);
  }

  openAnalytics() {
    this.router.navigate(['/analytics']);
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }
}
