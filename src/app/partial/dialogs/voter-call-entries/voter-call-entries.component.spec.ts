import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoterCallEntriesComponent } from './voter-call-entries.component';

describe('VoterCallEntriesComponent', () => {
  let component: VoterCallEntriesComponent;
  let fixture: ComponentFixture<VoterCallEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoterCallEntriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoterCallEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
