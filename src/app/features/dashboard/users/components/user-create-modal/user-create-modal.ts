import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CreateMemberPayload, UserMember } from '../../users.models';

type UsersSection = 'members' | 'users';

@Component({
  selector: 'dashboard-user-create-modal',
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-create-modal.html',
  styleUrl: './user-create-modal.scss',
})
export class UserCreateModal {
  private readonly fb = inject(FormBuilder);

  readonly member = input<UserMember | null>(null);
  readonly section = input.required<UsersSection>();
  readonly cancel = output<void>();
  readonly save = output<CreateMemberPayload>();
  protected readonly submitted = signal(false);
  private readonly selectedCategory = signal<CreateMemberPayload['category']>('child');

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    category: ['child' as CreateMemberPayload['category'], [Validators.required]],
    portalRole: ['buyer' as CreateMemberPayload['portalRole'], [Validators.required]],
    email: ['', [Validators.email]],
    password: [''],
    passwordConfirmation: [''],
    address: ['', [Validators.required]],
    notes: [''],
  });

  protected readonly title = computed(() =>
    this.member()
      ? this.section() === 'users'
        ? 'Editar Usuário'
        : 'Editar Membro'
      : this.section() === 'users'
      ? 'Novo Usuário'
      : 'Novo Membro'
  );

  protected readonly submitLabel = computed(() =>
    this.member() ? 'Salvar Alterações' : this.section() === 'users' ? 'Salvar Usuário' : 'Salvar Membro'
  );
  protected readonly headerIcon = computed(() => (this.isEditing() ? 'edit_square' : 'person_badge'));
  protected readonly formErrorMessage = computed(() =>
    this.submitted() && this.form.invalid
      ? 'Revise os campos obrigatórios destacados para continuar.'
      : null
  );

  protected readonly isEditing = computed(() => this.member() !== null);
  protected readonly isUsersSection = computed(() => this.section() === 'users');
  protected readonly isChildCategory = computed(() => this.selectedCategory() === 'child');
  protected readonly needsCredentials = computed(() =>
    this.isUsersSection() && !this.isEditing() && !this.isChildCategory()
  );
  protected readonly memberContextLabel = computed(() =>
    this.isEditing()
      ? 'Este registro pertence à área de membros compradores de rifa.'
      : 'Este cadastro será criado como membro comprador de rifa.'
  );

  protected onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const value = select?.value;

    if (value === 'child' || value === 'volunteer' || value === 'collaborator') {
      this.selectedCategory.set(value);
    }

    if (value === 'child') {
      this.form.controls.portalRole.setValue('none', { emitEvent: false });
      return;
    }

    if (this.isUsersSection() && !this.isEditing()) {
      this.form.controls.portalRole.setValue('publisher', { emitEvent: false });
    }
  }

  private readonly enforceCategoryRoleRule = effect(
    () => {
      if (!this.isUsersSection()) {
        return;
      }

      if (this.selectedCategory() === 'child') {
        this.form.controls.portalRole.setValue('none', { emitEvent: false });
        return;
      }

      if (!this.isEditing()) {
        this.form.controls.portalRole.setValue('publisher', { emitEvent: false });
      }
    },
    { allowSignalWrites: true }
  );

  private readonly syncCredentialValidators = effect(() => {
    if (this.needsCredentials()) {
      this.form.controls.email.setValidators([Validators.required, Validators.email]);
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.controls.passwordConfirmation.setValidators([Validators.required]);
    } else {
      this.form.controls.email.setValidators([Validators.email]);
      this.form.controls.password.clearValidators();
      this.form.controls.passwordConfirmation.clearValidators();
    }

    this.form.controls.email.updateValueAndValidity({ emitEvent: false });
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });
    this.form.controls.passwordConfirmation.updateValueAndValidity({ emitEvent: false });
  });

  private readonly syncFormWithMember = effect(
    () => {
      const current = this.member();

      if (!current) {
        this.submitted.set(false);
        const defaultCategory = this.section() === 'users' ? 'child' : 'collaborator';
        this.selectedCategory.set(defaultCategory);
        this.form.reset({
          fullName: '',
          phone: '',
          category: defaultCategory,
          portalRole: this.section() === 'users' ? 'publisher' : 'buyer',
          email: '',
          password: '',
          passwordConfirmation: '',
          address: '',
          notes: '',
        });
        return;
      }

      this.submitted.set(false);
      this.selectedCategory.set(current.category);
      this.form.reset({
        fullName: current.fullName,
        phone: current.phone,
        category: current.category,
        portalRole: current.portalRole,
        email: '',
        password: '',
        passwordConfirmation: '',
        address: current.address ?? '',
        notes: current.notes ?? '',
      });

      if (this.isUsersSection() && current.category === 'child') {
        this.form.controls.portalRole.setValue('none', { emitEvent: false });
      }
    },
    { allowSignalWrites: true }
  );

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const rawValue = input?.value ?? '';
    const digits = rawValue.replace(/\D/g, '').slice(0, 11);

    if (digits.length === 0) {
      this.form.controls.phone.setValue('', { emitEvent: false });
      return;
    }

    const ddd = digits.slice(0, 2);
    const firstPart = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
    const secondPart = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);

    const masked = [
      ddd ? `(${ddd}` : '',
      ddd.length === 2 ? ')' : '',
      firstPart ? ` ${firstPart}` : '',
      secondPart ? `-${secondPart}` : '',
    ].join('');

    this.form.controls.phone.setValue(masked, { emitEvent: false });
  }

  protected hasError(
    controlName: 'fullName' | 'phone' | 'address' | 'email' | 'password' | 'passwordConfirmation',
    errorCode: 'required' | 'minlength' | 'email' | 'mismatch'
  ): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }

  protected submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.needsCredentials() && this.form.controls.password.value !== this.form.controls.passwordConfirmation.value) {
      this.form.controls.passwordConfirmation.setErrors({ mismatch: true });
      this.form.controls.passwordConfirmation.markAsTouched();
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    this.save.emit({
      ...payload,
      category: this.section() === 'members' ? 'collaborator' : payload.category,
      portalRole: this.section() === 'members'
        ? 'buyer'
        : payload.category === 'child'
          ? 'none'
          : !this.isEditing()
            ? 'publisher'
          : payload.portalRole,
      email: payload.email,
      password: payload.password,
      passwordConfirmation: payload.passwordConfirmation,
    });
  }
}
