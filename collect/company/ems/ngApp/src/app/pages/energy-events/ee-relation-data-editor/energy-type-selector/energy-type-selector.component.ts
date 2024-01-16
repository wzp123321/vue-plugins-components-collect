import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ResizeObserver } from 'resize-observer';
import { ResizeObserverEntry } from 'resize-observer/lib/ResizeObserverEntry';
import { IEnergyCode } from '../../energy-events.api';

@Component({
  selector: 'app-energy-type-selector',
  templateUrl: './energy-type-selector.component.html',
  styleUrls: ['./energy-type-selector.component.scss'],
})
export class EnergyTypeSelectorComponent implements OnInit, OnDestroy {
  @Input() types: IEnergyCode[] = [];

  @ViewChild('modal', { static: true }) view: ElementRef<HTMLDivElement> = null;

  private whenModalResize: ResizeObserver = null;

  constructor(private ctrlModal: ModalController) {}

  ngOnInit(): void {
    this.whenModalResize = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        if (entries.length) {
          const rect = entries[0].contentRect;
          document
            .querySelector('ion-modal')
            .style.setProperty('--height', `${rect.height}px`);
        }
      }
    );
    this.whenModalResize.observe(this.view.nativeElement);
  }

  ngOnDestroy(): void {
    this.whenModalResize.disconnect();
  }

  public selectType(type: IEnergyCode): void {
    this.ctrlModal.dismiss(type);
  }
}
