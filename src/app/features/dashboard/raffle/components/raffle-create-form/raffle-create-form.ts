import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CreateRafflePayload, RaffleCampaign } from '../../raffle.models';

@Component({
  selector: 'dashboard-raffle-create-form',
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './raffle-create-form.html',
  styleUrl: './raffle-create-form.scss',
})
export class RaffleCreateForm {
  private readonly fb = inject(FormBuilder);

  readonly editingRaffle = input<RaffleCampaign | null>(null);
  readonly cancel = output<void>();
  readonly save = output<CreateRafflePayload>();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(12)]],
    rangeStart: [0, [Validators.required, Validators.min(0)]],
    rangeEnd: [100, [Validators.required, Validators.min(1)]],
    ticketPrice: [10, [Validators.required, Validators.min(1)]],
  });

  protected readonly heading = computed(() =>
    this.editingRaffle() ? 'Editar Ação Entre Amigos' : 'Nova Ação Entre Amigos'
  );

  protected readonly subtitle = computed(() =>
    this.editingRaffle()
      ? 'Atualize os dados da campanha com segurança.'
      : 'Crie sua rifa inspirada na força do sertão.'
  );

  protected ngOnChanges(): void {
    const raffle = this.editingRaffle();
    if (!raffle) {
      this.form.reset({
        title: '',
        description: '',
        rangeStart: 0,
        rangeEnd: 100,
        ticketPrice: 10,
      });
      return;
    }

    this.form.reset({
      title: raffle.title,
      description: raffle.description,
      rangeStart: raffle.rangeStart,
      rangeEnd: raffle.rangeEnd,
      ticketPrice: raffle.ticketPrice,
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }
}
