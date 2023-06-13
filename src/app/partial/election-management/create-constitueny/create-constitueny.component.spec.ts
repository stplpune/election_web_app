import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConstituenyComponent } from './create-constitueny.component';

describe('CreateConstituenyComponent', () => {
  let component: CreateConstituenyComponent;
  let fixture: ComponentFixture<CreateConstituenyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateConstituenyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateConstituenyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
