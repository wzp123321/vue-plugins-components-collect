import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnergyEventsService } from '../energy-events.service';
import { EMEventTypeInfoItem } from '../data-type'
import { InputItemModule } from 'ng-zorro-antd-mobile';
import { NativeService } from '@src/app/common/native.service';
@Component({
  selector: 'app-ems-new-events',
  templateUrl: './ems-new-events.component.html',
  styleUrls: ['./ems-new-events.component.scss']
})
export class EmsNewEventsComponent implements OnInit {
  isEventsRoute = '/energyEvents';
  isEventsModal = '/energyEvents/newEventsModal';
  recordRuleRoute = '/energyManager';
  isEnergyManager: boolean = false; 
  EventTypeInfoList: any = [];
  isItOpen: boolean = false;
  actionSheet: any;
  constructor(
    private $route: ActivatedRoute,
    private $router: Router,
    private service: EnergyEventsService,
    private cdr: ChangeDetectorRef,
    private sNative: NativeService,
  ) { }

  ngOnInit(): void {
    this.getQueryParam();
    this.getEventTypeInfoList();
  }
  // 判断是否是从能源经理入口
  getQueryParam() {
    this.$route.queryParams.subscribe(param => { 
      if (Object.keys(param).length === 0) {
        return;
      }
      if (param.isEnergyManager && param.isEnergyManager === 'true') {
          this.isEnergyManager = param.isEnergyManager;
      }
    
      this.$router.navigate([], {
        queryParams: {
          isEnergyManager: this.isEnergyManager, 
        }  
      })
    });
  }
  // 返回
  goBack() { 
    if (this.isEnergyManager) {
      this.$router.navigate([this.recordRuleRoute]); 
    } else {
      this.sNative.nativeCall('goback', { pageHome: 1 }, null, null);
    } 
  }

  // 能源事件类型下拉列表
  getEventTypeInfoList() {
    this.service.getEventTypeInfoList().then((data => { 
      this.EventTypeInfoList = data
    })).catch(error => {
      this.EventTypeInfoList = [];
    }).finally(() => {
      
    });
  }
  trackById(index: number, item: EMEventTypeInfoItem): number {
    return item.id;
  }
  // 跳转modal
  emsNewModal(item: EMEventTypeInfoItem) {
    this.$router.navigate([this.isEventsModal],{queryParams: {
       id: Number(item.id),
       eventTypeName: item.eventTypeName,
       isEnergyManager: this.isEnergyManager
    }}); 
  }

}
