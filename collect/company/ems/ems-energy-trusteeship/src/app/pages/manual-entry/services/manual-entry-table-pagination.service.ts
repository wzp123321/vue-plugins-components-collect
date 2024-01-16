import { Injectable } from '@angular/core';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { ManualEntryTableDataService } from './manual-entry-table-data.service';

@Injectable()
export class ManualEntryTablePaginationService extends PaginationService {
  public get isLoading(): boolean {
    return this.meTableDataService.getIsLoading;
  }
  public set index(v: number) {
    if (v === this.index) {
      return;
    }

    this.meTableDataService.Data_Table_Index = v;
    this.meTableDataService.Event_Table_PaginationChange.emit();
  }
  public get index(): number {
    return this.meTableDataService.Data_Table_Index;
  }

  public set size(v: number) {
    if (v === this.size) {
      return;
    }

    this.meTableDataService.Data_Table_Size = v;
    this.meTableDataService.Event_Table_PaginationChange.emit();
  }
  public get size(): number {
    return this.meTableDataService.Data_Table_Size;
  }

  public get total(): number {
    return this.meTableDataService.Data_Table_Total;
  }

  constructor(private meTableDataService: ManualEntryTableDataService) {
    super();
  }
}
