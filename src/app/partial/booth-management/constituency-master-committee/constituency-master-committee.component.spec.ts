import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstituencyMasterCommitteeComponent } from './constituency-master-committee.component';

describe('ConstituencyMasterCommitteeComponent', () => {
  let component: ConstituencyMasterCommitteeComponent;
  let fixture: ComponentFixture<ConstituencyMasterCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstituencyMasterCommitteeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstituencyMasterCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
