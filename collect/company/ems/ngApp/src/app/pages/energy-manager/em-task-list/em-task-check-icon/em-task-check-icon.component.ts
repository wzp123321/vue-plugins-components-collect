import { Component, Input, OnInit } from '@angular/core';
import {EMCheckStatus} from '@src/app/pages/energy-manager/em-task-list/data-type';

@Component({
  selector: 'app-em-task-check-icon',
  templateUrl: './em-task-check-icon.component.html',
  styleUrls: ['./em-task-check-icon.component.scss']
})
export class EmTaskCheckIconComponent implements OnInit {
  @Input() checkStatus: EMCheckStatus = null;

  constructor() { }

  ngOnInit(): void {
  }

}
