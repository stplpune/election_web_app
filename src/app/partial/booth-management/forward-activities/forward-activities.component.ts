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
import { DateTimeAdapter } from 'ng-pick-datetime';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

@Component({
  selector: 'app-forward-activities',
  templateUrl: './forward-activities.component.html',
  styleUrls: ['./forward-activities.component.css']
})
export class ForwardActivitiesComponent implements OnInit {

  forwardActivitiForm!: FormGroup;
  submitted = false;
  allLevels: any;
  memberNameArray: any;
  filterForm!: FormGroup;
  allDistrict: any;
  viewMembersObj: any = { DistrictId: 0, Talukaid: 0, villageid: 0, SearchText: '' }
  getTalkaByDistrict: any;
  resultVillageOrCity: any;
  newstypeArray: any;
  getnewsArray: any;
  total: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  defaultCloseBtn: boolean = false;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  getImgPath: any;
  globalMemberId: any[] = [];
  NotificationText: string = "Push";
  imgName: any;
  ImgUrl: any;
  getImgExt: any;
  selectedFile: any;
  NewsId: any;
  IsChangeImage: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  globalClientId: any;
  clientNameArray: any;
  forwordCountsReportArray: any;
  hideSocialMediaCountDiv:any;
  countText:any;

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
    public dateTimeAdapter: DateTimeAdapter<any>,
  ) { { dateTimeAdapter.setLocale('en-IN'); } }

  ngOnInit(): void {
    this.globalClientId = this.commonService.getlocalStorageData().ClientId;
    this.customForm();
    this.defaultFilterForm();
    this.getnewstype();
    this.getNewsData();
    this.getClientName();
    this.searchFilters('false');
  }

  customForm() {
    this.forwardActivitiForm = this.fb.group({
      Id: [0],
      CreatedBy: [this.commonService.loggedInUserId()],
      activityTitle: ['', [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
      activityBody: ['', [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
      hashtags_Activity: [''],
      IsChangeImage: [0],
      NewsType: [''],
      ClientId: ['']
    })
  }

  get f() { return this.forwardActivitiForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      newstypeId: [0],
      fromTo: [['', '']],
      searchText: [''],
      ClientId: [0]
    })
  }

  onSubmit() {
    this.spinner.show();
    this.submitted = true;
    let activityTitleName;

    this.getnewsArray.filter((ele: any) => { // filter ActivityTitle Name
      if (ele.Title == this.forwardActivitiForm.value.activityTitle) {
        activityTitleName = ele.Title;
      }
    })

    if (this.forwardActivitiForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if (!activityTitleName || this.forwardActivitiForm.value.Id > 0) { //check Activity Title Name Same or Not
      this.globalMemberId = [];
      let fromData = new FormData();
      let imageChangeFlag: any;
      let NewsTypeFlag: any;
      let getObj: any = this.forwardActivitiForm.value;

      if (this.selectedFile) {
        imageChangeFlag = 1; NewsTypeFlag = 3;
      } else {
        if (this.IsChangeImage == true) {
          imageChangeFlag = 1; NewsTypeFlag = 1;
        }
        else {
          imageChangeFlag = 0; NewsTypeFlag = 1;
        }
      }
      this.forwardActivitiForm.value.Id == null ? this.forwardActivitiForm.value.Id = 0 : this.forwardActivitiForm.value.Id;
      let HashTag = getObj.hashtags_Activity == null ? '' : getObj.hashtags_Activity;

      fromData.append('Id', this.forwardActivitiForm.value.Id);
      fromData.append('CreatedBy', this.commonService.loggedInUserId());
      fromData.append('Title', getObj.activityTitle);
      fromData.append('Description', getObj.activityBody);
      fromData.append('HashTags', HashTag);
      fromData.append('NewsType', NewsTypeFlag);  //img + text = 3, & only text = 1 
      fromData.append('IsChangeImage', imageChangeFlag);
      fromData.append('NewsImages', this.selectedFile);
      fromData.append('ClientId', this.commonService.getlocalStorageData().ClientId);

      this.callAPIService.setHttp('post', 'Insert_News_Web_2_0', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.submitted = false;
          this.deleteImg();
          this.resetNotificationForm();
          this.IsChangeImage = false;
          this.spinner.hide();
          this.toastrService.success(res.data1[0].Msg);
          this.getNewsData();
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
    else {
      this.spinner.hide();
      this.toastrService.error("Please Choose Different Activity Title Name");
    }
  }

  editNotification(data: any) {
    this.NotificationText = "Update";
    this.getImgPath = data.NewsImages;
    this.forwardActivitiForm.patchValue({
      CreatedBy: this.commonService.loggedInUserId(),
      Id: data.NewsId,
      activityTitle: data.Title,
      activityBody: data.Description,
      hashtags_Activity: data.HashTags,
      IsChangeImage: data.IsChangeImage,
    })
  }


  resetNotificationForm() {
    this.submitted = false;
    this.paginationNo = 1;
    this.getImgPath = null;
    this.forwardActivitiForm.reset();
    this.NotificationText = "Push";
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
    this.callAPIService.setHttp('get', 'Delete_News_Web_1_0?NewsId=' + this.NewsId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.resetNotificationForm();
        this.getNewsData();
      } else {
      }
    }, (error: any) => {
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

  getnewstype() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Getnewstype?', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.newstypeArray = res.data1;
      } else {
        this.spinner.hide();
        // this.toastrService.error("Data is not available1");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getNewsData() {
    let getObj: any = this.filterForm.value;
    this.spinner.show();
    let fromDate: any;
    let toDate: any;
    getObj.fromTo[0] != "" ? (fromDate = this.datePipe.transform(getObj.fromTo[0], 'dd/MM/yyyy')) : fromDate = '';
    getObj.fromTo[1] != "" ? (toDate = this.datePipe.transform(getObj.fromTo[1], 'dd/MM/yyyy')) : toDate = '';
    let ClientId = this.commonService.getlocalStorageData().ClientId == 0 ? getObj.ClientId : this.commonService.getlocalStorageData().ClientId;

    let obj = this.commonService.loggedInUserId() + '&PageNo=' + this.paginationNo + '&FromDate=' + fromDate + '&ToDate=' + toDate +
      '&NewsType=' + getObj.newstypeId + '&SearchText=' + getObj.searchText + '&ClientId=' + ClientId
    this.callAPIService.setHttp('get', 'GetNews_Web_2_0?UserId=' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getnewsArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.getnewsArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.getnewsArray = [];
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  filterData(flag: any) {
    flag == 'range' ? this.defaultCloseBtn = true : this.defaultCloseBtn = false;
    this.paginationNo = 1;
    this.getNewsData();
  }

  clearFilter(flag: any) {
    if (flag == 'client') {
      this.filterForm.controls['ClientId'].setValue(0);
    } else if (flag == 'newsType') {
      this.filterForm.controls['newstypeId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['searchText'].setValue('');
    } else if (flag == 'dateRangePIcker') {
      this.defaultCloseBtn = false;
      this.filterForm.controls['fromTo'].setValue(['', '']);
    }
    this.paginationNo = 1;
    this.getNewsData();
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
      this.getNewsData();
    }
    );
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getNewsData();
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
          this.getImgPath = this.ImgUrl;
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

  showSocialMediaCount(flag:any) {
    this.hideSocialMediaCountDiv = flag;
    this.countText = flag;
    this.getForwordCountsReport();
  }

  getForwordCountsReport() {
    this.callAPIService.setHttp('get', 'GetForwordCountsReport?NewsId=' + 77 + '&ClientId=' + 42, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.forwordCountsReportArray = res.data1;
      } else {
        this.forwordCountsReportArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

}
