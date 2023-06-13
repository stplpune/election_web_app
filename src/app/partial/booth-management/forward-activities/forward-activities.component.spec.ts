import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardActivitiesComponent } from './forward-activities.component';

describe('ForwardActivitiesComponent', () => {
  let component: ForwardActivitiesComponent;
  let fixture: ComponentFixture<ForwardActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForwardActivitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwardActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
