import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotersProfileComponent } from './voters-profile.component';

describe('VotersProfileComponent', () => {
  let component: VotersProfileComponent;
  let fixture: ComponentFixture<VotersProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotersProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotersProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
