import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmTaskCheckIconComponent } from './em-task-check-icon.component';

describe('EmTaskCheckIconComponent', () => {
  let component: EmTaskCheckIconComponent;
  let fixture: ComponentFixture<EmTaskCheckIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmTaskCheckIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmTaskCheckIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
