import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocalAreaComponent } from './add-local-area.component';

describe('AddLocalAreaComponent', () => {
  let component: AddLocalAreaComponent;
  let fixture: ComponentFixture<AddLocalAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLocalAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLocalAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
