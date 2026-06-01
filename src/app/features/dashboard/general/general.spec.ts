import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminGeneralApiService } from '../../../shared/services/admin-general-api.service';

import { General } from './general';

describe('General', () => {
  let component: General;
  let fixture: ComponentFixture<General>;
  let getOverviewCalls = 0;

  beforeEach(async () => {
    getOverviewCalls = 0;

    const apiMock: Pick<AdminGeneralApiService, 'getOverview'> = {
      getOverview: () => {
        getOverviewCalls += 1;
        return of({
          success: true,
          data: {
            metrics: {
              totalDonationsCurrentMonth: 0,
              totalRafflePointsCurrentMonth: 0,
              totalRaisedCurrentMonth: 0,
              activeRaffles: 0,
              finishedRaffles: 0,
              usersTotal: 0,
              membersTotal: 0,
              monthlyTarget: 0,
              goalProgress: 0,
              historyLastSixMonths: [],
            },
            cards: [],
          },
        });
      },
    };

    await TestBed.configureTestingModule({
      imports: [General],
      providers: [{ provide: AdminGeneralApiService, useValue: apiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(General);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request overview data on init', () => {
    expect(getOverviewCalls).toBeGreaterThan(0);
  });

  it('should set error when api fails', async () => {
    const errorApiMock: Pick<AdminGeneralApiService, 'getOverview'> = {
      getOverview: () => throwError(() => new Error('Falha da API')),
    };

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [General],
      providers: [{ provide: AdminGeneralApiService, useValue: errorApiMock }],
    }).compileComponents();

    const errorFixture = TestBed.createComponent(General);
    const errorComponent = errorFixture.componentInstance;

    errorComponent.ngOnInit();

    expect((errorComponent as any).cards()).toEqual([]);
    expect((errorComponent as any).loadError()).toBe('Nao foi possivel carregar os indicadores agora.');
    expect((errorComponent as any).loading()).toBeFalsy();
  });
});
