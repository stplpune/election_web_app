import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyHeadReportComponent } from './family-head-report.component';

describe('FamilyHeadReportComponent', () => {
  let component: FamilyHeadReportComponent;
  let fixture: ComponentFixture<FamilyHeadReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FamilyHeadReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyHeadReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
