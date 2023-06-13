import { Component, OnInit } from '@angular/core';
import { CallAPIService } from 'src/app/services/call-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-page-access-right',
  templateUrl: './page-access-right.component.html',
  styleUrls: ['./page-access-right.component.css'],
})
export class PageAccessRightComponent implements OnInit {
  //Intialize Property
  userTypeArray: { id: number; userTypeName: string }[] = [];
  selectedUserId: number = 0;
  selectedSubUserId: number = 0;
  subUserTypeArray: {
    id: number;
    subUserTypeName: string;
    userTypeId: number;
  }[] = [];
  userRights: {
    pageId: number;
    pageName: string;
    readRights: number;
    writeRights: number;
    subUserTypeId: number;
  }[] = [];

  filterForm:FormGroup | any;

  constructor(
    private callAPIService: CallAPIService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private toastrService: ToastrService,
    private fb:FormBuilder,
  ) {}

  ngOnInit(): void {
    this.getUserTypeDropDown();
    this.defaultLoadDropdown();
  }

  //Load Dropdown In UserTypes
  getUserTypeDropDown() {
    this.spinner.show();
    this.callAPIService.setHttp(
      'get',
      'UserRights/GetUserType',
      false,
      false,
      false,
      'electionMicroServiceForWeb'
    );
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        this.spinner.hide();
        this.userTypeArray = res.responseData;
        this.filterForm.value.userType ? this.getSubUserTypes(this.filterForm.value.userType):'';
      },
      (error: any) => {
        this.spinner.hide();
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      }
    );
  }

  //Get SubUserTypes Dropdown
  getSubUserTypes(userType?: number, flag?:string) {
    if (userType != 0) {
      this.spinner.show();
      let obj = 'UserRights/GetSubUserType?userType=' + userType;
      this.callAPIService.setHttp(
        'get',
        obj,
        false,
        false,
        false,
        'electionMicroServiceForWeb'
      );
      this.callAPIService.getHttp().subscribe(
        (res: any) => {
          this.spinner.hide();
          this.subUserTypeArray = [];
          this.userRights = [];
          this.subUserTypeArray = res.responseData;
          flag != 'sel'?  this.getUserRights():'';
        },
        (error: any) => {
          this.spinner.hide();
          if (error.status == 500) {
            this.router.navigate(['../500'], { relativeTo: this.route });
          }
        }
      );
    } else {
      this.subUserTypeArray = [];
      this.selectedSubUserId = 0;
    }
  }

  //Get UserRights Details
  getUserRights() {
    let formData = this.filterForm.value;
      this.spinner.show();
      let obj =
        'UserRights/GetSubUserTypesPageRights?subUserTypeId=' + formData.subUserType;
      this.callAPIService.setHttp(
        'get',
        obj,
        false,
        false,
        false,
        'electionMicroServiceForWeb'
      );
      this.callAPIService.getHttp().subscribe(
        (res: any) => {
          this.spinner.hide();
          this.userRights = [];
          this.userRights = res.responseData;
          console.log(this.userRights);
        },
        (error: any) => {
          this.spinner.hide();
          if (error.status == 500) {
            this.router.navigate(['../500'], { relativeTo: this.route });
          }
        }
      );
  }

  //When Change CheckBox to change the value to one
  accessRights(rightsIdentity: string, rights: any, event: any) {
    if (rightsIdentity == 'read')
      rights.readRights = event.target.checked ? 1 : 0;
    if (rightsIdentity == 'write')
      rights.writeRights = event.target.checked ? 1 : 0;
  }

  //When Change UserType Or SubUserType Trigger Event Function
  // GetSubUserDetailsOrUserRights(typeIdentity: string, event: any) {
  //   if (typeIdentity == 'userType') {
  //     this.selectedUserId = event.target.value;
  //     this.getSubUserTypes(this.selectedUserId);
  //   }
  //   if (typeIdentity == 'subUserType') {
  //     this.selectedSubUserId = event.target.value;
  //     this.getUserRights(event.target.value);
  //   }
  // }
  //Save User Rights
  SaveUserRights() {
    let formData = this.filterForm.value;
    const obj = this.userRights.filter(
      (x) => x.readRights == 1 || x.writeRights == 1
    );
    this.spinner.show();
    let Url =
      'UserRights/SaveUserRights?subUserTypeId=' +
      formData.subUserType +
      '&userId=' +
      formData.userType;
    this.callAPIService.setHttp(
      'POST',
      Url,
      false,
      obj,
      false,
      'electionMicroServiceForWeb'
    );
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
      },
      (error: any) => {
        this.spinner.hide();
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
          this.spinner.hide();
        }
      }
    );
  }

  //Load Default UserType And Client Type
  defaultLoadDropdown() {
    this.filterForm = this.fb.group({
      userType:[this.commonService.loggedInUserId()],
      subUserType:[this.commonService.loggedInSubUserTypeId()],
    });

    // this.getUserTypeDropDown();
    // this.selectedUserId = this.commonService.loggedInUserId();
    // this.getSubUserTypes(this.selectedUserId);
    // this.selectedSubUserId = this.commonService.loggedInSubUserTypeId();
    //
  }
}

