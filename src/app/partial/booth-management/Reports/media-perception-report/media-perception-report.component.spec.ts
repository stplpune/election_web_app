import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPerceptionReportComponent } from './media-perception-report.component';

describe('MediaPerceptionReportComponent', () => {
  let component: MediaPerceptionReportComponent;
  let fixture: ComponentFixture<MediaPerceptionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaPerceptionReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPerceptionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
