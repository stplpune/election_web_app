import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoFanceComponent } from './geo-fance.component';

describe('GeoFanceComponent', () => {
  let component: GeoFanceComponent;
  let fixture: ComponentFixture<GeoFanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoFanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoFanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
