import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { FGetQueryParam } from './common/services/communication/communication.api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[] = [];

  public title: string;
  public fix: number;

  constructor(private router: Router) {
    sessionStorage.setItem('TENANT_CODE', FGetQueryParam('tenantCode') ?? '');
  }

  ngOnInit(): void {
    this._subscriptions.push(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        this.title = this.router.routerState.root.children.pop()?.snapshot?.data['title'] ?? null;
        this.fix = this.router.routerState.root.children.pop()?.snapshot?.data['fix'] || null;
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
