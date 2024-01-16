import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsEventsModalComponent } from './ems-events-modal.component';

describe('EmsEventsModalComponent', () => {
  let component: EmsEventsModalComponent;
  let fixture: ComponentFixture<EmsEventsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsEventsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsEventsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
