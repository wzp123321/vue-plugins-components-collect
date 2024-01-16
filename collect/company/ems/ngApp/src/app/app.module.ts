import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdMobileModule } from 'ng-zorro-antd-mobile';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RESTFULInterceptorProviders } from './common/services/communication/restful.interceptor';
import { AppService } from './app.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgZorroAntdMobileModule,
    BrowserAnimationsModule,
    FormsModule,
    IonicModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (sApp: AppService) => () => sApp.initialize(),
      deps: [AppService],
      multi: true,
    },
    RESTFULInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
