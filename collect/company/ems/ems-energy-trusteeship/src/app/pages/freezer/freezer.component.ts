import { Component, OnInit } from '@angular/core';
import { FreezerDatabaseService } from './service/freezer-database.service';

@Component({
  selector: 'ems-freezer',
  templateUrl: './freezer.component.html',
  styleUrls: ['./freezer.component.less'],
})
export class FreezerComponent implements OnInit {
  public get mode(): 'single' | 'multiple' {
    return this.sDatabase.dataQuery.nodes?.length > 1 ? 'multiple' : 'single';
  }

  constructor(private sDatabase: FreezerDatabaseService) {}

  ngOnInit(): void {}
}
