import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myDate'
})
export class DatePipe implements PipeTransform {

  transform(value: string, hideCurrentYear: boolean = false, transPeriod: boolean = false, transWeekDay: boolean = false): any {
    // console.log(...arguments)
    if (!value) {
      return '';
    }
    // 隐藏当年年份
    if (hideCurrentYear) {
      let now = new Date();
      value = value.replace(`${now.getFullYear()}年`, '');
    }
    // am、pm ->上午、下午
    if (transPeriod) {
      value = value.replace('AM', '上午');
      value = value.replace('PM', '下午');
    }
    // 周几
    if (transWeekDay) {
      let en = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      let ch = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      let index = en.findIndex(day => value.indexOf(day) !== -1);
      value = value.replace(en[index], `${ch[index]}`)
    }
    return value;
  }

}
