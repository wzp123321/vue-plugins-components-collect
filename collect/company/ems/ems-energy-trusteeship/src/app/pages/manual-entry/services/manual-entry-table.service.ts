import { Injectable } from '@angular/core';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { ManualEntryToolbarService } from './manual-entry-toolbar.service';

@Injectable({
  providedIn: 'root',
})
export class ManualEntryTableService extends PaginationService {
  public get isLoading(): boolean {
    return this.meToolbarService.getIsLoading;
  }
  public set index(v: number) {
    if (v === this.index) {
      return;
    }

    this.meToolbarService.Data_Table_Index = v;
    this.meToolbarService.Event_Table_PaginationChange.emit();
  }
  public get index(): number {
    return this.meToolbarService.Data_Table_Index;
  }

  public set size(v: number) {
    if (v === this.size) {
      return;
    }

    this.meToolbarService.Data_Table_Size = v;
    this.meToolbarService.Event_Table_PaginationChange.emit();
  }
  public get size(): number {
    return this.meToolbarService.Data_Table_Size;
  }

  public get total(): number {
    return this.meToolbarService.Data_Table_Total;
  }

  constructor(private meToolbarService: ManualEntryToolbarService) {
    super();
  }
}
