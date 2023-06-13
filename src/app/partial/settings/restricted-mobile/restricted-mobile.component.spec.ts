import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedMobileComponent } from './restricted-mobile.component';

describe('RestrictedMobileComponent', () => {
  let component: RestrictedMobileComponent;
  let fixture: ComponentFixture<RestrictedMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestrictedMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictedMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
