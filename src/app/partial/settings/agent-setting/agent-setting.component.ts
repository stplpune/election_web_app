import { JSONParser } from '@amcharts/amcharts4/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-agent-setting',
  templateUrl: './agent-setting.component.html',
  styleUrls: ['./agent-setting.component.css']
})
export class AgentSettingComponent implements OnInit {


  agentSettingForm!: FormGroup;
  agentSettingArray: any;
  allAgentList: any;
  IsCalllogTrackData: any;
  IsLacationTrackData: any;
  StrSettingArray: any[] = [];
  userId: any;
  SettingId: any;
  StrSettingArrayJSON: any;
  Flag: any;
  clientNameArray: any;
  ClientId = new FormControl(0);
  Search = new FormControl('');
  subject: Subject<any> = new Subject();
  searchFilter = "";
  globalClientId: any;
  //HideClientFilter:boolean = true;
  

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.globalClientId = this.commonService.getlocalStorageData().ClientId;
    this.getClientName();
    //this.getAgentSetting();
    this.searchFilters('false');
  }

  getClientName() {
    // this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.spinner.hide();
        this.clientNameArray = res.data1;

        if (this.clientNameArray.length == 1) {
          //this.HideClientFilter = false;
          this.ClientId.setValue(this.clientNameArray[0].id); 
        }
        this.getAgentSetting();
     } else {
        // this.spinner.hide();
      }
    }, (error: any) => {
      // this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentSetting() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Client_AgentSetting?UserId=' + this.commonService.loggedInUserId()
      + '&ClientId=' + this.ClientId.value + '&Search=' + this.Search.value, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentSettingArray = res.data1;
      } else {
        this.agentSettingArray = [];
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
    event.target.checked == true ? this.IsCalllogTrackData = 1 : this.IsCalllogTrackData = 0;
    this.userId = obj.AgentId;
    this.SettingId = 1;
    this.Flag = this.IsCalllogTrackData;
    this.mergeCheckedData();
  }

  onCheckisAlertIsLacationTrackData(event: any, obj: any) {
    event.target.checked == true ? this.IsLacationTrackData = 1 : this.IsLacationTrackData = 0;
    this.userId = obj.AgentId;
    this.SettingId = 2;
    this.Flag = this.IsLacationTrackData;
    this.mergeCheckedData();
  }

  mergeCheckedData() {
    let obj = { SettingId: this.SettingId, Flag: this.Flag , UserId: this.userId }
    this.StrSettingArray.push(obj);
  }

  onSubmitData() {
    // this.spinner.show();
    this.StrSettingArrayJSON = JSON.stringify(this.StrSettingArray);
    let obj = '&CreatedBy=' + this.commonService.loggedInUserId() + '&StrSettingFlag=' + this.StrSettingArrayJSON
    this.callAPIService.setHttp('get', 'Sp_Web_Insert_Agent_Setting?ClientId=' + this.ClientId.value + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg);
        this.StrSettingArray = [];
        this.getAgentSetting();
      } else {
        // this.spinner.hide();
      }
    }, (error: any) => {
      // this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilter() {
    this.subject.next();
  }

  searchFilters(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.Search.value;
        // this.paginationNo = 1;
        this.getAgentSetting();
      }
      );
  }

  clearFilter(flag: any) {
     if (flag == 'search') {
      this.Search.setValue('');
    } else  
    if (flag == 'clientId') {
      this.ClientId.setValue(0);
    }
    this.getAgentSetting(); 
  }

}
