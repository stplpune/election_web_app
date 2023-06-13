import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-client-setting',
  templateUrl: './client-setting.component.html',
  styleUrls: ['./client-setting.component.css']
})
export class ClientSettingComponent implements OnInit {

  StrSettingArrayJSON: any;
  Flag: any;
  clientNameArray: any;
  ClientId = new FormControl(0);
  clientSettingArray: any;
  StrSettingArray: any[] = [];
  IsCheckedData: any;
  

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}


  ngOnInit(): void {
    this.getClientName();
   // this.getClientSetting();
  }

  getClientName() {
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.clientNameArray = res.data1;
     } else {}
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getClientSetting() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_Setting?UserId=' + this.commonService.loggedInUserId()
      + '&ClientId=' + this.ClientId.value, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientSettingArray = res.data1;
      } else {
        this.clientSettingArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onCheckisAlertIsCalllogTrackData(event: any, obj: any) {
    event.target.checked == true ? this.IsCheckedData = 1 : this.IsCheckedData = 0;
    let obj1 = { SettingId: obj.SettingId, Flag: this.IsCheckedData }
    this.StrSettingArray.push(obj1);
    console.log(this.StrSettingArray)
  }

  onSubmitData() {
    this.spinner.show();
    this.StrSettingArrayJSON = JSON.stringify(this.StrSettingArray);
    let obj = '&CreatedBy=' + this.commonService.loggedInUserId() + '&StrSettingFlag=' + this.StrSettingArrayJSON
    this.callAPIService.setHttp('get', 'Web_Insert_Client_Setting?ClientId=' + this.ClientId.value + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg);
        this.StrSettingArray = [];
        this.getClientSetting();
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  clearFilter() {
     this.ClientId.setValue(0);
     this.clientSettingArray = [];
 }

}
