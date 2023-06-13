import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameCorrectionComponent } from './name-correction.component';

describe('NameCorrectionComponent', () => {
  let component: NameCorrectionComponent;
  let fixture: ComponentFixture<NameCorrectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameCorrectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
