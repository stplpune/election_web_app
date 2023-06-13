import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBoothToVillageComponent } from './assign-booth-to-village.component';

describe('AssignBoothToVillageComponent', () => {
  let component: AssignBoothToVillageComponent;
  let fixture: ComponentFixture<AssignBoothToVillageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignBoothToVillageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignBoothToVillageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
