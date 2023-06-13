import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

@Component({
  selector: 'app-add-supervisor',
  templateUrl: './add-supervisor.component.html',
  styleUrls: ['./add-supervisor.component.css']
})
export class AddSupervisorComponent implements OnInit {

  callCenterUserForm!: FormGroup | any;
  submitted: boolean = false;
  callCenterUserArray: any;
  clientNameArray: any;
  electionNameArray: any;
  electionNameArrayForFilter: any;
  GenderArray = [{ id: 1, name: "Male" }, { id: 2, name: "Female" }];
  checkedBoothFlag: boolean = true;
  boothSelectedArray: any[] = [];
  submitedBoothSelectedArray: any[] = [];
  constituencyNameArray: any;
  constituencyNameArrayForFilter: any;
  clientWiseBoothListArray: any;
  clientWiseBoothListArrayForFilter: any;
  IsSubElectionApplicable: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  HighlightRow: any;
  searchBoothListData = '';
  clientName: any;
  electionName: any;
  constituencyName: any;
  btnText = 'Submit';
  filterForm!: FormGroup | any;
  modalTextChange: any;
  callCenterUserObj: any;
  sendUserCredentialObj: any;
  updateFlagCheck: any;

  subject: Subject<any> = new Subject();

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.defaultForm();
    this.defaultFilterForm();
    this.getClientName();
    this.getCallCenterUser();
    this.searchUserSuperData('false');
  }

  //............................................ Filter Code Start Here...................................//

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      clientId: [0],
      electionId: [0],
      constituencyId: [0],
      boothId: [0],
      search: ['']
    })
  }

  clearFilter(flag: any) {
    if (flag == 'client') {
      this.filterForm.controls['electionId'].setValue(0);
      this.filterForm.controls['constituencyId'].setValue(0);
      this.filterForm.controls['boothId'].setValue(0);
      this.electionNameArrayForFilter = [];
      this.constituencyNameArrayForFilter = [];
      this.clientWiseBoothListArrayForFilter = [];
    } else if (flag == 'election') {
      this.filterForm.controls['constituencyId'].setValue(0);
      this.filterForm.controls['boothId'].setValue(0);
      this.constituencyNameArrayForFilter = [];
      this.clientWiseBoothListArrayForFilter = [];
    } else if (flag == 'constituency') {
      this.filterForm.controls['boothId'].setValue(0);
      this.clientWiseBoothListArrayForFilter = [];
    } else if (flag == 'search') {
      this.filterForm.controls['search'].setValue('');
    }
    this.getCallCenterUser();
    this.paginationNo = 1;
  }

  //............................................ Filter Code End Here...................................//


  defaultForm() {
    this.callCenterUserForm = this.fb.group({
      id: [0],
      mobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      fName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      mName: ['', [Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
      lName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      gender: [1, Validators.required],
      clientId: ['', Validators.required],
      electionId: [''],
      constituencyId: [''],
      boothId: ['']
    })
  }

  getClientName() {
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.callCenterUserForm.patchValue({ clientId: this.clientNameArray[0].clientId }), this.getElectionName('submitFlag')) : '';
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ clientId: this.clientNameArray[0].clientId }), this.getElectionName('filterFlag')) : '';
      } else {
        this.clientNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName(flag: any) {
    let obj;
    if (flag == 'submitFlag') {
      obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.callCenterUserForm.value.clientId;
    } else {
      obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.clientId;
    }
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        if (flag == 'submitFlag') {
          this.electionNameArray = res.responseData;
          this.electionNameArray.length == 1 && this.updateFlagCheck == true ? (this.callCenterUserForm.patchValue({ electionId: this.electionNameArray[0].electionId }),
            (this.IsSubElectionApplicable = this.electionNameArray[0].isSubElectionApplicable), this.getConstituencyName('submitFlag')) : '';
        } else {
          this.electionNameArrayForFilter = res.responseData;
          this.electionNameArrayForFilter.length == 1 ? (this.filterForm.patchValue({ electionId: this.electionNameArrayForFilter[0].electionId }),
            (this.IsSubElectionApplicable = this.electionNameArrayForFilter[0].isSubElectionApplicable), this.getConstituencyName('filterFlag')) : '';
        }
      } else {
        flag == 'submitFlag' ? this.electionNameArray = [] : this.electionNameArrayForFilter = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName(flag: any) {
    let obj;
    if (flag == 'submitFlag') {
      obj = this.commonService.loggedInUserId() + '&ClientId=' + this.callCenterUserForm.value.clientId +
        '&ElectionId=' + this.callCenterUserForm.value.electionId
    } else {
      obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.clientId +
        '&ElectionId=' + this.filterForm.value.electionId
    }
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        if (flag == 'submitFlag') {
          this.constituencyNameArray = res.responseData;
          this.constituencyNameArray.length == 1 && this.updateFlagCheck == true ? ((this.callCenterUserForm.patchValue({ constituencyId: this.constituencyNameArray[0].constituencyId })), this.ClientWiseBoothList('submitFlag')) : '';
        } else {
          this.constituencyNameArrayForFilter = res.responseData;
          this.constituencyNameArrayForFilter.length == 1 ? ((this.filterForm.patchValue({ constituencyId: this.constituencyNameArrayForFilter[0].constituencyId })), this.ClientWiseBoothList('filterFlag')) : '';
        }
      } else {
        flag == 'submitFlag' ? this.constituencyNameArray = [] : this.constituencyNameArrayForFilter = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList(flag: any) {
    let obj;
    if (flag == 'submitFlag') {
      let formData = this.callCenterUserForm.value;
      obj = 'ClientId=' + formData.clientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId='
        + formData.electionId + '&ConstituencyId=' + formData.constituencyId + '&VillageId=' + 0
    } else {
      let formData = this.filterForm.value;
      obj = 'ClientId=' + formData.clientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId='
        + formData.electionId + '&ConstituencyId=' + formData.constituencyId + '&VillageId=' + 0
    }
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        if(flag == 'submitFlag'){
          this.clientWiseBoothListArray = res.responseData;
          this.submitedBoothSelectedArray.map((ele:any)=>{
            this.clientWiseBoothListArray.find((eleobj:any)=>{
              (ele.boothId == eleobj.boothId) ? eleobj['availabled'] = true : (ele.availabled == false) ? eleobj['availabled'] = false : '';
            })
          })
        }else{
          this.clientWiseBoothListArrayForFilter = res.responseData;
        }
      } else {
        flag == 'submitFlag' ? this.clientWiseBoothListArray = [] : this.clientWiseBoothListArrayForFilter = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getCallCenterUser() {
    let clientIdData = this.commonService.getlocalStorageData().ClientId;
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj = 'ClientId=' + (clientIdData != 0 ? clientIdData : this.commonService.checkDataType(formData.clientId) == true ? formData.clientId : 0) + '&UserId=' + this.commonService.loggedInUserId()
      + '&ElectionId=' + (this.commonService.checkDataType(formData.electionId) == true ? formData.electionId : 0)
      + '&ConstituencyId=' + (this.commonService.checkDataType(formData.constituencyId) == true ? formData.constituencyId : 0) + '&BoothId=' + (this.commonService.checkDataType(formData.boothId) == true ? formData.boothId : 0)
      + '&Search=' + formData.search + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetCallCenterUser?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.callCenterUserArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
      } else {
        this.callCenterUserArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  get f() { return this.callCenterUserForm.controls };

  onSubmitForm() {
    this.submitted = true;
    if (this.callCenterUserForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      this.spinner.show();
      let formData = this.callCenterUserForm.value;
      let fullName = formData.fName + ' ' + formData.mName + ' ' + formData.lName;
      this.submitedBoothSelectedArray.forEach((ele: any) => { delete ele.myObject; });
      let obj = {
        "id": formData.id,
        "fullName": fullName,
        "mobileNo": formData.mobileNo,
        "fName": formData.fName,
        "mName": formData.mName,
        "lName": formData.lName,
        "gender": formData.gender,
        "clientId": parseInt(formData.clientId),
        "createdBy": this.commonService.loggedInUserId(),
        "subUserTypeId": 6,
        "assignedBoothlist": this.submitedBoothSelectedArray
      }

      this.callAPIService.setHttp('POST', 'ClientMasterWebApi/VoterCRM/CreateCallCenterUser', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.responseData.msg);
          this.getCallCenterUser();
          this.clearForm();
          this.submitted = false;
        } else {
          res.statusCode != "200" ? this.submitedBoothSelectedArray = JSON.parse(JSON.stringify(this.boothSelectedArray)) : '';
          this.spinner.hide();
          this.toastrService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  editCallCenterUserData(obj: any) {
    this.HighlightRow = obj.userId;
    this.btnText = "Update";
    this.submitedBoothSelectedArray = [];
    this.clearDropdownData('electionId');
    this.callCenterUserForm.patchValue({
      id: obj?.userId,
      mobileNo: obj?.mobileNo,
      fName: obj?.fName,
      mName: obj?.mName,
      lName: obj?.lName,
      gender: obj?.gender,
      clientId: obj?.clientId.toString(),
    })
    obj?.clientId ? this.getElectionName('submitFlag') : '';
    obj?.assignedBoothlist.map((ele: any) => {
      let bindobj = {
        "assemblyId": ele.assemblyId,
        "boothId": ele.boothId,
        "constituencyId": ele.constituencyId,
        "electionId": ele.electionId,
        "myObject": {
          "clientName": obj?.clientName,
          "electionName": ele.electionName,
          "constituencyName": ele.constituencyName,
          "boothsName": ele.boothName,
        }
      }
      this.submitedBoothSelectedArray.push(bindobj);
    })
    this.boothSelectedArray = JSON.parse(JSON.stringify(this.submitedBoothSelectedArray));
  }

  clearForm() {
    this.defaultForm();
    this.btnText = "submit";
    this.submitted = false;
    this.submitedBoothSelectedArray = [];
    this.boothSelectedArray = [];
    this.clientWiseBoothListArray = [];
   // this.clientNameArray.length == 1 ? (this.callCenterUserForm.patchValue({ clientId: this.clientNameArray[0].clientId }), this.getElectionName('submitFlag')) : '';
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getCallCenterUser();
    this.clearForm();
  }

  onKeyUpSearchData() {
    this.subject.next();
  }

  searchUserSuperData(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.filterForm.value.search
        this.paginationNo = 1;
        this.getCallCenterUser();
      }
      );
  }

  clearDropdownData(flag: any) {
    if (flag == 'clientId') {
      this.callCenterUserForm.controls['electionId'].setValue('');
      this.callCenterUserForm.controls['constituencyId'].setValue('');
      this.clientWiseBoothListArray = [];
      this.submitedBoothSelectedArray = [];
      this.boothSelectedArray = [];
    } else if (flag == 'electionId') {
      this.callCenterUserForm.controls['constituencyId'].setValue('');
      this.clientWiseBoothListArray = [];
      this.boothSelectedArray = [];
    } else if (flag == 'constituencyId') {
      this.clientWiseBoothListArray = [];
      this.boothSelectedArray = [];
    }
  }

  addBoothsData() {
    let formData = this.callCenterUserForm.value;
    if (formData.electionId != '' && formData.constituencyId != '' && this.boothSelectedArray.length != 0) {
      this.submitedBoothSelectedArray = [...this.submitedBoothSelectedArray, ...this.boothSelectedArray];
      this.submitedBoothSelectedArray = Object.values(this.submitedBoothSelectedArray.reduce((acc: any, cur: any) => Object.assign(acc, { [cur.boothId]: cur }), {}));
      this.callCenterUserForm.controls['electionId'].setValue('');
      this.callCenterUserForm.controls['constituencyId'].setValue('');
      this.clientWiseBoothListArray = [];
    } else {
      this.toastrService.error('please select Booths');
    }
  }

  deleteBooth(index: any) {
    this.submitedBoothSelectedArray.splice(index, 1);
    this.boothSelectedArray = JSON.parse(JSON.stringify(this.submitedBoothSelectedArray));
  }

  //.......................................  Booth CheckBox Code Start Here .................................//

  getNameByObj(event: any, flag: any) { // dropdown selection Value Name Get
    if (flag == 'client') {
      this.clientName = event[0]?.data.clientName;
    } else if (flag == 'election') {
      this.electionName = event[0]?.data.electionName;
    } else if (flag == 'constituency') {
      this.constituencyName = event[0]?.data.constituencyName;
    }
  }

  onCheckedBoothChanges(event: any, eleObj: any) {
    let obj = {
      "assemblyId": eleObj?.assemblyId,
      "boothId": eleObj?.boothId,
      "constituencyId": this.callCenterUserForm.value.constituencyId,
      "electionId": this.callCenterUserForm.value.electionId,
      "myObject": {
        "clientName": this.clientName,
        "electionName": this.electionName,
        "constituencyName": this.constituencyName,
        "boothsName": eleObj?.boothNickName,
      }
    }
    if (event.target.checked == true) {
      this.checkUniqueData(obj, eleObj?.boothId);
    } else { //delete record when event False
      this.boothSelectedArray.splice(this.boothSelectedArray.findIndex((ele: any) => ele.boothId === eleObj?.boothId), 1);
    }
  }

  checkUniqueData(obj: any, BoothId: any) { //Check Unique Data then Insert or Update
    this.checkedBoothFlag = true;
    if (this.boothSelectedArray.length <= 0) {
      // obj['checked'] = true;
      this.boothSelectedArray.push(obj);
      this.checkedBoothFlag = false;
    } else {
      this.boothSelectedArray.map((ele: any, index: any) => {
        if (ele.boothId == BoothId) {
          this.boothSelectedArray[index] = obj;
          this.checkedBoothFlag = false;
        }
      })
    }
    this.checkedBoothFlag && this.boothSelectedArray.length >= 1 ? this.boothSelectedArray.push(obj) : '';
  }

  //.......................................  Booth CheckBox Code End Here .................................//

  //.......................................  Block User Code Start Here .................................//

  blockUser(obj: any) {
    this.HighlightRow = obj.userId;
    let checkBlogStatus: any;
    obj?.isUserBlock == 0 ? checkBlogStatus = 1 : checkBlogStatus = 0;
    this.callAPIService.setHttp('get', 'Web_Insert_Election_BlockBoothAgent?UserId=' + obj?.userId + '&ClientId=' + obj?.clientId
      + '&CreatedBy=' + this.commonService.loggedInUserId() + '&IsBlock=' + checkBlogStatus, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getCallCenterUser();
      } else {
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //.......................................  Block User Code End Here .................................//

  //.......................................  Delete Supervisor Code End Here .................................//

  deleteConfirmModel(clientId: any, userId: any) {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteClientPA(clientId, userId);
      }
    });
  }

  deleteClientPA(clientId: any, userId: any) {
    this.callAPIService.setHttp('DELETE', 'ClientMasterApp/BoothAgent/DeleteClientPA?ClientId=' + clientId
      + '&CreatedBy=' + this.commonService.loggedInUserId() + '&AgentId=' + userId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.toastrService.success(res.responseData.msg);
        this.clearForm();
        this.getCallCenterUser();
      } else {
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......................................  Delete Supervisor Code End Here .................................//

  sendLoginCredential(obj: any) { //Send Lind for Login Credential Code Start Here
    this.HighlightRow = obj.userId;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Login-GetOtp/GetUserLoginCredential?UserId=' + obj.userId + '&ClientId=' + obj.clientId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.toastrService.success(res.statusMessage);
      } else {
        this.toastrService.error(res.statusMessage);
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

}
