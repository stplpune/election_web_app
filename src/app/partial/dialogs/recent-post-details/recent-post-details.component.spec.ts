import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPostDetailsComponent } from './recent-post-details.component';

describe('RecentPostDetailsComponent', () => {
  let component: RecentPostDetailsComponent;
  let fixture: ComponentFixture<RecentPostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentPostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
