import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraModalComponent } from './extra-modal.component';

describe('ExtraModalComponent', () => {
  let component: ExtraModalComponent;
  let fixture: ComponentFixture<ExtraModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtraModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
