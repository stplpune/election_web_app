import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantLeaderComponent } from './important-leader.component';

describe('ImportantLeaderComponent', () => {
  let component: ImportantLeaderComponent;
  let fixture: ComponentFixture<ImportantLeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportantLeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportantLeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
