import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminCmsApiService } from '../../../shared/services/admin-cms-api.service';

import { Cms } from './cms';

describe('Cms', () => {
  let component: Cms;
  let fixture: ComponentFixture<Cms>;

  beforeEach(async () => {
    const cmsApiMock: Pick<AdminCmsApiService, 'getSettings' | 'updateSettings'> = {
      getSettings: () => of({
        success: true,
        data: {
          banners: [
            {
              url: 'https://cdn.exemplo.com/banner.jpg',
              alt: 'Banner',
              label: 'Principal',
            },
          ],
          phrases: ['Frase teste'],
          contact: {
            email: 'cms@exemplo.com',
            whatsapp: '(81) 99999-0000',
            phone: '(81) 3333-4444',
          },
          socials: {
            instagram: '',
            facebook: '',
            youtube: '',
          },
          heroButton: {
            title: 'Desconectando para Conectar',
            label: 'Doar Agora',
            link: '/public/raffles',
            icon: 'favorite_border',
            backgroundColor: '#d35400',
            textColor: '#ffffff',
          },
          realitySection: {
            title: 'Nossa Realidade',
            subtitle: 'Publicacoes recentes',
            displayMode: 'latest',
            publicationIds: [],
          },
          monthlyGoal: 20000,
        },
      }),
      updateSettings: () => of({
        success: true,
        message: 'ok',
        data: {
          banners: [],
          phrases: [],
          contact: { email: '', whatsapp: '', phone: '' },
          socials: { instagram: '', facebook: '', youtube: '' },
          heroButton: {
            title: 'Desconectando para Conectar',
            label: 'Doar Agora',
            link: '/public/raffles',
            icon: 'favorite_border',
            backgroundColor: '#d35400',
            textColor: '#ffffff',
          },
          realitySection: {
            title: 'Nossa Realidade',
            subtitle: 'Publicacoes recentes',
            displayMode: 'latest',
            publicationIds: [],
          },
          monthlyGoal: 20000,
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [Cms],
      providers: [
        { provide: AdminCmsApiService, useValue: cmsApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
