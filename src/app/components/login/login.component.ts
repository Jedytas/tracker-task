import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { LoginPayload, RegisterPayload } from '../../models/interface';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';

type Theme = 'blue' | 'green' | 'black';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatDividerModule, NgIf, MatTooltipModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  commonService = inject(CommonService);
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  router = inject(Router);
  toastr = inject(ToastrService);

  isRegistering = false;
  currentTheme: Theme = 'black';

  loginForm: LoginPayload = {
    email: '',
    password: ''
  };

  registerForm: RegisterPayload = {
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  };

  constructor() {
    this.loadTheme();
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

  toggleRegister() {
    this.isRegistering = !this.isRegistering;
    this.loginForm = {
      email: '',
      password: ''
    };
    this.registerForm = {
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    };
  }

  signInWithGoogle(event: MouseEvent) {
    event.preventDefault();
    window.location.href = 'http://localhost:5000/api/auth/google';
  }

  login() {
    this.authService.login(this.loginForm).pipe(
      switchMap((loginResponse) => {
        this.authService.saveTokens(loginResponse.accessToken, loginResponse.refreshToken);
        return this.authService.getUserProfile();
      })
    )
    .subscribe({
      next: (profile) => {
        this.commonService.userName.set(profile.name);
        this.toastr.success(this.languageService.t('common.loginSuccess'));
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.toastr.error(error?.error?.message || this.languageService.t('common.invalidCredentials')); 
      }
    });
  }

  register() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const namePattern = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
    const minPasswordLength = 6;
    const minNameLength = 2;

    if (!this.registerForm.name || this.registerForm.name.length < minNameLength || !namePattern.test(this.registerForm.name)) {
      this.toastr.error(this.languageService.t('common.nameRequired'));
      return;
    }

    if (!this.registerForm.email || !this.registerForm.password) {
      this.toastr.error(this.languageService.t('common.allFieldsRequired'));
      return;
    }

    if (!emailPattern.test(this.registerForm.email)) {
      this.toastr.error(this.languageService.t('common.validEmailRequired'));
      return;
    }

    if (this.registerForm.password.length < minPasswordLength) {
      this.toastr.error(this.languageService.t('common.passwordMinLength'));
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.toastr.error(this.languageService.t('common.passwordsNotMatch'));
      return;
    }

    this.authService.register(this.registerForm).subscribe(
      (response) => {
        this.toastr.success(this.languageService.t('common.registrationSuccess'));
        this.toggleRegister();
      },
      (error) => {
        const errorMsg = error?.error?.message || this.languageService.t('common.registrationFailed');
        this.toastr.error(errorMsg);
      }
    );
  }
}
