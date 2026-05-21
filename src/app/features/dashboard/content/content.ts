import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AdminBlogApiService, AdminBlogPost } from '../../../shared/services/admin-blog-api.service';
import { ContentDeleteConfirm } from './components/content-delete-confirm/content-delete-confirm';
import { ContentEditor } from './components/content-editor/content-editor';
import { ContentEmptyState } from './components/content-empty-state/content-empty-state';
import { ContentList } from './components/content-list/content-list';
import { Publication, PublicationFilter, PublicationPayload } from './content.models';

type ViewType = 'list' | 'edit';

const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: 1,
    title: 'O Som do Sertão',
    author: 'Maria Silva',
    date: '24 Out 2023',
    status: 'published',
  },
  {
    id: 2,
    title: 'Preparativos para a Festa',
    author: 'João Pedro',
    date: '28 Out 2023',
    status: 'draft',
  },
  {
    id: 3,
    title: 'A Colheita deste Ano',
    author: 'Ana Costa',
    date: '05 Nov 2023',
    status: 'draft',
  },
];

@Component({
  selector: 'app-content',
  imports: [ContentList, ContentEditor, ContentDeleteConfirm, ContentEmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {
  private readonly blogApi = inject(AdminBlogApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly publications = signal<Publication[]>([]);
  protected readonly view = signal<ViewType>('list');
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<PublicationFilter>('all');
  protected readonly publicationToDelete = signal<Publication | null>(null);
  protected readonly editingPublication = signal<Publication | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly feedback = signal<{ text: string; isError: boolean } | null>(null);

  protected readonly isGloballyEmpty = computed(() => this.publications().length === 0);

  public constructor() {
    this.loadPublications();
  }

  protected setFilter(filter: PublicationFilter): void {
    this.activeFilter.set(filter);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected openEdit(publication?: Publication): void {
    const pub = publication ?? null;
    this.editingPublication.set(pub);
    this.view.set('edit');
  }

  protected cancelEdit(): void {
    this.view.set('list');
    this.editingPublication.set(null);
  }

  protected saveAsDraft(payload: PublicationPayload): void {
    this.savePublication(payload, 'draft');
  }

  protected publish(payload: PublicationPayload): void {
    this.savePublication(payload, 'published');
  }

  protected openDeleteModal(publication: Publication): void {
    this.publicationToDelete.set(publication);
  }

  protected closeDeleteModal(): void {
    this.publicationToDelete.set(null);
  }

  protected confirmDelete(): void {
    const toDelete = this.publicationToDelete();
    if (toDelete) {
      this.blogApi
        .deletePost(toDelete.id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: (response) => {
            this.feedback.set({
              text: response.message,
              isError: false,
            });
            this.loadPublications();
          },
          error: (error: unknown) => {
            this.feedback.set({
              text: this.extractApiErrorMessage(error),
              isError: true,
            });
          }
        });
    }
    this.closeDeleteModal();
  }

  private savePublication(payload: PublicationPayload, status: 'draft' | 'published'): void {
    if (this.saving()) {
      return;
    }

    const editing = this.editingPublication();
    const request = editing
      ? this.blogApi.updatePost(editing.id, payload, status)
      : this.blogApi.createPost(payload, status);

    this.saving.set(true);

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (response) => {
          this.feedback.set({
            text: response.message,
            isError: false,
          });
          this.cancelEdit();
          this.loadPublications();
        },
        error: (error: unknown) => {
          this.feedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true,
          });
        }
      });
  }

  private formatDateLabel(date: Date): string {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);

    return formatted.replace('.', '');
  }

  private loadPublications(): void {
    this.loading.set(true);

    this.blogApi
      .getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.publications.set(response.data.map((post) => this.mapPublication(post)));
        },
        error: (error: unknown) => {
          this.feedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true,
          });
        }
      });
  }

  private mapPublication(post: AdminBlogPost): Publication {
    return {
      id: post.id,
      title: post.title,
      author: post.author,
      date: this.formatDateLabel(new Date(post.date)),
      status: post.status,
      thumbnail: post.thumbnail,
      content: post.content,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    };
  }

  private extractApiErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const errorMessage = error.error?.message;

      if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
        return errorMessage;
      }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Nao foi possivel salvar a publicacao agora.';
  }
}
