import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  subject: Subject<any> = new Subject();
  notificationForm!: FormGroup;
  submitted = false;
  allLevels: any;
  memberNameArray: any;
  filterForm!: FormGroup;
  viewMembersObj: any = { DistrictId: 0, Talukaid: 0, villageid: 0, SearchText: '' }
  getTalkaByDistrict: any;
  resultVillageOrCity: any;
  notificationscopeArray: any;
  notificationArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  searchFilter = "";
  defaultCloseBtn: boolean = false;
  total: any;
  imgName: any;
  ImgUrl: any;
  getImgExt: any;
  selectedFile: any;
  NotificationText: string = "Push";
  getImgPath: any;
  NotificationId: any;
  ScopeId: any;
  MemberIdEdit: any;
  globalMemberId: any[] = [];
  NewsId: any;
  @ViewChild('clickPushModal') clickPushModal: any;
  IsChangeImage: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  schedulerFlag: boolean = false;
  minDate: any = new Date();
  IspushedFlag: any = 0;
  // reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
  reg = '^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$'
  allAgentLists: any;
  clientNameArray: any;
  globalClientId: any;
  editDataObject: any;
  date = new Date();
  clearAgentValue : boolean = false;

  constructor(
    private callAPIService: CallAPIService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    public dateTimeAdapter: DateTimeAdapter<any>) {
    { dateTimeAdapter.setLocale('en-IN'); }
  }

  ngOnInit(): void {
    this.globalClientId = this.commonService.getlocalStorageData().ClientId;
    this.customForm();
    this.defaultFilterForm();
    this.getNotificationData();
    this.getClientName();
    this.gerNotificationscope();
    this.searchFilters('false');
  }

  customForm() {
    this.notificationForm = this.fb.group({
      Id: [0],
      CreatedBy: [this.commonService.loggedInUserId()],
      ScopeId: [''],
      Title: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
      Description: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
      ImageUrl: [''],
      Link: ['', [Validators.pattern(this.reg)]],
      MemberStr: [],
      NotificationDate: [''],
      ClientId: ['', Validators.required]
    })
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      fromTo: [['', '']],
      ScopeId: [0],
      searchText: [''],
      ClientId: [0]
    })
  }

  get f() { return this.notificationForm.controls };

  onSubmit() {
    this.valiationForScheduler();
    this.spinner.show();
    this.submitted = true;
    if (this.notificationForm.invalid) {
      this.spinner.hide();
      window.scroll(0,0);
      return;
    }
    else {
      this.globalMemberId = [];
      let fromData = new FormData();
      let notificationFlag: any;
      let ImageChangeFlag: any;
      if (this.IsChangeImage || this.selectedFile) {
        notificationFlag = 2;
        ImageChangeFlag = 1
      } else {
        notificationFlag = 1;
        ImageChangeFlag = 0
      }
      let getObj: any = this.notificationForm.value;
      let fillSelection: any;
      if (getObj.ScopeId == 2) {
        fillSelection = getObj.MemberStr
      }

      if (getObj.ScopeId == 2) {
        fillSelection.map((ele: any) => {
          this.globalMemberId.push({ "MemberId": ele });
        })
      }
      let id: any;
      getObj.Id ? id = getObj.Id : id = 0;
      let convertDate: any;
      let NotificationDate: any;
      if (getObj.NotificationDate) {
        NotificationDate = this.datePipe.transform(getObj.NotificationDate, 'dd/MM/YYYY HH:mm');
        convertDate = NotificationDate;
      } else {
        NotificationDate = this.datePipe.transform(new Date, 'dd/MM/YYYY HH:mm');
        convertDate = NotificationDate;
      }
      let ClientIdCheck = (this.notificationForm.value.ClientId == null || this.notificationForm.value.ClientId == undefined ||
        this.notificationForm.value.ClientId == '') ? 0 : this.notificationForm.value.ClientId;
        let LinkCheck = getObj.Link == null ? '' : getObj.Link;

      fromData.append('Id', id);
      fromData.append('CreatedBy', this.commonService.loggedInUserId());
      fromData.append('ScopeId', getObj.ScopeId);
      fromData.append('Title', getObj.Title);
      fromData.append('Description', getObj.Description);
      fromData.append('ImageUrl', getObj.ImageUrl ? this.selectedFile : '');
      fromData.append('Link', LinkCheck);
      fromData.append('MemberStr', JSON.stringify(this.globalMemberId));
      fromData.append('AttchmentStr', this.selectedFile ? this.selectedFile : '');
      fromData.append('NotificationType', notificationFlag);
      fromData.append('IsChangeImage', ImageChangeFlag);
      fromData.append('NotificationDate', convertDate); 
      fromData.append('IsPushed', this.IspushedFlag);
      fromData.append('ClientId', ClientIdCheck);

      this.callAPIService.setHttp('post', 'InsertNotification_Web_2_0', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.deleteImg();
          this.IsChangeImage = false;
          this.submitted = false;
          this.notificationForm.reset();
          this.toastrService.success(res.data1[0].Msg);
          this.pushMotificationStatus(res.data1[0].ID, res.data1[0].ScopeId);
          this.schedulerFlag = false;
          this.getNotificationData();
          this.resetNotificationForm();
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
  }

  clearValidationAndData(flag: any) {
    if (flag == 'client') {
      this.notificationForm.controls['ScopeId'].setValue('');
      this.notificationForm.controls['MemberStr'].setValue('');
    } else if (flag == 'scopClear') {
      this.notificationForm.controls['MemberStr'].setValue('');
      this.validationAddScope();
    } else if (flag == 'agent') {
      this.validationAddAgent();
    }
  }

  addValidationOn(FlagWithScopId: any) {
    if (FlagWithScopId == 2) {
      this.getAllAgentList();
      this.validationAddAgent();
    } else if (FlagWithScopId == 1) {
      this.validationRemoveAgent();
    } else if (FlagWithScopId == 'client') {
      this.validationAddScope();
    }
  }

  validationRemoveAgent() {
    this.notificationForm.controls['MemberStr'].setValue('');
    this.notificationForm.controls['MemberStr'].clearValidators();
    this.notificationForm.controls['MemberStr'].updateValueAndValidity();
  }

  validationAddAgent() {
    this.notificationForm.controls["MemberStr"].setValidators(Validators.required);
    this.notificationForm.controls["MemberStr"].updateValueAndValidity();
    this.notificationForm.controls['MemberStr'].clearValidators();
  }

  validationAddScope(){
    this.notificationForm.controls["ScopeId"].setValidators(Validators.required);
    this.notificationForm.controls["ScopeId"].updateValueAndValidity();
    this.notificationForm.controls['ScopeId'].clearValidators();
  }

  editNotification(data: any) {
    this.clearAgentValue = false;
    this.editDataObject = data;
    if (data.IsPushed == 2) {
      this.schedulerFlag = true;
    } else {
      this.schedulerFlag = false;
    }
    this.NotificationText = "Update";
    this.getImgPath = data.AttachmentPath;
    let dateTransForm: any = data.NotificationDate.split(" ");
    let datefomratChange: any = this.datePipe.transform(this.commonService.dateFormatChange(dateTransForm[0]), 'yyyy/MM/dd');

    this.notificationForm.patchValue({
      AttachmentPath: data.AttachmentPath,
      Description: data.Description,
      Id: data.Id,
      Link: data.Link,
      MemberScope: data.MemberScope,
      NotificationType: data.NotificationType.toString(),
      ScopeId: data.ScopeId,
      ScopeName: data.ScopeName,
      SrNo: data.SrNo,
      Title: data.Title,
      ClientId: data.ClientId,
      NotificationDate: new Date(Date.parse(datefomratChange + " " + dateTransForm[1])),
    })
    this.addValidationOn(data.ScopeId);
  }

  resetNotificationForm() {
    this.NotificationText = "Push";
    this.submitted = false;
    this.getImgPath = null;
    this.notificationForm.reset();
    if (this.clientNameArray.length == 1) {
      this.notificationForm.controls['ClientId'].setValue(this.clientNameArray[0].id);
      this.validationAddScope();
    }
  }


  deleteImg() {
    this.selectedFile = "";
    this.getImgPath = "";
    this.fileInput.nativeElement.value = '';
    this.IsChangeImage = true;
  }

  delNotConfirmation(NewsId: any) {
    this.NewsId = NewsId;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteNotifications();
      }
    });
  }

  deleteNotifications() {
    this.callAPIService.setHttp('get', 'Delete_Notification_Web_1_0?NewsId=' + this.NewsId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getNotificationData();
        this.resetNotificationForm();
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

  pushMotificationStatus(id: any, scopeId: any) {
    this.NotificationId = id;
    this.ScopeId = scopeId;
  }

  pushMotification() {
    this.callAPIService.setHttp('get', 'Push_SendNotification_1_0?UserId=' + this.commonService.loggedInUserId() + '&NotificationId=' + this.NotificationId + '&ScopeId=' + this.ScopeId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1);
        this.getNotificationData();
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

  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientNameArray = res.data1;
        if (this.clientNameArray.length == 1) {
          this.notificationForm.controls['ClientId'].setValue(this.clientNameArray[0].id);
           this.validationAddScope();
        }
      }
      else {
        this.spinner.hide();
        this.clientNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAllAgentList() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + this.notificationForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAgentLists = res.data1;
        if (this.NotificationText == "Update" && this.editDataObject.ScopeId == 2) {
          let MemberStr = this.editDataObject.MemberStr.split(",").map((item: any) => {
            return parseInt(item);
          });
          if(this.clearAgentValue == true){
            MemberStr = '';
          }
          this.notificationForm.controls["MemberStr"].setValue(MemberStr);
          this.validationAddAgent();
        }
      } else {
        this.allAgentLists = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  gerNotificationscope() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Notificationscope', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.notificationscopeArray = res.data1;
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

  clearFilter(flag: any) {
    if (flag == 'client') {
      this.filterForm.controls['ClientId'].setValue(0);
    } else if (flag == 'notifications') {
      this.filterForm.controls['ScopeId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['searchText'].setValue('');
    } else if (flag == 'dateRangePIcker') {
      this.defaultCloseBtn = false;
      this.filterForm.controls['fromTo'].setValue(['', '']);
    }
    this.paginationNo = 1;
    this.getNotificationData();
  }

  filterData(flag: any) {
    flag == 'range' ? this.defaultCloseBtn = true : this.defaultCloseBtn = false;
    this.paginationNo = 1;
    this.getNotificationData();
  }

  getNotificationData() {
    let getObj: any = this.filterForm.value;
    this.spinner.show();
    let fromDate: any;
    let toDate: any;
    let ClientId = this.commonService.getlocalStorageData().ClientId == 0 ? getObj.ClientId : this.commonService.getlocalStorageData().ClientId;
    getObj.fromTo[0] != "" ? (fromDate = this.datePipe.transform(getObj.fromTo[0], 'dd/MM/yyyy')) : fromDate = '';
    getObj.fromTo[1] != "" ? (toDate = this.datePipe.transform(getObj.fromTo[1], 'dd/MM/yyyy')) : toDate = '';
    this.callAPIService.setHttp('get', 'GetNotification_Web_2_0?UserId=' + this.commonService.loggedInUserId() + '&PageNo=' + this.paginationNo + '&FromDate=' + fromDate + '&ToDate=' + toDate + '&ScopeId=' + getObj.ScopeId + '&SearchText=' + getObj.searchText
      + '&ClientId=' + ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.notificationArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.notificationArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.notificationArray = [];
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getNotificationData();
  }

  onKeyUpFilter() {
    this.subject.next();
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.searchText == "" || this.filterForm.value.searchText == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchFilter = this.filterForm.value.searchText;
      this.paginationNo = 1;
      this.getNotificationData();
    }
    );
  }

  choosePhoto() {
    let clickPhoto: any = document.getElementById('my_file')
    clickPhoto.click();
  }

  readUrl(event: any) {
    let selResult = event.target.value.split('.');
    this.getImgExt = selResult.pop();
    this.getImgExt.toLowerCase();
    if (this.getImgExt == "png" || this.getImgExt == "jpg" || this.getImgExt == "jpeg") {
      this.selectedFile = <File>event.target.files[0];
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.ImgUrl = event.target.result;
          this.getImgPath = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
        this.imgName = event.target.files[0].name;
      }
    }
    else {
      this.toastrService.error("Profile image allowed only jpg or png format");
    }
  }

  openInputFile() {
    let clickInputFile = document.getElementById("img-upload");
    clickInputFile?.click();
  }

  checkBoxScheduler(event: any) {
    if (event.target.checked) {
      this.schedulerFlag = true;
      this.IspushedFlag = 2;
    } else {
      this.IspushedFlag = 0;
      this.schedulerFlag = false;
    }
  }

  valiationForScheduler() {
    if (this.schedulerFlag) {
      this.notificationForm.controls["NotificationDate"].setValidators(Validators.required);
      this.notificationForm.controls["NotificationDate"].updateValueAndValidity();
      this.notificationForm.controls['NotificationDate'].clearValidators();
    } else {
      this.notificationForm.controls['NotificationDate'].clearValidators();
      this.notificationForm.controls["NotificationDate"].updateValueAndValidity();
    }
  }
}
