import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  route = inject(ActivatedRoute);

  token = this.route.snapshot.queryParamMap.get('token') || '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;
  isSuccess = false;
  message = '';

  submit(): void {
    if (!this.token) {
      this.message = this.languageService.t('password.resetMissingToken');
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.message = this.languageService.t('common.passwordMinLength');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = this.languageService.t('common.passwordsNotMatch');
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.message = this.languageService.tApi(response.message, 'password.resetSuccess');
      },
      error: (error) => {
        this.isSubmitting = false;
        this.isSuccess = false;
        this.message = this.languageService.tApi(error?.error?.message, 'password.resetFailed');
      }
    });
  }
}
