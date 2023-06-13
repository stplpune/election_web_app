import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurnameCasteWiseReportComponent } from './surname-caste-wise-report.component';

describe('SurnameCasteWiseReportComponent', () => {
  let component: SurnameCasteWiseReportComponent;
  let fixture: ComponentFixture<SurnameCasteWiseReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurnameCasteWiseReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurnameCasteWiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
