import { Component, OnInit, Self } from '@angular/core';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { ManualEntryTableDataService } from '../services/manual-entry-table-data.service';
import { ManualEntryTablePaginationService } from '../services/manual-entry-table-pagination.service';
import { ManualEntryService } from '../services/manual-entry.service';

@Component({
  selector: 'app-manual-entry-table',
  templateUrl: './manual-entry-table.component.html',
  styleUrls: ['./manual-entry-table.component.less'],
  providers: [ManualEntryTablePaginationService],
  viewProviders: [{ provide: PaginationService, useExisting: ManualEntryTablePaginationService }],
})
export class ManualEntryTableComponent implements OnInit {
  public get isLoading() {
    return this.mentryTableDataService.getIsLoading;
  }
  public get isEmpty() {
    return this.mentryTableDataService.getEmpty;
  }
  // 列表数据
  public get list() {
    return this.mentryTableDataService.getList;
  }

  public set PageIndex(v: number) {
    this.meTablePaginationService.index = v;
  }
  public get PageIndex(): number {
    return this.meTablePaginationService.index;
  }

  public set PageSize(v: number) {
    this.meTablePaginationService.size = v;
  }
  public get PageSize(): number {
    return this.meTablePaginationService.size;
  }

  public get total(): number {
    return this.meTablePaginationService.total;
  }

  constructor(
    private mentryTableDataService: ManualEntryTableDataService,
    @Self() private meTablePaginationService: ManualEntryTablePaginationService,
    private meService: ManualEntryService
  ) {
    this.meService.getSearchParamList.subscribe((data) => {
      this.mentryTableDataService.getTableList({
        dateType: data?.dateType,
        endDate: data?.endDate,
        energyCode: data?.energyCode,
        entryType: data?.entryType,
        keyWords: data?.keyWords,
        objectId: data?.objectId,
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: data?.pageNum,
        pageSize: data?.pageSize,
        searchCount: true,
        startDate: data?.startDate,
      });
    });
  }

  ngOnInit(): void {}
}
