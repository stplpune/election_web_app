import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCandidateToConstituencyComponent } from './assign-candidate-to-constituency.component';

describe('AssignCandidateToConstituencyComponent', () => {
  let component: AssignCandidateToConstituencyComponent;
  let fixture: ComponentFixture<AssignCandidateToConstituencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignCandidateToConstituencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignCandidateToConstituencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
