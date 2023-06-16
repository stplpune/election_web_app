import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteesOnMapComponent } from './committees-on-map.component';

describe('CommitteesOnMapComponent', () => {
  let component: CommitteesOnMapComponent;
  let fixture: ComponentFixture<CommitteesOnMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommitteesOnMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteesOnMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
