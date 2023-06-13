import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAgentsToBoothComponent } from './assign-agents-to-booth.component';

describe('AssignAgentsToBoothComponent', () => {
  let component: AssignAgentsToBoothComponent;
  let fixture: ComponentFixture<AssignAgentsToBoothComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignAgentsToBoothComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignAgentsToBoothComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
