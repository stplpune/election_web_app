import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTalukaToAssemblyComponent } from './assign-taluka-to-assembly.component';

describe('AssignTalukaToAssemblyComponent', () => {
  let component: AssignTalukaToAssemblyComponent;
  let fixture: ComponentFixture<AssignTalukaToAssemblyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTalukaToAssemblyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTalukaToAssemblyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
