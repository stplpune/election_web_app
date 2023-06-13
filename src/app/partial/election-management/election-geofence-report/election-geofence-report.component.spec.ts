import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectionGeofenceReportComponent } from './election-geofence-report.component';

describe('ElectionGeofenceReportComponent', () => {
  let component: ElectionGeofenceReportComponent;
  let fixture: ComponentFixture<ElectionGeofenceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectionGeofenceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectionGeofenceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
