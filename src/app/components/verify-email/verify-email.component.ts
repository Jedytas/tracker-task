import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent {
  authService = inject(AuthService);
  languageService = inject(LanguageService);
  route = inject(ActivatedRoute);

  isLoading = true;
  isSuccess = false;
  message = '';

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.message = this.languageService.t('profile.verifyMissingToken');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = this.languageService.tApi(response.message, 'profile.verifySuccess');
      },
      error: (error) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = this.languageService.tApi(error?.error?.message, 'profile.verifyFailed');
      }
    });
  }
}
