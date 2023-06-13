import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProminentLeaderComponent } from './prominent-leader.component';

describe('ProminentLeaderComponent', () => {
  let component: ProminentLeaderComponent;
  let fixture: ComponentFixture<ProminentLeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProminentLeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProminentLeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
