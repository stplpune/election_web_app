import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBoothwiseVotersListComponent } from './view-boothwise-voters-list.component';

describe('ViewBoothwiseVotersListComponent', () => {
  let component: ViewBoothwiseVotersListComponent;
  let fixture: ComponentFixture<ViewBoothwiseVotersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBoothwiseVotersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBoothwiseVotersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
