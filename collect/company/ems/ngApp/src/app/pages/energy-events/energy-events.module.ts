import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnergyEventsComponent } from './energy-events.component';
import { EnergyEventsRoutingModule } from './energy-events-routing.module';
import { FormsModule } from '@angular/forms';
import {
  ButtonModule,
  CalendarModule,
  IconModule,
  NoticeBarModule,
  PullToRefreshModule,
  ModalModule
} from 'ng-zorro-antd-mobile';
import { IonicModule } from '@ionic/angular';
import { EnergyEventsService } from './energy-events.service';
import { ComponentsModule } from '@src/app/common/components/components.module';
import { DirectivesModule } from '@src/app/common/directives/directives.module';
import { PipesModule } from '@src/app/common/pipes/pipes.module';
import { EmsNewEventsComponent } from './ems-new-events/ems-new-events.component';
import { EmsEventsModalComponent } from './ems-new-events/ems-events-modal/ems-events-modal.component';
import { EnergyConsumptionAreaModalComponent } from './ems-new-events/energy-consumption-area-modal/energy-consumption-area-modal.component';
import { EmImageUploadComponent } from './em-image-upload/em-image-upload.component';
import { EmsSpeechRecognitionComponent } from './ems-speech-recognition/ems-speech-recognition.component';
import { EmsRadioAreaComponent } from './ems-radio-area/ems-radio-area.component';
import { RegionalBusinessAdjustmentModalComponent } from './ems-new-events/regional-business-adjustment-modal/regional-business-adjustment-modal.component';
import { PowerDeviceChangeModalComponent } from './ems-new-events/power-device-change-modal/power-device-change-modal.component';
import { AirConditionSupplyAdjustmentModalComponent } from './ems-new-events/air-condition-supply-adjustment-modal/air-condition-supply-adjustment-modal.component';
import { ExtraModalComponent } from './ems-new-events/extra-modal/extra-modal.component';
import { EmsSelectPopUpComponent } from './ems-select-pop-up/ems-select-pop-up.component';
import { EmsMultipleDeviceComponent } from './ems-multiple-device/ems-multiple-device.component';
import { EmsSelectDeviceModalComponent } from './ems-multiple-device/ems-select-device-modal/ems-select-device-modal.component';
import { EeRelationDataEditorComponent } from './ee-relation-data-editor/ee-relation-data-editor.component';
import { EnergyTypeSelectorComponent } from './ee-relation-data-editor/energy-type-selector/energy-type-selector.component';
import { EmsMultipleEnergyNodeComponent } from './ems-multiple-energy-node/ems-multiple-energy-node.component';

@NgModule({
  declarations: [
    EnergyEventsComponent,
    EmsNewEventsComponent,
    EmsEventsModalComponent,
    EnergyConsumptionAreaModalComponent,
    EmImageUploadComponent,
    EmsSpeechRecognitionComponent,
    EmsRadioAreaComponent,
    RegionalBusinessAdjustmentModalComponent,
    PowerDeviceChangeModalComponent,
    AirConditionSupplyAdjustmentModalComponent,
    ExtraModalComponent,
    EmsSelectPopUpComponent,
    EmsMultipleDeviceComponent,
    EmsSelectDeviceModalComponent,
    EeRelationDataEditorComponent,
    EnergyTypeSelectorComponent,
    EmsMultipleEnergyNodeComponent,
    
  ],
  imports: [
    CommonModule,
    EnergyEventsRoutingModule,
    FormsModule,
    NoticeBarModule,
    PullToRefreshModule,
    IconModule,
    ButtonModule,
    CalendarModule,
    IonicModule,
    ComponentsModule,
    DirectivesModule,
    PipesModule,
    ModalModule
  ],
  providers: [EnergyEventsService],
})
export class EnergyEventsModule {}
