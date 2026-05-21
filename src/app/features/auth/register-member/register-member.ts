import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RegisterResponseType } from '../../../shared/models/api-contracts.models';
import { AuthApiService } from '../../../shared/services/auth-api.service';

@Component({
  selector: 'register-member',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-member.html',
  styleUrl: './register-member.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterMember {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitted = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly apiFeedback = signal<{ text: string; isError: boolean } | null>(null);

  protected readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  protected readonly formMessage = computed(() => {
    if (!this.submitted()) {
      return '';
    }

    if (this.registerForm.invalid) {
      return 'Revise os campos destacados para continuar.';
    }

    return this.apiFeedback()?.text ?? '';
  });

  protected readonly hasFormMessageError = computed(() => {
    if (!this.submitted()) {
      return false;
    }

    if (this.registerForm.invalid) {
      return true;
    }

    return this.apiFeedback()?.isError ?? false;
  });

  protected submit(): void {
    this.submitted.set(true);
    this.apiFeedback.set(null);

    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.getRawValue();

    if (payload.password !== payload.password_confirmation) {
      this.apiFeedback.set({
        text: 'A confirmacao de senha deve ser igual a senha.',
        isError: true,
      });
      return;
    }

    this.isSubmitting.set(true);

    this.authApi.registerMember(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => this.handleRegisterResponse(response),
        error: (error: unknown) => {
          this.apiFeedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true,
          });
        }
      });
  }

  protected hasError(
    controlName: 'name' | 'email' | 'password' | 'password_confirmation',
    errorCode: 'required' | 'email' | 'minlength'
  ): boolean {
    const control = this.registerForm.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }

  private handleRegisterResponse(response: RegisterResponseType): void {
    if (!response.success) {
      this.apiFeedback.set({
        text: response.message,
        isError: true,
      });
      return;
    }

    this.apiFeedback.set({
      text: `${response.message} Voce ja pode fazer login.`,
      isError: false,
    });

    void this.router.navigate(['/login']);
  }

  private extractApiErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const errorMessage = error.error?.message;

      if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
        return errorMessage;
      }
    }

    return 'Nao foi possivel concluir seu cadastro agora. Tente novamente.';
  }
}
