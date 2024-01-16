import { timer } from 'rxjs';
import { GetSercieDaysData } from './em-encourage.interface.ts.js';
import { EnergyManagerService } from '../energy-manager.service.js';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-em-encourage',
  templateUrl: './em-encourage.component.html',
  styleUrls: ['./em-encourage.component.scss'],
})
export class EmEncourageComponent implements OnInit {
  showBackdrop: boolean = false;
  isAllFinished: boolean = false;
  isServiceDaysRight: boolean = false;
  isAddMeasure: boolean = false;
  rootName: string = '';
  serviceDays: number = 0;

  constructor(private $route: ActivatedRoute, private $router: Router, private service: EnergyManagerService) {}

  ngOnInit() {
    this.getSercieDays();
    this.getQueryParam();
  }

  getQueryParam() {
    this.$route.queryParams.subscribe((param) => {
      console.log(param);
      if (Object.keys(param).length === 0) {
        return;
      }
      if (param.isAllFinished && param.isAllFinished === 'true') {
        this.isAllFinished = true;
        this.doShowBackdrop();
      }
      if (param.isAddMeasure && param.isAddMeasure === 'true') {
        this.getRootName();
        this.isAddMeasure = true;
        this.doShowBackdrop();
      }
      this.$router.navigate([], {
        queryParams: {
          isAllFinished: null,
          isAddMeasure: null,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  getRootName() {
    this.rootName = sessionStorage.rootName || '';
    this.service.getRootName().then((rootName) => {
      this.rootName = rootName;
      sessionStorage.rootName = rootName;
    });
  }

  getSercieDays() {
    if (!sessionStorage.shownServiceDays) {
      this.service.getServiceDays().then((data: GetSercieDaysData) => {
        sessionStorage.shownServiceDays = true;
        if (data.popUp) {
          this.serviceDays = data.serviceDays;
          this.isServiceDaysRight = true;
          this.doShowBackdrop();
        }
      });
    }
  }

  doShowBackdrop() {
    this.showBackdrop = true;
    // 5s 后自动消失
    const close = timer(5000);
    close.subscribe((_) => {
      this.showBackdrop = false;
    });
  }

  close() {
    this.showBackdrop = false;
    this.isAllFinished = false;
    this.isServiceDaysRight = false;
    this.isAddMeasure = false;
  }
}
