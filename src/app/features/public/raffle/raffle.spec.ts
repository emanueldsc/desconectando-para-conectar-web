import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Raffle } from './raffle';

describe('Raffle', () => {
  let component: Raffle;
  let fixture: ComponentFixture<Raffle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Raffle],
    }).compileComponents();

    fixture = TestBed.createComponent(Raffle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
