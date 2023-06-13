import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dash'
})
export class DashPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let val: any;
    if (value == undefined || value == null || value == "" || value == "null" || value == 'undefined') {
      val = '-';
    } else {
      val = value
    }
    return val;
  }

}
