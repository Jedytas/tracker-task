import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ProfileComponent } from './components/profile/profile.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ConfirmEmailChangeComponent } from './components/confirm-email-change/confirm-email-change.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [authGuard] },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'confirm-email-change', component: ConfirmEmailChangeComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }, 
  ];
