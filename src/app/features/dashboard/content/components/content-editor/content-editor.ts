import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminBlogApiService } from '../../../../../shared/services/admin-blog-api.service';
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
  private readonly blogApi = inject(AdminBlogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly publication = input<Publication | null>(null);

  readonly cancel = output<void>();
  readonly saveDraft = output<PublicationPayload>();
  readonly publish = output<PublicationPayload>();

  protected readonly heading = computed(() =>
    this.publication() ? 'Editar Publicação' : 'Nova Publicação'
  );

  protected readonly featuredImage = signal<string | null>(null);
  protected readonly isUploadingImage = signal(false);
  protected readonly imageFeedback = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
  });

  public constructor() {
    effect(() => {
      const publication = this.publication();

      this.form.reset({
        title: publication?.title ?? '',
        content: publication?.content ?? '',
      });

      this.featuredImage.set(publication?.thumbnail ?? null);
      this.imageFeedback.set(null);
    });
  }

  protected handleFeaturedImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    this.isUploadingImage.set(true);
    this.imageFeedback.set(null);

    const previousUrl = this.extractPreviousLocalImageUrl(this.featuredImage());

    this.blogApi
      .uploadFeaturedImage(file, previousUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.featuredImage.set(response.url);
          this.imageFeedback.set(response.message);
        },
        error: (error: unknown) => {
          this.imageFeedback.set(this.extractErrorMessage(error));
        },
      });

    if (input) {
      input.value = '';
    }
  }

  protected removeFeaturedImage(): void {
    this.featuredImage.set(null);
    this.imageFeedback.set('Imagem removida. Salve a publicação para confirmar.');
  }

  protected submitPublish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.publish.emit({
      ...this.form.getRawValue(),
      featuredImage: this.featuredImage() ?? undefined,
    });
  }

  protected submitDraft(): void {
    this.saveDraft.emit({
      ...this.form.getRawValue(),
      featuredImage: this.featuredImage() ?? undefined,
    });
  }

  protected hasFeaturedImage(): boolean {
    return typeof this.featuredImage() === 'string' && this.featuredImage() !== '';
  }

  protected handleFeaturedImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;

    if (!image || !this.featuredImage()) {
      return;
    }

    image.src = 'https://placehold.co/1200x675/png?text=Publicacao';
  }

  private extractPreviousLocalImageUrl(value: string | null): string | undefined {
    if (!value || !value.includes('/storage/blog-images/')) {
      return undefined;
    }

    return value;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const errorMessage = error.error?.message;

      if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
        return errorMessage;
      }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Nao foi possivel enviar a imagem agora.';
  }
}
