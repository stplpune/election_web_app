import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoothAnalyticsComponent } from './booth-analytics.component';

describe('BoothAnalyticsComponent', () => {
  let component: BoothAnalyticsComponent;
  let fixture: ComponentFixture<BoothAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoothAnalyticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoothAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
