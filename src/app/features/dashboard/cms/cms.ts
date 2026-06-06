import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { BlogPostPreview, CmsBanner, CmsHeroButton, CmsRealitySection, CmsSettings } from '../../../shared/models/api-contracts.models';
import { AdminCmsApiService } from '../../../shared/services/admin-cms-api.service';
import { CmsBlogApiService } from '../../../shared/services/cms-blog-api.service';

@Component({
  selector: 'dashboard-cms',
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cms.html',
  styleUrl: './cms.scss',
})
export class Cms {
  private static readonly MAX_BANNER_SIZE_BYTES = 15 * 1024 * 1024;
  private static readonly FALLBACK_BANNER_URL = 'https://placehold.co/1200x675/png?text=Banner';
  private static readonly MAX_SELECTED_PUBLICATIONS = 4;

  private readonly fb = inject(FormBuilder);
  private readonly cmsApi = inject(AdminCmsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly blogApi = inject(CmsBlogApiService);

  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly isUploadingBanner = signal(false);
  protected readonly availablePublications = signal<BlogPostPreview[]>([]);
  // Signals para busca e paginação de publicações
  protected readonly publicationSearch = signal('');
  private publicationSearchTimeout: any = null;
  protected readonly publicationPage = signal(1);
  protected readonly publicationTotalPages = signal(1);
  protected readonly publicationTotal = signal(0);
  protected readonly filteredPagedPublications = signal<BlogPostPreview[]>([]);
  private readonly publicationLimit = 8;
  protected readonly isLoadingPublications = signal(false);
  protected readonly materialIcons = [
    'favorite_border',
    'favorite',
    'volunteer_activism',
    'campaign',
    'arrow_forward',
    'chevron_right',
    'link',
    'handshake',
  ] as const;
  protected readonly feedback = signal<{ text: string; isError: boolean } | null>(null);

  protected readonly cmsForm = this.fb.nonNullable.group({
    banners: this.fb.array([] as ReturnType<Cms['createBannerGroup']>[]),
    phrases: this.fb.array([] as ReturnType<Cms['createPhraseControl']>[]),
    heroButton: this.fb.nonNullable.group({
      title: ['Desconectando para Conectar', [Validators.required]],
      label: ['Participar Agora', [Validators.required]],
      link: ['/public/raffles', [Validators.required]],
      icon: ['favorite_border', [Validators.required]],
      backgroundColor: ['#d35400', [Validators.required]],
      textColor: ['#ffffff', [Validators.required]],
    }),
    realitySection: this.fb.nonNullable.group({
      title: ['Nossa Realidade', [Validators.required]],
      subtitle: ['Publicações em destaque sobre a transformação da nossa comunidade.', [Validators.required]],
      displayMode: this.fb.nonNullable.control<'latest' | 'selected'>('latest', [Validators.required]),
      publicationIds: this.fb.nonNullable.control<number[]>([]),
    }),
    contact: this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      whatsapp: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    }),
    socials: this.fb.nonNullable.group({
      instagram: [''],
      facebook: [''],
      youtube: [''],
    }),
    monthlyGoal: this.fb.nonNullable.control(20000, [Validators.required, Validators.min(0)]),
  });

  public constructor() {
    this.loadSettings();
    // Carregar publicações se modo "selected" já estiver ativo
    if (this.cmsForm.controls.realitySection.controls.displayMode.value === 'selected') {
      this.loadPublications();
    }
    // Reagir à mudança de modo
    this.cmsForm.controls.realitySection.controls.displayMode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => {
        if (mode === 'selected') {
          this.loadPublications();
        }
      });
  }
  // Métodos para busca e paginação de publicações

  protected onPublicationSearchChange(value: string): void {
    this.isLoadingPublications.set(true);
    this.filteredPagedPublications.set([]);
    this.publicationSearch.set(value);
    this.publicationPage.set(1);
    if (this.publicationSearchTimeout) {
      clearTimeout(this.publicationSearchTimeout);
    }
    this.publicationSearchTimeout = setTimeout(() => {
      this.loadPublications();
    }, 1000);
  }

  protected goToPreviousPublicationPage(): void {
    if (this.publicationPage() > 1) {
      this.publicationPage.set(this.publicationPage() - 1);
      this.loadPublications();
    }
  }

  protected goToNextPublicationPage(): void {
    if (this.publicationPage() < this.publicationTotalPages()) {
      this.publicationPage.set(this.publicationPage() + 1);
      this.loadPublications();
    }
  }

  private loadPublications(): void {
    this.isLoadingPublications.set(true);
    this.filteredPagedPublications.set([]);
    this.blogApi.getBlogList({
      page: this.publicationPage(),
      limit: this.publicationLimit,
      search: this.publicationSearch(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingPublications.set(false))
      )
      .subscribe({
        next: (response) => {
          this.filteredPagedPublications.set(response.data);
          this.publicationTotal.set(response.pagination.total);
          this.publicationTotalPages.set(response.pagination.pages);
        },
        error: () => {
          this.filteredPagedPublications.set([]);
          this.publicationTotal.set(0);
          this.publicationTotalPages.set(1);
        }
      });
  }

  protected get bannersArray(): FormArray {
    return this.cmsForm.controls.banners;
  }

  protected get phrasesArray(): FormArray {
    return this.cmsForm.controls.phrases;
  }

  protected get bannerGroup() {
    return this.bannersArray.at(0);
  }

  protected hasBannerImage(): boolean {
    const url = this.bannerGroup?.get('url')?.value;

    return typeof url === 'string' && url.trim().length > 0;
  }

  protected handleBannerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > Cms.MAX_BANNER_SIZE_BYTES) {
      this.feedback.set({
        text: 'A imagem é muito grande. Envie um arquivo de até 15MB.',
        isError: true,
      });

      if (input) {
        input.value = '';
      }

      return;
    }

    const bannerGroup = this.bannerGroup;

    if (!bannerGroup) {
      return;
    }

    const previousUrl = bannerGroup?.get('url')?.value;
    const previousLocalUrl = this.extractPreviousLocalBannerUrl(previousUrl);

    this.isUploadingBanner.set(true);
    this.feedback.set(null);

    this.cmsApi.uploadBannerImage(file, previousLocalUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isUploadingBanner.set(false))
      )
      .subscribe({
        next: (response) => {
          bannerGroup?.get('url')?.setValue(response.url);
          this.feedback.set({
            text: response.message,
            isError: false,
          });
        },
        error: (error: unknown) => {
          this.feedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true,
          });
        }
      });

    if (input) {
      input.value = '';
    }
  }

  protected toggleRealityPublication(publicationId: number, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const checked = input?.checked ?? false;
    const selectedIds = this.cmsForm.controls.realitySection.controls.publicationIds.value;

    if (checked) {
      if (selectedIds.includes(publicationId)) {
        return;
      }

      if (selectedIds.length >= Cms.MAX_SELECTED_PUBLICATIONS) {
        this.feedback.set({
          text: 'Selecione no máximo 4 publicações para a área Nossa Realidade.',
          isError: true,
        });

        if (input) {
          input.checked = false;
        }

        return;
      }

      this.cmsForm.controls.realitySection.controls.publicationIds.setValue([...selectedIds, publicationId]);
      return;
    }

    this.cmsForm.controls.realitySection.controls.publicationIds.setValue(
      selectedIds.filter((currentId) => currentId !== publicationId)
    );
  }

  protected isRealityPublicationSelected(publicationId: number): boolean {
    return this.cmsForm.controls.realitySection.controls.publicationIds.value.includes(publicationId);
  }

  protected removeBannerImage(): void {
    const bannerGroup = this.bannerGroup;

    if (!bannerGroup) {
      return;
    }

    bannerGroup.get('url')?.setValue('');

    this.feedback.set({
      text: 'Imagem removida. Clique em Salvar Alterações para confirmar.',
      isError: false,
    });
  }

  protected addPhrase(): void {
    this.phrasesArray.push(this.createPhraseControl(''));
  }

  protected deletePhrase(index: number): void {
    this.phrasesArray.removeAt(index);
  }

  protected save(): void {
    this.feedback.set(null);

    if (this.cmsForm.invalid) {
      this.cmsForm.markAllAsTouched();
      this.feedback.set({
        text: 'Revise os campos obrigatórios antes de salvar.',
        isError: true,
      });
      return;
    }

    if (this.bannersArray.length === 0 || this.phrasesArray.length === 0) {
      this.feedback.set({
        text: 'Inclua ao menos um banner e uma frase de impacto.',
        isError: true,
      });
      return;
    }

    const realitySection = this.cmsForm.controls.realitySection.getRawValue();

    if (realitySection.displayMode === 'selected' && realitySection.publicationIds.length === 0) {
      this.feedback.set({
        text: 'Selecione ao menos uma publicação para a área Nossa Realidade.',
        isError: true,
      });

      return;
    }

    this.isSaving.set(true);

    this.cmsApi.updateSettings({
      banners: this.bannersArray.getRawValue(),
      phrases: this.phrasesArray.getRawValue(),
      heroButton: this.cmsForm.controls.heroButton.getRawValue(),
      realitySection,
      contact: this.cmsForm.controls.contact.getRawValue(),
      socials: this.cmsForm.controls.socials.getRawValue(),
      monthlyGoal: this.cmsForm.controls.monthlyGoal.getRawValue(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (response) => {
          this.patchForm(response.data);
          this.availablePublications.set(response.availablePublications ?? this.availablePublications());
          this.feedback.set({
            text: response.message,
            isError: false,
          });
        },
        error: (error: unknown) => {
          this.feedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true,
          });
        }
      });
  }

  protected bannerControlAt(index: number) {
    return this.bannersArray.at(index);
  }

  protected phraseControlAt(index: number) {
    return this.phrasesArray.at(index);
  }

  protected handleBannerImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;

    if (!image || image.src === Cms.FALLBACK_BANNER_URL) {
      return;
    }

    image.src = Cms.FALLBACK_BANNER_URL;
  }

  private loadSettings(): void {
    this.isLoading.set(true);

    this.cmsApi.getSettings()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.patchForm(response.data);
          this.availablePublications.set(response.availablePublications ?? []);
          this.feedback.set(null);
        },
        error: (error: unknown) => {
          this.feedback.set({
            text: this.extractApiErrorMessage(error),
            isError: true,
          });
        }
      });
  }

  private patchForm(data: CmsSettings): void {
    this.bannersArray.clear();
    this.phrasesArray.clear();

    const firstBanner = data.banners[0] ?? {
      url: '',
      alt: '',
      label: 'Banner Principal',
    };

    this.bannersArray.push(this.createBannerGroup(firstBanner));

    data.phrases.forEach((phrase) => {
      this.phrasesArray.push(this.createPhraseControl(phrase));
    });

    this.cmsForm.controls.heroButton.patchValue(data.heroButton ?? this.defaultHeroButton());
    this.cmsForm.controls.realitySection.patchValue({
      ...(data.realitySection ?? this.defaultRealitySection()),
      publicationIds: data.realitySection?.publicationIds ?? [],
    });
    this.cmsForm.controls.contact.patchValue(data.contact);
    this.cmsForm.controls.socials.patchValue(data.socials);
    this.cmsForm.controls.monthlyGoal.patchValue(data.monthlyGoal ?? 20000);
  }

  private createBannerGroup(banner: CmsBanner) {
    return this.fb.nonNullable.group({
      url: [banner.url],
      alt: [banner.alt, [Validators.required]],
      label: [banner.label, [Validators.required]],
    });
  }

  private createPhraseControl(phrase: string) {
    return this.fb.nonNullable.control(phrase, [Validators.required]);
  }

  private defaultHeroButton(): CmsHeroButton {
    return {
      title: 'Desconectando para Conectar',
      label: 'Participar Agora',
      link: '/public/raffles',
      icon: 'favorite_border',
      backgroundColor: '#d35400',
      textColor: '#ffffff',
    };
  }

  private defaultRealitySection(): CmsRealitySection {
    return {
      title: 'Nossa Realidade',
      subtitle: 'Publicações em destaque sobre a transformação da nossa comunidade.',
      displayMode: 'latest',
      publicationIds: [],
    };
  }

  private extractApiErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const errorMessage = error.error?.message;
      const validationErrors = error.error?.errors;

      if (validationErrors && typeof validationErrors === 'object') {
        const firstFieldErrors = Object.values(validationErrors)[0];

        if (Array.isArray(firstFieldErrors) && typeof firstFieldErrors[0] === 'string') {
          return firstFieldErrors[0];
        }
      }

      if (typeof errorMessage === 'string' && errorMessage.trim().length > 0) {
        return errorMessage;
      }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Não foi possível atualizar o CMS agora. Tente novamente.';
  }

  private extractPreviousLocalBannerUrl(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return undefined;
    }

    // Previous URL is only needed for deleting replaced local files.
    if (!normalized.includes('/storage/cms-banners/')) {
      return undefined;
    }

    return normalized;
  }
}
