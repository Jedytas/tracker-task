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
  private readonly forgotPasswordCooldownKey = 'forgotPasswordCooldownUntil';

  commonService = inject(CommonService);
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  router = inject(Router);
  toastr = inject(ToastrService);

  isRegistering = false;
  isForgotPasswordMode = false;
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

  forgotPasswordEmail = '';
  forgotPasswordCooldownSeconds = 0;
  private forgotPasswordCooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadTheme();
    this.restoreForgotPasswordCooldown();
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
    this.isForgotPasswordMode = false;
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

  openForgotPassword() {
    this.isRegistering = false;
    this.isForgotPasswordMode = true;
    this.forgotPasswordEmail = this.loginForm.email;
  }

  closeForgotPassword() {
    this.isForgotPasswordMode = false;
    this.forgotPasswordEmail = '';
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
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'common.invalidCredentials'));
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
        const messageKey = response.verificationDelivery === 'log'
          ? 'profile.verifyResentDev'
          : 'common.registrationSuccess';
        this.toastr.success(this.languageService.t(messageKey));
        this.toggleRegister();
      },
      (error) => {
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'common.registrationFailed'));
      }
    );
  }

  forgotPassword() {
    if (this.forgotPasswordCooldownSeconds > 0) {
      this.toastr.info(`${this.languageService.t('password.sendResetLinkCooldown')} ${this.forgotPasswordCooldownSeconds} c`);
      return;
    }

    if (!this.forgotPasswordEmail) {
      this.toastr.error(this.languageService.t('common.validEmailRequired'));
      return;
    }

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (response) => {
        this.startForgotPasswordCooldown();
        const messageKey = response.resetDelivery === 'log'
          ? 'password.resetSentDev'
          : 'password.resetSentGeneric';
        this.toastr.success(this.languageService.t(messageKey));
        this.closeForgotPassword();
      },
      error: (error) => {
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'password.resetFailed'));
      }
    });
  }

  private startForgotPasswordCooldown(): void {
    const cooldownUntil = Date.now() + 60_000;
    localStorage.setItem(this.forgotPasswordCooldownKey, String(cooldownUntil));
    this.forgotPasswordCooldownSeconds = 60;
    if (this.forgotPasswordCooldownTimer) {
      clearInterval(this.forgotPasswordCooldownTimer);
    }

    this.forgotPasswordCooldownTimer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      this.forgotPasswordCooldownSeconds = remainingSeconds;
      if (this.forgotPasswordCooldownSeconds === 0 && this.forgotPasswordCooldownTimer) {
        clearInterval(this.forgotPasswordCooldownTimer);
        this.forgotPasswordCooldownTimer = null;
        localStorage.removeItem(this.forgotPasswordCooldownKey);
      }
    }, 1000);
  }

  private restoreForgotPasswordCooldown(): void {
    const storedValue = localStorage.getItem(this.forgotPasswordCooldownKey);
    const cooldownUntil = storedValue ? Number(storedValue) : 0;

    if (!cooldownUntil || cooldownUntil <= Date.now()) {
      localStorage.removeItem(this.forgotPasswordCooldownKey);
      return;
    }

    this.forgotPasswordCooldownSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    this.startForgotPasswordCooldownFromTimestamp(cooldownUntil);
  }

  private startForgotPasswordCooldownFromTimestamp(cooldownUntil: number): void {
    if (this.forgotPasswordCooldownTimer) {
      clearInterval(this.forgotPasswordCooldownTimer);
    }

    this.forgotPasswordCooldownTimer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      this.forgotPasswordCooldownSeconds = remainingSeconds;

      if (remainingSeconds === 0 && this.forgotPasswordCooldownTimer) {
        clearInterval(this.forgotPasswordCooldownTimer);
        this.forgotPasswordCooldownTimer = null;
        localStorage.removeItem(this.forgotPasswordCooldownKey);
      }
    }, 1000);
  }
}
