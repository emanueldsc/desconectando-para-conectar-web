import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoginResponse } from '../../../shared/models/api-contracts.models';
import { AuthApiService } from '../../../shared/services/auth-api.service';

@Component({
  selector: 'login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly apiFeedback = signal<{ text: string; isError: boolean } | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  protected readonly formMessage = computed(() => {
    if (!this.submitted()) {
      return '';
    }

    if (this.loginForm.invalid) {
      return 'Revise os campos destacados para continuar.';
    }

    return this.apiFeedback()?.text ?? '';
  });

  protected readonly hasFormMessageError = computed(() => {
    if (!this.submitted()) {
      return false;
    }

    if (this.loginForm.invalid) {
      return true;
    }

    return this.apiFeedback()?.isError ?? false;
  });

  protected submit(): void {
    this.submitted.set(true);
    this.apiFeedback.set(null);

    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const payload = this.loginForm.getRawValue();

    this.authApi.login(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.apiFeedback.set({
              text: response.message,
              isError: true
            });
            return;
          }

          this.persistAuthSession(response, payload.rememberMe);
          this.apiFeedback.set({
            text: 'Login realizado com sucesso. Redirecionando...',
            isError: false
          });

          const targetRoute = response.user.role === 'buyer'
            ? '/login/member'
            : '/dashboard';

          void this.router.navigate([targetRoute]);
        },
        error: (error: unknown) => {
          this.apiFeedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true
          });
        }
      });
  }

  protected hasError(controlName: 'email' | 'password', errorCode: 'required' | 'email' | 'minlength'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }

  private extractApiErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const errorMessage = error.error?.message;

      if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
        return errorMessage;
      }
    }

    return 'Nao foi possivel realizar login agora. Tente novamente.';
  }

  private persistAuthSession(response: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('auth_token', response.token);
    storage.setItem('auth_user', JSON.stringify(response.user));
  }
}
