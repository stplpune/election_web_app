import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurnameWiseReportComponent } from './surname-wise-report.component';

describe('SurnameWiseReportComponent', () => {
  let component: SurnameWiseReportComponent;
  let fixture: ComponentFixture<SurnameWiseReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurnameWiseReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurnameWiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
