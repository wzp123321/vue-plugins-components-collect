import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import zh from '@angular/common/locales/zh';

import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverlayModule } from '@angular/cdk/overlay';

import { INTERCEPTOR_PROVIDERS } from './core/interceptor/interceptor.api';
import { NzModalService } from 'ng-zorro-antd/modal';

registerLocaleData(en);
registerLocaleData(zh);

const NZ_OPTIONS: NzConfig = { message: { nzMaxStack: 1 } };

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ScrollingModule,
    AppRoutingModule,
    OverlayModule,
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: NZ_OPTIONS },
    { provide: NZ_I18N, useValue: zh_CN },
    INTERCEPTOR_PROVIDERS,
    NzModalService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
