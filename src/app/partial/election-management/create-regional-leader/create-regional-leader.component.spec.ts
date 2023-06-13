import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRegionalLeaderComponent } from './create-regional-leader.component';

describe('CreateRegionalLeaderComponent', () => {
  let component: CreateRegionalLeaderComponent;
  let fixture: ComponentFixture<CreateRegionalLeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRegionalLeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRegionalLeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
