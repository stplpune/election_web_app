import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateElectionsComponent } from './create-elections.component';

describe('CreateElectionsComponent', () => {
  let component: CreateElectionsComponent;
  let fixture: ComponentFixture<CreateElectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateElectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateElectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
