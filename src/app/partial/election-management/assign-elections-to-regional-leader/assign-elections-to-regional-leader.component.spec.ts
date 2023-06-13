import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignElectionsToRegionalLeaderComponent } from './assign-elections-to-regional-leader.component';

describe('AssignElectionsToRegionalLeaderComponent', () => {
  let component: AssignElectionsToRegionalLeaderComponent;
  let fixture: ComponentFixture<AssignElectionsToRegionalLeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignElectionsToRegionalLeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignElectionsToRegionalLeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
