import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastMasterComponent } from './cast-master.component';

describe('CastMasterComponent', () => {
  let component: CastMasterComponent;
  let fixture: ComponentFixture<CastMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CastMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CastMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
