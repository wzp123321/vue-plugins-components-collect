import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeService } from '@src/app/common/native.service';

@Component({
  selector: 'app-energy-events',
  templateUrl: './energy-events.component.html',
  styleUrls: ['./energy-events.component.scss']
})
export class EnergyEventsComponent implements OnInit {
  isEnergyManager: boolean = false;
  recordRuleRoute = '/energyManager';
  newEventsRoute = '/energyEvents/newEvents'
  constructor(
    private $route: ActivatedRoute,
    private $router: Router,
    private sNative: NativeService,
  ) { }

  ngOnInit(): void {
  }
  // 判断是否是从能源经理入口
  getQueryParam() {
    this.$route.queryParams.subscribe(param => {
      console.log(param);
      if (Object.keys(param).length === 0) {
        return;
      }
      if (param.isEnergyManager && param.isEnergyManager === 'true') {
         this.isEnergyManager = param.isEnergyManager;
      }
   
      this.$router.navigate([], {
        queryParams: {
          isEnergyManager: false, 
        }  
      })
    });
  }
  goBack() {
    if (this.isEnergyManager) {
      this.$router.navigate([this.recordRuleRoute]); 
    } else {
      this.sNative.nativeCall('goback', { pageHome: 1 }, null, null);
    }
  }
  // 新增
  goNewEvents() {
    this.$router.navigate([this.newEventsRoute]); 
  }
}
