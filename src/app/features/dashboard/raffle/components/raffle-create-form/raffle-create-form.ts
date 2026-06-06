import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { AdminRaffleApiService } from '../../../../../shared/services/admin-raffle-api.service';
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
  private readonly raffleApi = inject(AdminRaffleApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly editingRaffle = input<RaffleCampaign | null>(null);
  readonly isSaving = input(false);
  readonly cancel = output<void>();
  readonly save = output<CreateRafflePayload>();
  protected readonly uploadedImageUrl = signal<string | null>(null);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly isUploadingImage = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(12)]],
    rangeStart: [1, [Validators.required, Validators.min(1)]],
    rangeEnd: [100, [Validators.required, Validators.min(1)]],
    ticketPrice: [10, [Validators.required, Validators.min(1)]],
    reservationTimeoutMinutes: [30, [Validators.required, Validators.min(1), Validators.max(10080)]],
    drawDate: [''],
    drawDateUndefined: [false],
  }, { validators: [rangeValidator] });

  protected readonly heading = computed(() =>
    this.editingRaffle() ? 'Editar Ação Entre Amigos' : 'Nova Ação Entre Amigos'
  );

  protected readonly subtitle = computed(() =>
    this.editingRaffle()
      ? 'Atualize os dados da campanha com segurança.'
      : 'Crie sua rifa inspirada na força do sertão.'
  );

  private readonly syncEditingState = effect(
    () => {
      const raffle = this.editingRaffle();
      if (!raffle) {
        this.form.reset({
          title: '',
          description: '',
          rangeStart: 1,
          rangeEnd: 100,
          ticketPrice: 10,
          reservationTimeoutMinutes: 30,
          drawDate: '',
          drawDateUndefined: false,
        });
        this.uploadedImageUrl.set(null);
        this.uploadError.set(null);
        return;
      }

      this.form.reset({
        title: raffle.title,
        description: raffle.description,
        rangeStart: raffle.rangeStart,
        rangeEnd: raffle.rangeEnd,
        ticketPrice: raffle.ticketPrice,
        reservationTimeoutMinutes: raffle.reservationTimeoutMinutes,
        drawDate: this.toDateInputValue(raffle.drawDate),
        drawDateUndefined: raffle.drawDate == null,
      });
      this.uploadedImageUrl.set(raffle.imageUrl ?? null);
      this.uploadError.set(null);
    },
    { allowSignalWrites: true }
  );

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    this.isUploadingImage.set(true);
    this.uploadError.set(null);

    this.raffleApi
      .uploadRaffleImage(file, this.uploadedImageUrl() ?? this.editingRaffle()?.imageUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isUploadingImage.set(false);
          input.value = '';
        })
      )
      .subscribe({
        next: (url) => {
          this.uploadedImageUrl.set(url);
        },
        error: () => {
          this.uploadError.set('Nao foi possivel enviar a imagem da rifa.');
        },
      });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    if (!payload.drawDateUndefined && (payload.drawDate ?? '').trim() === '') {
      this.form.controls.drawDate.setErrors({ required: true });
      this.form.controls.drawDate.markAsTouched();
      return;
    }

    this.save.emit({
      ...payload,
      drawDate: payload.drawDateUndefined ? null : payload.drawDate,
      imageUrl: this.uploadedImageUrl() ?? undefined,
    });
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().slice(0, 10);
  }
}

function rangeValidator(control: AbstractControl): ValidationErrors | null {
  const rangeStart = Number(control.get('rangeStart')?.value ?? 0);
  const rangeEnd = Number(control.get('rangeEnd')?.value ?? 0);

  if (Number.isNaN(rangeStart) || Number.isNaN(rangeEnd)) {
    return null;
  }

  return rangeEnd < rangeStart ? { rangeInvalid: true } : null;
}
