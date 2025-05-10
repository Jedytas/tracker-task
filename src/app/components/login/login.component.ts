import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { LoginPayload, RegisterPayload } from '../../models/interface';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatDividerModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  commonService = inject(CommonService);
  authService = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);

  isRegistering = false;

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
        this.toastr.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.toastr.error(error?.error?.message || 'Invalid credentials'); 
      }
    });
  }

  register() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const namePattern = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
    const minPasswordLength = 6;
    const minNameLength = 2;

    if (!this.registerForm.name || this.registerForm.name.length < minNameLength || !namePattern.test(this.registerForm.name)) {
      this.toastr.error('Name is required, must be at least 2 characters long and contain only letters and spaces.');
      return;
    }

    if (!this.registerForm.email || !this.registerForm.password) {
      this.toastr.error('All fields are required.');
      return;
    }

    if (!emailPattern.test(this.registerForm.email)) {
      this.toastr.error('Please enter a valid email address.');
      return;
    }

    if (this.registerForm.password.length < minPasswordLength) {
      this.toastr.error(`Password must be at least ${minPasswordLength} characters.`);
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    this.authService.register(this.registerForm).subscribe(
      (response) => {
        this.toastr.success('Registration successful!');
        this.toggleRegister();
      },
      (error) => {
        const errorMsg = error?.error?.message || 'Registration failed!';
        this.toastr.error(errorMsg);
      }
    );
  }
}
