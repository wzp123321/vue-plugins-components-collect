import { DateStringFormatPipe } from './em-week-summary/date-string-format.pipe';
import { EmShareComponent } from './em-week-summary/em-share/em-share.component';
import { DatePipe } from './em-week-summary/date.pipe';
import { EmWeekSummaryComponent } from './em-week-summary/em-week-summary.component';
import { EmEncourageComponent } from './em-encourage/em-encourage.component';
import { EmImageUploadComponent } from './em-task-feedback/em-image-upload/em-image-upload.component';
import { EmTaskFeedbackComponent } from './em-task-feedback/em-task-feedback.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnergyManagerComponent } from './energy-manager.component';
import { EnergyManagerRoutingModule } from './energy-manager-routing.module';
import { FormsModule } from '@angular/forms';
import { EmTaskListComponent } from './em-task-list/em-task-list.component';
import {
  ButtonModule,
  IconModule,
  NoticeBarModule,
  PullToRefreshModule,
} from 'ng-zorro-antd-mobile';
import { EmsRecordMeasuresComponent } from './ems-record-measures/ems-record-measures.component';
import { IonicModule } from '@ionic/angular';
import { EmsRadioPopUpComponent } from './ems-radio-pop-up/ems-radio-pop-up.component';
import { EmsSpeechRecognitionComponent } from './ems-speech-recognition/ems-speech-recognition.component';
import { EmDailyWorkCardComponent } from './em-task-list/em-daily-work-card/em-daily-work-card.component';
import { EmPeriodWorkCardComponent } from './em-task-list/em-period-work-card/em-period-work-card.component';
import { EmsCalendarComponent } from './ems-calendar/ems-calendar.component';
import { EmTaskCheckIconComponent } from './em-task-list/em-task-check-icon/em-task-check-icon.component';
import { EmTaskStatusBubbleComponent } from './em-task-list/em-task-status-bubble/em-task-status-bubble.component';
import { EnergyManagerService } from './energy-manager.service';
import { ComponentsModule } from '@src/app/common/components/components.module';
import { DirectivesModule } from '@src/app/common/directives/directives.module';
import { PipesModule } from '@src/app/common/pipes/pipes.module';
import { EmsCalendarTitlePipe } from './ems-calendar/ems-calendar.pipe';
import { EmsPreviewImageComponent } from './em-task-list/ems-preview-image/ems-preview-image.component';

@NgModule({
  declarations: [
    EnergyManagerComponent,
    EmTaskListComponent,
    EmsRecordMeasuresComponent,
    EmsRadioPopUpComponent,
    EmsSpeechRecognitionComponent,
    EmDailyWorkCardComponent,
    EmPeriodWorkCardComponent,
    EmsCalendarComponent,
    EmTaskCheckIconComponent,
    EmTaskStatusBubbleComponent,
    EmTaskFeedbackComponent,
    EmImageUploadComponent,
    EmEncourageComponent,
    EmsCalendarTitlePipe,
    EmWeekSummaryComponent,
    DatePipe,
    DateStringFormatPipe,
    EmsPreviewImageComponent,
    EmShareComponent,
  ],
  imports: [
    CommonModule,
    EnergyManagerRoutingModule,
    FormsModule,
    NoticeBarModule,
    PullToRefreshModule,
    IconModule,
    ButtonModule,
    IonicModule,
    ComponentsModule,
    DirectivesModule,
    PipesModule,
  ],
  providers: [EnergyManagerService],
})
export class EnergyManagerModule {}
