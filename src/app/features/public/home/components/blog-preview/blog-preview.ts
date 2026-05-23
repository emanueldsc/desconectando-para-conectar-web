import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BlogCardComponent, BlogCardData } from '../../../../../shared/components/blog-card/blog-card';
import { BlogPostPreview } from '../../../../../shared/models/api-contracts.models';

@Component({
  selector: 'home-blog-preview',
  imports: [BlogCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-preview.html',
  styleUrl: './blog-preview.scss'
})
export class BlogPreviewComponent {
  readonly posts = input<BlogPostPreview[] | BlogCardData[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly currentPage = input(1);
  readonly totalPages = input(1);

  readonly previousPage = output<void>();
  readonly nextPage = output<void>();

  protected goToPreviousPage(): void {
    if (this.loading() || this.currentPage() <= 1) {
      return;
    }

    this.previousPage.emit();
  }

  protected goToNextPage(): void {
    if (this.loading() || this.currentPage() >= this.totalPages()) {
      return;
    }

    this.nextPage.emit();
  }
}
