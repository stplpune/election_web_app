import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsActivityComponent } from './agents-activity.component';

describe('AgentsActivityComponent', () => {
  let component: AgentsActivityComponent;
  let fixture: ComponentFixture<AgentsActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentsActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
