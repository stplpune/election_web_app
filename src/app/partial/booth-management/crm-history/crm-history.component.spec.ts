import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmHistoryComponent } from './crm-history.component';

describe('CrmHistoryComponent', () => {
  let component: CrmHistoryComponent;
  let fixture: ComponentFixture<CrmHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
