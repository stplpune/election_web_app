import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTransform'
})
export class DateTransformPipe implements PipeTransform {

  constructor(private datePipe:DatePipe){ }

  transform(value: any, ...args: unknown[]): unknown { // Date time transform 
    let a: any = value.split(' ');
    let b: any = a[0].split('/');
    let dd = b[1] + '/' + b[0] + '/' + b[2] + ' ' + a[1];
    return this.datePipe.transform(dd,'dd/MM/yyyy hh:mm a');
  }

}
