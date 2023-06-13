import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectionDashboardComponent } from './election-dashboard.component';

describe('ElectionDashboardComponent', () => {
  let component: ElectionDashboardComponent;
  let fixture: ComponentFixture<ElectionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectionDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
