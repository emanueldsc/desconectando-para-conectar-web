import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
  protected readonly publications = signal<Publication[]>([...MOCK_PUBLICATIONS]);
  protected readonly view = signal<ViewType>('list');
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<PublicationFilter>('all');
  protected readonly publicationToDelete = signal<Publication | null>(null);
  protected readonly editingPublication = signal<Publication | null>(null);

  protected readonly isGloballyEmpty = computed(() => this.publications().length === 0);

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
      this.publications.update((pubs) => pubs.filter((p) => p.id !== toDelete.id));
    }
    this.closeDeleteModal();
  }

  private savePublication(payload: PublicationPayload, status: 'draft' | 'published'): void {
    const editing = this.editingPublication();
    if (editing) {
      this.publications.update((pubs) =>
        pubs.map((pub) =>
          pub.id === editing.id
            ? {
                ...pub,
                title: payload.title,
                status,
                date: this.formatDateLabel(new Date()),
              }
            : pub
        )
      );
    } else {
      this.publications.update((pubs) => {
        const nextId = Math.max(0, ...pubs.map((p) => p.id)) + 1;
        const created: Publication = {
          id: nextId,
          title: payload.title,
          author: 'Equipe DPC',
          date: this.formatDateLabel(new Date()),
          status,
        };
        return [created, ...pubs];
      });
    }

    this.cancelEdit();
  }

  private formatDateLabel(date: Date): string {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);

    return formatted.replace('.', '');
  }
}
