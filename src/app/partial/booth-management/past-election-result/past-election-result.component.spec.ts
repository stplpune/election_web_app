import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastElectionResultComponent } from './past-election-result.component';

describe('PastElectionResultComponent', () => {
  let component: PastElectionResultComponent;
  let fixture: ComponentFixture<PastElectionResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastElectionResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastElectionResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
