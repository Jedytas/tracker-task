import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserProfile } from '../../models/interface';
import { LanguageService, Language } from '../../services/language.service';

type Theme = 'blue' | 'green' | 'black';

@Component({
  selector: 'app-top-nav',
  imports: [MatIconModule, MatMenuModule, NgIf, MatButtonModule, MatDividerModule, MatTooltipModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss'
})
export class TopNavComponent implements OnInit {
  currentTheme: Theme = 'black';

  commonService = inject(CommonService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  languageService = inject(LanguageService);
  private fb = inject(FormBuilder);

  isEditProfileOpen = false;
  isChangePasswordOpen = false;
  isSettingsOpen = false;

  editProfileForm: FormGroup;
  changePasswordForm: FormGroup;

  constructor() {
    this.loadTheme();
    
    this.editProfileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  };

  ngOnInit() {
    this.getProfile();
  }

  getProfile(){
    if (this.authService.isLoggedIn()) {
      this.authService.getUserProfile().subscribe({
        next: (profile: UserProfile) => {
          this.commonService.userName.set(profile.name);
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

  openEditProfile() {
    this.isEditProfileOpen = true;
    // Загружаем текущие данные профиля
    this.authService.getUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.editProfileForm.patchValue({
          name: profile.name,
          email: profile.email
        });
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.toastr.error(this.languageService.t('common.profileLoadFailed'));
      }
    });
  }

  closeEditProfile() {
    this.isEditProfileOpen = false;
    this.editProfileForm.reset();
  }

  saveProfile() {
    if (this.editProfileForm.valid) {
      const { name, email } = this.editProfileForm.value;
      
      this.authService.updateProfile({ name, email }).subscribe({
        next: (response) => {
          this.commonService.userName.set(response.user.name);
          this.toastr.success(this.languageService.t('common.profileUpdated'));
          this.closeEditProfile();
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.toastr.error(error.error?.message || this.languageService.t('common.profileUpdateFailed'));
        }
      });
    }
  }

  openChangePassword() {
    this.isChangePasswordOpen = true;
  }

  closeChangePassword() {
    this.isChangePasswordOpen = false;
    this.changePasswordForm.reset();
  }

  savePassword() {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
      
      if (newPassword !== confirmPassword) {
        this.toastr.error(this.languageService.t('common.passwordsNotMatch'));
        return;
      }
      
      this.authService.changePassword({ currentPassword, newPassword }).subscribe({
        next: (response) => {
          this.toastr.success(this.languageService.t('common.passwordChanged'));
          this.closeChangePassword();
        },
        error: (error) => {
          console.error('Failed to change password:', error);
          this.toastr.error(error.error?.message || this.languageService.t('common.passwordChangeFailed'));
        }
      });
    }
  }

  openSettings() {
    this.isSettingsOpen = true;
  }

  closeSettings() {
    this.isSettingsOpen = false;
  }
}
