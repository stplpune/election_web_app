import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAccessRightComponent } from './page-access-right.component';

describe('PageAccessRightComponent', () => {
  let component: PageAccessRightComponent;
  let fixture: ComponentFixture<PageAccessRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAccessRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAccessRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
