import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Publication, PublicationPayload } from '../../content.models';

@Component({
  selector: 'dashboard-content-editor',
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-editor.html',
  styleUrl: './content-editor.scss',
})
export class ContentEditor {
  private readonly fb = inject(FormBuilder);

  readonly publication = input<Publication | null>(null);

  readonly cancel = output<void>();
  readonly saveDraft = output<PublicationPayload>();
  readonly publish = output<PublicationPayload>();

  protected readonly heading = computed(() =>
    this.publication() ? 'Editar Publicação' : 'Nova Publicação'
  );

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
  });

  protected ngOnChanges(): void {
    const publication = this.publication();
    this.form.reset({
      title: publication?.title ?? '',
      content: '',
    });
  }

  protected submitPublish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.publish.emit(this.form.getRawValue());
  }

  protected submitDraft(): void {
    this.saveDraft.emit(this.form.getRawValue());
  }
}
