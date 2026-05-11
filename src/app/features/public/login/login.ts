import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);

  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

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

    return 'Login validado. Integre agora com a API de autenticacao.';
  });

  protected submit(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 700);
  }

  protected hasError(controlName: 'email' | 'password', errorCode: 'required' | 'email' | 'minlength'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }
}
