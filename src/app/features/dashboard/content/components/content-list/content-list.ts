import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Publication, PublicationFilter, PublicationStatus } from '../../content.models';

@Component({
  selector: 'dashboard-content-list',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-list.html',
  styleUrl: './content-list.scss',
})
export class ContentList {
  readonly publications = input.required<readonly Publication[]>();
  readonly query = input.required<string>();
  readonly filter = input.required<PublicationFilter>();

  readonly queryChange = output<string>();
  readonly filterChange = output<PublicationFilter>();
  readonly create = output<void>();
  readonly edit = output<Publication>();
  readonly delete = output<Publication>();

  protected readonly filteredPublications = computed(() => {
    const query = this.query().toLowerCase().trim();
    const filter = this.filter();

    return this.publications().filter((p) => {
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' && p.status === 'published') ||
        (filter === 'draft' && p.status === 'draft');

      return matchesSearch && matchesFilter;
    });
  });

  protected readonly statusLabel: Record<PublicationStatus, string> = {
    published: 'Publicado',
    draft: 'Rascunho',
  };

  protected readonly statusIcon: Record<PublicationStatus, string> = {
    published: 'check_circle',
    draft: 'draft',
  };

  protected onSearch(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}
