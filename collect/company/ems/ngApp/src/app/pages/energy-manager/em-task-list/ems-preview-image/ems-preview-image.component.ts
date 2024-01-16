import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener,
  setTestabilityGetter,
  ViewChild,
} from '@angular/core';
import { AppService } from '@src/app/app.service';

@Component({
  selector: 'app-ems-preview-image',
  templateUrl: './ems-preview-image.component.html',
  styleUrls: ['./ems-preview-image.component.scss'],
})
export class EmsPreviewImageComponent implements OnInit {
  @Input() imagrScr: string;
  @Output() getImgShowHiden = new EventEmitter();
  // @ViewChildren('unclick') unclick: QueryList<ElementRef>;
  @ViewChild('unclick')
  unclick: ElementRef;
  topImage: string = '';

  startX: number = 0;
  startY: number = 0;
  positionX: number = 0;
  positionY: number = 0;
  initialPositionX: number = 0;
  initialPositionY: number = 0;

  moveX: number = 0;
  moveY: number = 0;

  originX: number = 0;
  originY: number = 0;

  scale: number = 1;
  relativeScale: number = 1;
  initialScale: number = 1;
  maxScale: number = parseInt(String('4'), 10);

  distance: number = 0;
  initialDistance: number = 0;
  mode: string = '';
  elWidth: number;
  elHeight: number;

  webkittransition: string = '';
  webkittransform: string = '';
  transform: string = '';
  imgLeft: number = 0;
  imgTop: number = 0;
  constructor(private sApp: AppService) {}

  ngOnInit(): void {
    this.initContentHeiht();
    if (isNaN(this.maxScale) || this.maxScale <= 1) {
      this.maxScale = 2.5;
    }
  }
  // 是否关闭
  hideImge() {
    let isHiden = false;
    if (this.imagrScr) {
      isHiden = true;
      this.imagrScr = '';
    }
    this.getImgShowHiden.emit(isHiden);
  }
  // 禁止点击
  unClick(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }
  initContentHeiht() {
    const checkInit = setInterval(() => {
      const divHEight = document.body.offsetHeight;
      let queryHeight = document.body.querySelector('ion-img').offsetHeight;
      this.imgLeft = document.body.querySelector('ion-img').offsetLeft;
      this.imgTop = document.body.querySelector('ion-img').offsetTop;
      if (queryHeight !== 0 && queryHeight) {
        clearInterval(checkInit);
        const topNum = (Number(divHEight) - queryHeight) / 2;
        this.topImage = topNum + 'px';
        this.elHeight = queryHeight;
        this.elWidth = document.body.querySelector('ion-img').offsetWidth;
        // this.startX = ( this.elWidth + 40) / 2;
        this.startY = (this.elHeight + topNum) / 2;
        // this.positionX = ( this.elWidth + 40) / 2;
        // this.positionY =  (this.elHeight + topNum) / 2;
        // this.positionX = ( this.elWidth + 40) / 6;
        // this.positionY = (this.elHeight + topNum) / 6;
      }
    }, 66);
  }
  @HostListener('window:resize') onResize() {
    this.initContentHeiht();
  }
  imgtouchstart(evt: any) {
    const touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;
    // this.startX = touches[0].clientX;
    // this.startY = touches[0].clientY;
    //console.log(this.startX, this.startY,  this.positionX, this.positionY)
    this.startX = this.startX;
    this.startY = this.startY;
    this.initialPositionX = this.positionX;
    this.initialPositionY = this.positionY;
    this.moveX = 0;
    this.moveY = 0;
  }
  imgtouchmove(evt: any) {
    const touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;
    // console.log(this.mode, touches.length)
    if (this.mode === '') {
      if (touches.length === 1 && this.scale > 1) {
        this.mode = 'swipe';
      } else if (touches.length === 2) {
        this.mode = 'pinch';

        this.initialScale = this.scale;
        this.initialDistance = this.getDistance(touches);
        this.originX =
          this.startX -
          parseInt(String((touches[0].clientX - touches[1].clientX) / 2), 10) -
          this.imgLeft -
          this.initialPositionX;
        // this.originY = this.startY -
        // parseInt(String((touches[0].clientY - touches[1].clientY) / 2), 10) -
        // this.imgTop -  (this.elHeight / 4) - this.initialPositionY;
        this.originY = this.startY - this.imgTop - this.elHeight / 2 - this.initialPositionY;
      }
    }

    if (this.mode === 'swipe') {
      evt.preventDefault();

      this.moveX = touches[0].clientX - this.startX;
      this.moveY = touches[0].clientY - this.startY;

      this.positionX = this.initialPositionX + this.moveX;
      this.positionY = this.initialPositionY + this.moveY;

      this.transformElement();
    } else if (this.mode === 'pinch') {
      evt.preventDefault();

      this.distance = this.getDistance(touches);
      this.relativeScale = this.distance / this.initialDistance;
      this.scale = this.relativeScale * this.initialScale;

      this.positionX = this.originX * (1 - this.relativeScale) + this.initialPositionX + this.moveX;
      this.positionY = this.originY * (1 - this.relativeScale) + this.initialPositionY + this.moveY;

      this.transformElement();
    }
  }
  imgtouchend(evt: any) {
    const touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

    if (this.mode === '' || touches.length > 0) {
      return;
    }

    if (this.scale < 1) {
      this.scale = 0.6;
      // this.positionX = 0;
      // this.positionY = 0;
    } else if (this.scale > this.maxScale) {
      this.scale = this.maxScale;
      this.relativeScale = this.scale / this.initialScale;
      this.positionX = this.originX * (1 - this.relativeScale) + this.initialPositionX + this.moveX;
      this.positionY = this.originY * (1 - this.relativeScale) + this.initialPositionY + this.moveY;
    } else {
      if (this.positionX > 0) {
        this.positionX = 0;
      } else if (this.positionX < this.elWidth * (1 - this.scale)) {
        this.positionX = this.elWidth * (1 - this.scale);
      }
      if (this.positionY > 0) {
        this.positionY = 0;
      } else if (this.positionY < this.elHeight * (1 - this.scale)) {
        this.positionY = this.elHeight * (1 - this.scale);
      }
    }

    this.transformElement(0.1);
    this.mode = '';
  }
  getDistance(touches: any) {
    let d;
    let clientX1;
    let clientX2;
    let clientY1;
    let clientY2;
    if (touches && touches.length > 0) {
      if (touches[0]) {
        if (touches[0].clientX) {
          clientX1 = touches[0].clientX;
        } else {
          clientX1 = 0;
        }
        if (touches[0].clientY) {
          clientY1 = touches[0].clientY;
        } else {
          clientY1 = 0;
        }
      }
      if (touches[1]) {
        if (touches[1].clientX) {
          clientX2 = touches[1].clientX;
        } else {
          clientX2 = 0;
        }
        if (touches[1].clientY) {
          clientY2 = touches[1].clientY;
        } else {
          clientY2 = 0;
        }
      }
      d = Math.sqrt(Math.pow(clientX1 - clientX2, 2) + Math.pow(clientY1 - clientY2, 2));
    }
    let intD = 0;
    if (parseInt(String(d), 10)) {
      intD = parseInt(String(d), 10);
    }
    return intD;
  }
  transformElement(duration?: number) {
    const transition = duration ? 'all cubic-bezier(0,0,.5,1) ' + duration + 's' : '';

    if (this.scale < 1) {
      this.scale = 0.6;
      this.positionX = 0;
      this.positionY = 0;
    }

    const matrixArray = [this.scale, 0, 0, this.scale, this.positionX, this.positionY];
    let matrix = 'matrix(' + matrixArray.join(',') + ')';
    this.webkittransition = transition;
    this.webkittransform = matrix + ' translate3d(0,0,0)';
    this.transform = matrix;
    // document.body.querySelector('ion-img').css({
    //     '-webkit-transition': transition,
    //     transition: transition,
    //     '-webkit-transform': matrix + ' translate3d(0,0,0)',
    //     transform: matrix
    // });
  }
}
