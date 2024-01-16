import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsPreviewImageComponent } from './ems-preview-image.component';

describe('EmsPreviewImageComponent', () => {
  let component: EmsPreviewImageComponent;
  let fixture: ComponentFixture<EmsPreviewImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsPreviewImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsPreviewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
