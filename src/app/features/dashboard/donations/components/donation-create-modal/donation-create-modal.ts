import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Donation, DonationCreatePayload, PaymentMethod } from '../../donations.models';

@Component({
  selector: 'dashboard-donation-create-modal',
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './donation-create-modal.html',
  styleUrl: './donation-create-modal.scss',
})
export class DonationCreateModal {
  private readonly fb = inject(FormBuilder);

  readonly donation = input<Donation | null>(null);
  readonly cancel = output<void>();
  readonly save = output<DonationCreatePayload>();

  protected readonly submitted = signal(false);

  protected readonly isEditing = computed(() => this.donation() !== null);
  protected readonly title = computed(() =>
    this.isEditing() ? 'Editar Doação' : 'Registrar Doação'
  );
  protected readonly submitLabel = computed(() =>
    this.isEditing() ? 'Salvar Alterações' : 'Salvar doação'
  );
  protected readonly headerIcon = computed(() =>
    this.isEditing() ? 'edit_square' : 'volunteer_activism'
  );

  protected readonly formErrorMessage = computed(() =>
    this.submitted() && this.form.invalid
      ? 'Revise os campos obrigatórios destacados para continuar.'
      : null
  );

  protected readonly form = this.fb.nonNullable.group({
    donorName: ['', [Validators.required, Validators.minLength(3)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: ['', [Validators.required]],
    paymentMethod: ['pix' as PaymentMethod, [Validators.required]],
    isConfirmed: [true],
    notes: [''],
  });

  private readonly syncFormWithDonation = effect(
    () => {
      const d = this.donation();
      this.submitted.set(false);

      if (!d) {
        this.form.reset({
          donorName: '',
          amount: 0,
          date: '',
          paymentMethod: 'pix',
          isConfirmed: true,
          notes: '',
        });
        return;
      }

      this.form.reset({
        donorName: d.donorName,
        amount: d.amount,
        date: d.date,
        paymentMethod: d.paymentMethod,
        isConfirmed: d.status === 'confirmed',
        notes: d.notes ?? '',
      });
    },
    { allowSignalWrites: true }
  );

  protected hasError(
    controlName: 'donorName' | 'amount' | 'date' | 'paymentMethod',
    errorCode: 'required' | 'min' | 'minlength'
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

    const raw = this.form.getRawValue();
    this.save.emit({
      donorName: raw.donorName,
      amount: raw.amount,
      date: raw.date,
      paymentMethod: raw.paymentMethod,
      isConfirmed: raw.isConfirmed,
      notes: raw.notes || null,
    });
  }
}
