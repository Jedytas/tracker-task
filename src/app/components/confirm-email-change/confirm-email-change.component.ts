import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-confirm-email-change',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './confirm-email-change.component.html',
  styleUrl: './confirm-email-change.component.scss'
})
export class ConfirmEmailChangeComponent {
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
      this.message = this.languageService.t('profile.emailChangeMissingToken');
      return;
    }

    this.authService.confirmEmailChange(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = this.languageService.tApi(response.message, 'profile.emailChangeSuccess');
      },
      error: (error) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = this.languageService.tApi(error?.error?.message, 'profile.emailChangeFailed');
      }
    });
  }
}
