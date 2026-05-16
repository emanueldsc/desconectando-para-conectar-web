import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DonationCreatePayload, PaymentMethod } from '../../donations.models';

@Component({
  selector: 'dashboard-donation-create-modal',
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './donation-create-modal.html',
  styleUrl: './donation-create-modal.scss',
})
export class DonationCreateModal {
  private readonly fb = inject(FormBuilder);

  readonly cancel = output<void>();
  readonly save = output<DonationCreatePayload>();

  protected readonly form = this.fb.nonNullable.group({
    donorName: ['', [Validators.required, Validators.minLength(3)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: ['', [Validators.required]],
    paymentMethod: ['pix' as PaymentMethod, [Validators.required]],
    isConfirmed: [true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }
}
