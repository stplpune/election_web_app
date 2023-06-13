import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBoothToConstituencyComponent } from './assign-booth-to-constituency.component';

describe('AssignBoothToConstituencyComponent', () => {
  let component: AssignBoothToConstituencyComponent;
  let fixture: ComponentFixture<AssignBoothToConstituencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignBoothToConstituencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignBoothToConstituencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
