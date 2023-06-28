import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalGovtBodyComponent } from './local-govt-body.component';

describe('LocalGovtBodyComponent', () => {
  let component: LocalGovtBodyComponent;
  let fixture: ComponentFixture<LocalGovtBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalGovtBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalGovtBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
