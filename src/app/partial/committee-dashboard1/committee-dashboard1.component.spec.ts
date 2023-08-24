import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeDashboard1Component } from './committee-dashboard1.component';

describe('CommitteeDashboard1Component', () => {
  let component: CommitteeDashboard1Component;
  let fixture: ComponentFixture<CommitteeDashboard1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommitteeDashboard1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeDashboard1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
