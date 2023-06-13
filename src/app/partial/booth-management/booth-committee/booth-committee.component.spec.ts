import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoothCommitteeComponent } from './booth-committee.component';

describe('BoothCommitteeComponent', () => {
  let component: BoothCommitteeComponent;
  let fixture: ComponentFixture<BoothCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoothCommitteeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoothCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
