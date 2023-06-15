import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'search',
})
export class SearchPipe implements PipeTransform {
    transform(list: any, value: any, key: any): any {

        value.forEach((fullname: any, index: any) => {
            let nameSplit: any = fullname.split(' ');
            let fname: any;
            nameSplit[0] == undefined ? fname = '' : fname = nameSplit[0];
            let mname: any;
            nameSplit[1] == undefined ? mname = '' : mname = nameSplit[1];
            let lname = nameSplit[2];
            nameSplit[2] == undefined ? lname = '' : lname = nameSplit[2];
            console.log(fname, mname, lname);

            if (fullname) {
                list = list.filter((item: any) => {
                    return (item.mname.toLowerCase().match(mname.toLowerCase()) || item.mname.toLowerCase().match(mname.toLowerCase()));
                });
            }
        });
        return list;
    }
}
