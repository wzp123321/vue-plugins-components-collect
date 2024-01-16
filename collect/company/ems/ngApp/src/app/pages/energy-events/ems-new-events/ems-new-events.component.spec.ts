import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsNewEventsComponent } from './ems-new-events.component';

describe('EmsNewEventsComponent', () => {
  let component: EmsNewEventsComponent;
  let fixture: ComponentFixture<EmsNewEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsNewEventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsNewEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
