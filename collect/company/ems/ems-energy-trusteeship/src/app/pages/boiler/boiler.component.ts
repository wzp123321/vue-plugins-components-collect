import { Component, OnInit } from '@angular/core';
import { BoilerDatabaseService } from './service/boiler-database.service';

@Component({
  selector: 'ems-boiler',
  templateUrl: './boiler.component.html',
  styleUrls: ['./boiler.component.less'],
})
export class BoilerComponent implements OnInit {
  public get mode(): 'single' | 'multiple' {
    return this.sDatabase.dataQuery.nodes?.length > 1 ? 'multiple' : 'single';
  }

  constructor(private sDatabase: BoilerDatabaseService) {}

  ngOnInit(): void {}
}
