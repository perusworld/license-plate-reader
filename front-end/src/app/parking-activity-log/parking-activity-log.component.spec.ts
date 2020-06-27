import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingActivityLogComponent } from './parking-activity-log.component';

describe('ParkingActivityLogComponent', () => {
  let component: ParkingActivityLogComponent;
  let fixture: ComponentFixture<ParkingActivityLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParkingActivityLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingActivityLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
