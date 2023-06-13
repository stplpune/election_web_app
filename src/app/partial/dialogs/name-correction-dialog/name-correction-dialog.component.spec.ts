import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameCorrectionDialogComponent } from './name-correction-dialog.component';

describe('NameCorrectionDialogComponent', () => {
  let component: NameCorrectionDialogComponent;
  let fixture: ComponentFixture<NameCorrectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameCorrectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameCorrectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
