import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcToPcComponent } from './ac-to-pc.component';

describe('AcToPcComponent', () => {
  let component: AcToPcComponent;
  let fixture: ComponentFixture<AcToPcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcToPcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcToPcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
