import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerSearchComponent } from './freezer-search.component';

describe('FreezerSearchComponent', () => {
  let component: FreezerSearchComponent;
  let fixture: ComponentFixture<FreezerSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
