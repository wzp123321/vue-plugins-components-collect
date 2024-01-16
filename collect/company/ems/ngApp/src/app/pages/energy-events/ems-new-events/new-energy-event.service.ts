import { EventEmitter, Injectable } from '@angular/core';
import { IEnergyCode, TEnergyEvent } from '../energy-events.api';
import { EnergyEventModalService } from './ems-events-modal/energy-event-modal.service';

@Injectable()
export abstract class NewEnergyEventService<T extends TEnergyEvent> {
  public readonly data: T = new Proxy(this.sEnergyEventModal.data as T, {
    get: (obj, k): T[keyof T] => {
      return obj[k as keyof T];
    },
    set: (obj, k, v): boolean => {
      obj[k as keyof T] = v;
      this.checkData();
      return true;
    },
  });

  public get validator(): string {
    return this.sEnergyEventModal.validator;
  }
  public set validator(v: string) {
    this.sEnergyEventModal.validator = v;
  }

  public get energyCodeArray(): IEnergyCode[] {
    return this.sEnergyEventModal.energyCodeArray;
  }

  public canShowEmptyMarker: boolean = false;

  public get toHandleInvalid(): EventEmitter<HTMLIonContentElement> {
    return this.sEnergyEventModal.toHandleInvalid;
  }
  public get toHandleGoBack(): EventEmitter<void> {
    return this.sEnergyEventModal.toHandleGoBack;
  }

  constructor(protected sEnergyEventModal: EnergyEventModalService) {}

  protected abstract checkData(): void;

  public doCheck(): void {
    this.checkData();
  }
}
