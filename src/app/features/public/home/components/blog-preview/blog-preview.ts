import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
}
