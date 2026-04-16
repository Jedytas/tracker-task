import { NgIf, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserProfile } from '../../models/interface';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-profile',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    LocalizedDatePipe,
    TitleCasePipe,
    NgIf,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly verificationCooldownKey = 'emailVerificationCooldownUntil';
  private readonly passwordCodeCooldownKey = 'passwordCodeCooldownUntil';

  authService = inject(AuthService);
  commonService = inject(CommonService);
  languageService = inject(LanguageService);
  toastr = inject(ToastrService);
  router = inject(Router);
  private fb = inject(FormBuilder);

  profile: UserProfile | null = null;
  isLoading = true;
  isSaving = false;
  isChangingPassword = false;
  isSendingPasswordCode = false;
  isCancellingEmailChange = false;
  isResendingVerification = false;
  isAvatarMenuOpen = false;
  verificationCooldownSeconds = 0;
  passwordCodeCooldownSeconds = 0;
  avatarPreview: string | null = null;
  private verificationCooldownTimer: ReturnType<typeof setInterval> | null = null;
  private passwordCodeCooldownTimer: ReturnType<typeof setInterval> | null = null;
  hasRequestedPasswordCode = false;

  readonly profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    code: ['', Validators.required],
  });

  get isPasswordStepValid(): boolean {
    const currentPassword = this.passwordForm.get('currentPassword');
    const newPassword = this.passwordForm.get('newPassword');
    const confirmPassword = this.passwordForm.get('confirmPassword');

    return Boolean(
      currentPassword?.valid &&
      newPassword?.valid &&
      confirmPassword?.valid &&
      newPassword?.value === confirmPassword?.value
    );
  }

  ngOnInit(): void {
    this.restoreVerificationCooldown();
    this.restorePasswordCodeCooldown();
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;

    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.commonService.userName.set(profile.name);
        this.commonService.userAvatar.set(profile.avatar || null);
        this.avatarPreview = profile.avatar || null;
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.toastr.error(this.languageService.t('common.profileLoadFailed'));
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSaving) {
      return;
    }

    const { name, email } = this.profileForm.getRawValue();
    this.isSaving = true;

    this.authService.updateProfile({ name: name || '', email: email || '' }).subscribe({
      next: (response) => {
        this.profile = response.user;
        this.commonService.userName.set(response.user.name);
        this.commonService.userAvatar.set(response.user.avatar || null);
        this.avatarPreview = response.user.avatar || null;
        this.profileForm.patchValue({
          name: response.user.name,
          email: response.user.email,
        });
        this.profileForm.markAsPristine();
        this.isSaving = false;
        const successKey = response.emailChangeRequested
          ? 'profile.emailChangeRequested'
          : 'common.profileUpdated';
        this.toastr.success(this.languageService.t(successKey));
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.isSaving = false;
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'common.profileUpdateFailed'));
      }
    });
  }

  private saveAvatar(avatar: string | null): void {
    if (!this.profile || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.authService.updateProfile({
      name: this.profile.name,
      email: this.profile.email,
      avatar: avatar || ''
    }).subscribe({
      next: (response) => {
        this.profile = response.user;
        this.commonService.userName.set(response.user.name);
        this.commonService.userAvatar.set(response.user.avatar || null);
        this.avatarPreview = response.user.avatar || null;
        this.profileForm.patchValue({
          name: response.user.name,
          email: response.user.email,
        });
        this.isSaving = false;
        this.toastr.success(this.languageService.t('profile.avatarUpdated'));
      },
      error: (error) => {
        console.error('Failed to update avatar:', error);
        this.isSaving = false;
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'profile.avatarUpdateFailed'));
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toastr.error(this.languageService.t('profile.avatarInvalidType'));
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error(this.languageService.t('profile.avatarTooLarge'));
      input.value = '';
      return;
    }

    this.compressAvatar(file)
      .then((result) => {
        this.avatarPreview = result;
        this.saveAvatar(result);
        input.value = '';
      })
      .catch((error) => {
        console.error('Failed to process avatar:', error);
        this.toastr.error(this.languageService.t('profile.avatarProcessFailed'));
        input.value = '';
      });
  }

  removeAvatar(): void {
    this.avatarPreview = null;
    this.saveAvatar(null);
  }

  triggerAvatarSelection(input: HTMLInputElement): void {
    this.isAvatarMenuOpen = false;
    input.click();
  }

  toggleAvatarMenu(): void {
    this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
  }

  private async compressAvatar(file: File): Promise<string> {
    const imageUrl = await this.readFileAsDataUrl(file);
    const image = await this.loadImage(imageUrl);

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context is not available');
    }

    const sourceSize = Math.min(image.width, image.height);
    const sourceX = (image.width - sourceSize) / 2;
    const sourceY = (image.height - sourceSize) / 2;

    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

    const compressed = canvas.toDataURL('image/jpeg', 0.82);
    if (compressed.length > 350_000) {
      return canvas.toDataURL('image/jpeg', 0.72);
    }

    return compressed;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = src;
    });
  }

  requestPasswordChangeCode(): void {
    if (!this.profile?.isEmailVerified) {
      this.toastr.error(this.languageService.t('password.changeDisabledText'));
      return;
    }

    if (this.passwordCodeCooldownSeconds > 0) {
      this.toastr.info(`${this.languageService.t('password.codeDeliveryCooldown')} ${this.passwordCodeCooldownSeconds} c`);
      return;
    }

    if (
      this.passwordForm.get('currentPassword')?.invalid ||
      this.passwordForm.get('newPassword')?.invalid ||
      this.passwordForm.get('confirmPassword')?.invalid ||
      this.isSendingPasswordCode
    ) {
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.toastr.error(this.languageService.t('common.passwordsNotMatch'));
      return;
    }

    this.isSendingPasswordCode = true;
    this.authService.requestPasswordChangeCode({ currentPassword: currentPassword || '', newPassword: newPassword || '' }).subscribe({
      next: (response) => {
        this.isSendingPasswordCode = false;
        this.hasRequestedPasswordCode = true;
        this.startPasswordCodeCooldown();
        const messageKey = response.codeDelivery === 'log'
          ? 'password.codeSentDev'
          : 'password.codeSent';
        this.toastr.success(this.languageService.t(messageKey));
      },
      error: (error) => {
        console.error('Failed to send password change code:', error);
        this.isSendingPasswordCode = false;
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'common.passwordChangeFailed'));
      }
    });
  }

  changePassword(): void {
    if (!this.profile?.isEmailVerified) {
      this.toastr.error(this.languageService.t('password.changeDisabledText'));
      return;
    }

    if (this.passwordForm.get('code')?.invalid || this.isChangingPassword || !this.hasRequestedPasswordCode) {
      return;
    }

    const code = this.passwordForm.get('code')?.value || '';
    this.isChangingPassword = true;
    this.authService.confirmPasswordChange(code).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.hasRequestedPasswordCode = false;
        this.isChangingPassword = false;
        this.toastr.success(this.languageService.t('common.passwordChanged'));
      },
      error: (error) => {
        console.error('Failed to confirm password change:', error);
        this.isChangingPassword = false;
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'common.passwordChangeFailed'));
      }
    });
  }

  openDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  openAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  resendVerificationEmail(): void {
    if (this.isResendingVerification || this.profile?.isEmailVerified || this.verificationCooldownSeconds > 0) {
      if (this.verificationCooldownSeconds > 0) {
        this.toastr.info(`${this.languageService.t('profile.resendVerificationCooldown')} ${this.verificationCooldownSeconds} c`);
      }
      return;
    }

    this.isResendingVerification = true;
    this.authService.resendVerificationEmail().subscribe({
      next: (response) => {
        this.isResendingVerification = false;
        this.startVerificationCooldown();
        const messageKey = response.verificationDelivery === 'log'
          ? 'profile.verifyResentDev'
          : 'profile.verifyResent';
        this.toastr.success(this.languageService.t(messageKey));
      },
      error: (error) => {
        console.error('Failed to resend verification email:', error);
        this.isResendingVerification = false;
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'profile.verifyResendFailed'));
      }
    });
  }

  cancelPendingEmailChange(): void {
    if (!this.profile?.pendingEmail || this.isCancellingEmailChange) {
      return;
    }

    this.isCancellingEmailChange = true;
    this.authService.cancelEmailChange().subscribe({
      next: (response) => {
        this.profile = response.user;
        this.profileForm.patchValue({ email: response.user.email });
        this.isCancellingEmailChange = false;
        this.toastr.success(this.languageService.t('profile.emailChangeCancelled'));
      },
      error: (error) => {
        console.error('Failed to cancel email change:', error);
        this.isCancellingEmailChange = false;
        this.toastr.error(this.languageService.tApi(error?.error?.message, 'profile.emailChangeFailed'));
      }
    });
  }

  private startVerificationCooldown(): void {
    const cooldownUntil = Date.now() + 60_000;
    localStorage.setItem(this.verificationCooldownKey, String(cooldownUntil));
    this.verificationCooldownSeconds = 60;
    if (this.verificationCooldownTimer) {
      clearInterval(this.verificationCooldownTimer);
    }

    this.verificationCooldownTimer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      this.verificationCooldownSeconds = remainingSeconds;
      if (this.verificationCooldownSeconds === 0 && this.verificationCooldownTimer) {
        clearInterval(this.verificationCooldownTimer);
        this.verificationCooldownTimer = null;
        localStorage.removeItem(this.verificationCooldownKey);
      }
    }, 1000);
  }

  private restoreVerificationCooldown(): void {
    const storedValue = localStorage.getItem(this.verificationCooldownKey);
    const cooldownUntil = storedValue ? Number(storedValue) : 0;

    if (!cooldownUntil || cooldownUntil <= Date.now()) {
      localStorage.removeItem(this.verificationCooldownKey);
      return;
    }

    this.verificationCooldownSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    this.startVerificationCooldownFromTimestamp(cooldownUntil);
  }

  private startVerificationCooldownFromTimestamp(cooldownUntil: number): void {
    if (this.verificationCooldownTimer) {
      clearInterval(this.verificationCooldownTimer);
    }

    this.verificationCooldownTimer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      this.verificationCooldownSeconds = remainingSeconds;

      if (remainingSeconds === 0 && this.verificationCooldownTimer) {
        clearInterval(this.verificationCooldownTimer);
        this.verificationCooldownTimer = null;
        localStorage.removeItem(this.verificationCooldownKey);
      }
    }, 1000);
  }

  private startPasswordCodeCooldown(): void {
    const cooldownUntil = Date.now() + 60_000;
    localStorage.setItem(this.passwordCodeCooldownKey, String(cooldownUntil));
    this.passwordCodeCooldownSeconds = 60;
    if (this.passwordCodeCooldownTimer) {
      clearInterval(this.passwordCodeCooldownTimer);
    }

    this.passwordCodeCooldownTimer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      this.passwordCodeCooldownSeconds = remainingSeconds;
      if (remainingSeconds === 0 && this.passwordCodeCooldownTimer) {
        clearInterval(this.passwordCodeCooldownTimer);
        this.passwordCodeCooldownTimer = null;
        localStorage.removeItem(this.passwordCodeCooldownKey);
      }
    }, 1000);
  }

  private restorePasswordCodeCooldown(): void {
    const storedValue = localStorage.getItem(this.passwordCodeCooldownKey);
    const cooldownUntil = storedValue ? Number(storedValue) : 0;

    if (!cooldownUntil || cooldownUntil <= Date.now()) {
      localStorage.removeItem(this.passwordCodeCooldownKey);
      return;
    }

    this.passwordCodeCooldownSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    if (this.passwordCodeCooldownTimer) {
      clearInterval(this.passwordCodeCooldownTimer);
    }

    this.passwordCodeCooldownTimer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      this.passwordCodeCooldownSeconds = remainingSeconds;
      if (remainingSeconds === 0 && this.passwordCodeCooldownTimer) {
        clearInterval(this.passwordCodeCooldownTimer);
        this.passwordCodeCooldownTimer = null;
        localStorage.removeItem(this.passwordCodeCooldownKey);
      }
    }, 1000);
  }
}
