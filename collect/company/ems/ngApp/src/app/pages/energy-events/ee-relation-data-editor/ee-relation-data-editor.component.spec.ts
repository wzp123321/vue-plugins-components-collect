import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EeRelationDataEditorComponent } from './ee-relation-data-editor.component';

describe('EeRelationDataEditorComponent', () => {
  let component: EeRelationDataEditorComponent;
  let fixture: ComponentFixture<EeRelationDataEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EeRelationDataEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EeRelationDataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
