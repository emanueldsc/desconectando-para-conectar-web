import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DrawRafflePayload, RaffleCampaign } from '../../raffle.models';

@Component({
  selector: 'dashboard-raffle-draw-confirm',
  imports: [MatIconModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-draw-confirm.html',
  styleUrl: './raffle-draw-confirm.scss',
})
export class RaffleDrawConfirm {
  private readonly fb = inject(FormBuilder);

  readonly raffle = input.required<RaffleCampaign>();
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly confirm = output<DrawRafflePayload>();
  readonly cancel = output<void>();

  protected readonly totalTickets = computed(() =>
    this.raffle().rangeEnd - this.raffle().rangeStart + 1
  );

  protected readonly form = this.fb.nonNullable.group({
    winnerNumber: [1, [Validators.required, Validators.min(1)]],
    sourceComment: ['', [Validators.required, Validators.maxLength(500)]],
  });

  public constructor() {
    effect(() => {
      this.form.reset({
        winnerNumber: this.raffle().rangeStart,
        sourceComment: '',
      });
    });
  }

  protected submitDraw(): void {
    this.form.controls.winnerNumber.setValidators([
      Validators.required,
      Validators.min(this.raffle().rangeStart),
      Validators.max(this.raffle().rangeEnd),
    ]);
    this.form.controls.winnerNumber.updateValueAndValidity({ emitEvent: false });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    this.confirm.emit({
      winnerNumber: payload.winnerNumber,
      sourceComment: payload.sourceComment,
    });
  }
}
