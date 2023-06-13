import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteLabellingCompanyComponent } from './white-labelling-company.component';

describe('WhiteLabellingCompanyComponent', () => {
  let component: WhiteLabellingCompanyComponent;
  let fixture: ComponentFixture<WhiteLabellingCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhiteLabellingCompanyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteLabellingCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
