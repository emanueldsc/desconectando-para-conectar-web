import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
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

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    category: ['child' as CreateMemberPayload['category'], [Validators.required]],
    portalRole: ['buyer' as CreateMemberPayload['portalRole'], [Validators.required]],
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

  protected readonly isUsersSection = computed(() => this.section() === 'users');

  private readonly syncFormWithMember = effect(
    () => {
      const current = this.member();

      if (!current) {
        this.form.reset({
          fullName: '',
          phone: '',
          category: this.section() === 'users' ? 'collaborator' : 'child',
          portalRole: this.section() === 'users' ? 'buyer' : 'manager',
        address: '',
        notes: '',
      });
        return;
      }

      this.form.reset({
        fullName: current.fullName,
        phone: current.phone,
        category: current.category,
        portalRole: current.portalRole,
        address: current.address ?? '',
        notes: current.notes ?? '',
      });
    },
    { allowSignalWrites: true }
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    this.save.emit({
      ...payload,
      category: this.section() === 'users' ? 'collaborator' : payload.category,
      portalRole: this.section() === 'users' ? 'buyer' : payload.portalRole,
    });
  }
}
