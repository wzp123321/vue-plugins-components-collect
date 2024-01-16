/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EmImageUploadService } from './em-image-upload.service';

describe('Service: EmImageUpload', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmImageUploadService]
    });
  });

  it('should ...', inject([EmImageUploadService], (service: EmImageUploadService) => {
    expect(service).toBeTruthy();
  }));
});
