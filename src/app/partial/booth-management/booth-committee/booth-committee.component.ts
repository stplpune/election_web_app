import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { debounceTime } from 'rxjs/operators';
import { log } from 'console';

@Component({
  selector: 'app-booth-committee',
  templateUrl: './booth-committee.component.html',
  styleUrls: ['./booth-committee.component.css']
})
export class BoothCommitteeComponent implements OnInit {


  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  voterAreaArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  missingAreaData: any;
  assignVoterObj: any;
  filterForm!: FormGroup | any;
  stateArray: any;
  divisionArray: any;
  districtArray: any;
  talkaArray: any;
  villageArray: any;
  localStorageData = this.commonService.getlocalStorageData();
  boothArray: any;

  boothComtyMemberListArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  getTotalPages: any;

  boothCommitteeType = 1;
  boothComitySearchVoterArray: any;
  designationArray: any;
  urlCommityDashboardData:any;

  onChange_Assembly_VillageArray = [{ id: 1, name: "Taluka" }, { id: 2, name: "Assembly" }];

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,  
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { 
    let ReceiveDataSnapshot: any = this.route.snapshot.params.id;
    if (ReceiveDataSnapshot) {
      ReceiveDataSnapshot = ReceiveDataSnapshot.split('.');
      this.urlCommityDashboardData = { 'stateId': +ReceiveDataSnapshot[0], 'divisionId': +ReceiveDataSnapshot[1], 'districtId': +ReceiveDataSnapshot[2], 'talukaId': +ReceiveDataSnapshot[3] }
    }
  }

  ngOnInit(): void {
    this.defaultFilterForm();
    this.getState();
    this.defaultBoothComityForm();
    this.getDesignationMaster();
    this.searchVoterData();

    if (this.urlCommityDashboardData) { // URL data Get then Call
        this.filterForm.controls['StateId'].setValue(1);
        this.filterForm.controls['DivisionId'].setValue(this.urlCommityDashboardData.divisionId);
        this.filterForm.controls['DistrictId'].setValue(this.urlCommityDashboardData.districtId)
        this.filterForm.controls['TalukaId'].setValue(this.urlCommityDashboardData.talukaId)

        this.getDivision();
        this.getDistrict();
        this.getTaluka();
        this.filterForm.value.TalukaId > 0 ? (this.getCommitteMemberTypewise(),this.getVillage(),this.getBooth(),this.dataNotFound = true) : '';
      }
  }

  get f() { return this.filterForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      StateId: ['', Validators.required],
      DivisionId: [''],
      DistrictId: [''],
      TalukaId: [''],
      VillageId: [''],
      BoothId: [''],
      isAssemblyVillage: [''],
    })
  }

  onChangeAss_Village(){
    
  }

  getState() {
    this.callAPIService.setHttp('get', 'Filter/GetAllState?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.stateArray = res.responseData;
        this.stateArray?.length == 1 && !this.urlCommityDashboardData ? (this.f['StateId'].setValue(this.stateArray[0]?.id), this.getDivision()) : '';
      } else {
        this.stateArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDivision() {
    this.callAPIService.setHttp('get', 'Filter/GetAllDivision?StateId=' + this.f['StateId'].value + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.divisionArray = res.responseData;
        this.divisionArray?.length == 1 && !this.urlCommityDashboardData ? (this.f['DivisionId'].setValue(this.divisionArray[0]?.divisionId), this.getDistrict()) : '';
      } else {
        this.divisionArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDistrict() {
    this.callAPIService.setHttp('get', 'Filter/GetAllDistricts?UserId=' + this.commonService.loggedInUserId() + '&StateId=' + this.f['StateId'].value + '&DivisionId=' + (this.f['DivisionId'].value || 0), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.districtArray = res.responseData;
        this.districtArray?.length == 1 ? (this.f['DistrictId'].setValue(this.districtArray[0]?.districtId), this.getTaluka()) : '';
        // this.getTaluka();
      } else {
        this.districtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getTaluka() {
    this.callAPIService.setHttp('get', 'Filter/GetAllTaluka_1_0?DistrictId=' + (this.f['DistrictId'].value || 0) + '&UserId=' + this.commonService.loggedInUserId()
   +'&IsHaveTaluka=' + (this.f['isAssemblyVillage'].value || 0), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.talkaArray = res.responseData;
        this.talkaArray?.length == 1 ? (this.f['TalukaId'].setValue(this.talkaArray[0]?.talukaId), this.getVillage()) : '';
      } else {
        this.talkaArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getVillage() {
    this.callAPIService.setHttp('get', 'Filter/GetAllVillages_1_0?TalukaId=' + (this.f['TalukaId'].value || 0) + '&UserId=' + this.commonService.loggedInUserId()
    + '&IsHaveTaluka=' + (this.f['isAssemblyVillage'].value || 0), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.villageArray = res.responseData;
        this.villageArray?.length == 1 ? this.f['VillageId'].setValue(this.villageArray[0]?.villageId) : '';
      } else {
        this.villageArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getBooth() {
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&VillageId=' + (this.f['VillageId'].value || 0) +'&IsHaveTaluka=' + (this.f['isAssemblyVillage'].value || 0);
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetBoothDetailsMaterState_1_0?TalukaId=' + (this.f['TalukaId'].value || 0) + '&UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.boothArray = res.responseData;
      } else {
        this.boothArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }


  clearFilter(flag: any) {// state         
    if (flag == 'state') {
      this.f['DivisionId'].setValue('');
      this.f['DistrictId'].setValue('');
      this.f['TalukaId'].setValue('');
      this.f['VillageId'].setValue('');
      this.f['BoothId'].setValue('');
      this.f['isAssemblyVillage'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'division') {
      this.f['DistrictId'].setValue('');
      this.f['TalukaId'].setValue('');
      this.f['VillageId'].setValue('');
      this.f['BoothId'].setValue('');
      this.f['isAssemblyVillage'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'district') {
      this.f['TalukaId'].setValue('');
      this.f['VillageId'].setValue('');
      this.f['BoothId'].setValue('');
      this.f['isAssemblyVillage'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'isAssemblyVillage') {
      this.f['TalukaId'].setValue('');
      this.f['VillageId'].setValue('');
      this.f['BoothId'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'taluka') {
      this.f['VillageId'].setValue('');
      this.f['BoothId'].setValue('');
      this.dataNotFound = false;
      this.boothCommitteeType = 1;
      this.getCommitteMemberTypewise();
      this.clearBCDetail();
    } else if (flag == 'village') {
      this.f['BoothId'].setValue('');
      this.boothCommitteeType = 1;
      this.getCommitteMemberTypewise();
      this.clearBCDetail();
    } else if (flag == 'booth') {
      this.boothCommitteeType = 1;
      this.getCommitteMemberTypewise();
      this.clearBCDetail();
    }
  }

  comitteeType(flag:any){
    flag == 'general' ? (this.boothCommitteeType = 1,this.getCommitteMemberTypewise()) : (this.boothCommitteeType = 2,this.getCommitteMemberTypewise());
    this.boothCommitteeType == 1 ? this.b['gender'].setValue(1) : this.b['gender'].setValue(2);
  }

  getCommitteMemberTypewise() {  // Main Api For Table
    // this.nullishFilterForm();
    this.spinner.show();  
    let obj = this.localStorageData?.ClientId + '&TalukaId=' + (this.filterForm.value.TalukaId || 0)
      + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&AreaId=' + 0
      + '&IsPresident=' + 0 + '&CommitteeTypeId=' + this.boothCommitteeType + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize
      +'&IsHaveTaluka=' + (this.f['isAssemblyVillage'].value || 0);
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetBoothWiseCommitteMemberCommitteeTypewiseState_2_0?ClientId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothComtyMemberListArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
        this.getTotalPages = res.responseData.responseData2.totalPages;
      } else {
        this.spinner.hide();
        this.boothComtyMemberListArray = [];
      }
    }, (error: any) => { this.spinner.hide(); this.router.navigate(['../500'], { relativeTo: this.route }) })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getCommitteMemberTypewise();
  }


  //.......... get Voter Area List ...............//
  getVoterAreaList(boothId: any) {
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetAreaDetailsWithBothId?ClientId=' + this.localStorageData?.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&BoothId=' + boothId,
      + '&VillageId=' + this.filterForm.value.VillageId, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.voterAreaArray = res.responseData;
      } else {
        this.voterAreaArray = [];
      }
    }, (error: any) => { this.router.navigate(['../500'], { relativeTo: this.route }) })
  }

  getDesignationMaster() {  // Get Designation Master 
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetDesignationMasterState?ClientId=' + this.localStorageData?.ClientId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.designationArray = res.responseData;
      } else {
        this.designationArray = [];
      }
    }, (error: any) => { this.router.navigate(['../500'], { relativeTo: this.route }) })
  }

  isMobileNoExists() {  // verify Mobile No Registerd or Not
    if (this.b['mobileNo'].value?.length == 10 && this.b['mobileNo'].status == 'VALID') {
      let obj = '&Id=' + 0 + '&MobileNo=' + this.b['mobileNo'].value;
      this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/IsMobileNoExists?ClientId=' + this.localStorageData?.ClientId + obj, false, false, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          if (res.responseData?.userId == -1) {
            this.toastrService.error("Mobile Number Already Registerd"), this.b['mobileNo'].setValue('');
          } else if (res.responseData?.userId > 1) {
            this.confornModelMsg = res.responseData.msg;
            this.toastrService.error("Mobile Number Already Registerd"), this.b['mobileNo'].setValue('');
            // this.CommityMemberconfModel.nativeElement.click();
          } else {
            this.finalAddBCMemberForm();
          }
        } else {
        }
      }, (error: any) => { this.router.navigate(['../500'], { relativeTo: this.route }) })
    }
  }

  addBoothCommiteeMemberBtn(obj: any) {
    this.clearBCDetail();
    this.boothComityListObj = obj;
    this.saveUpdateFlag = 'add';
    this.btnTextBoothComity = 'Submit';
    this.getSearchVoterBCGeneralAndFemale(obj?.boothId);
    this.getVoterAreaList(obj?.boothId);
    this.areaObjforAdd = '';
  }

  updateBoothCommiteeMemberBtn(obj: any) {
    this.clearBCDetail();
    this.boothComityListObj = obj;
    this.saveUpdateFlag = 'update';
    this.btnTextBoothComity = 'Update';
    this.getSearchVoterBCGeneralAndFemale(obj?.boothId);
    this.getVoterAreaList(obj?.boothId);
    this.areaObjforAdd = '';

    obj.boothcommitteeMembers.map((ele: any) => {
      let fullName = ele?.voterName ? ele?.voterName?.trim().split(' ') : [];
      let obj = {
        "id": 0,
        "fullName": ele?.voterName,
        "mobileNo": ele?.mobileNo,
        "fName": fullName[0],
        "mName": fullName?.length == 3 ? fullName[1] : '',
        "lName": fullName?.length == 3 ? fullName[2] : fullName[1],
        "gender": ele?.gender,
        "age": ele?.age,
        "boothId": ele?.boothId,
        "designationId": ele?.designationId,
        "voterId": ele?.voterId,
        "clientId": parseInt(this.localStorageData?.ClientId),
        "createdBy": this.commonService.loggedInUserId(),
        "subUserTypeId": 4,
        "areaAgentId": ele?.areaAgentId,
        "committeeTypeId": this.boothCommitteeType,
        "isdeleted": 0,
        "assignedBoothlist": [
          {
            "assemblyId": this.boothComityListObj?.assemblyId || 0,
            "boothId": ele?.boothId,
            "constituencyId": 0,
            "electionId": 0
          }
        ],
        "voterNo": ele?.voterNo
      }
      this.pushVoterListArray.push(obj);
  //     this.pushVoterListArray.map((ele:any)=>{
  //       ele['designation'] = this.designationArray.find((e:any)=> e.id== obj.designationId).designationName;
  //  })
    })
  }


  subject: Subject<any> = new Subject();
  voterSearch = new FormControl('');
  boothIdforAdd: any;
  areaObjforAdd: any;
  boothComityListObj: any;

  getSearchVoterBCGeneralAndFemale(boothId: any) {
    this.boothIdforAdd = boothId;
    this.spinner.show();
    let obj = this.localStorageData?.ClientId + '&SearchText=' + this.voterSearch.value
      + '&BoothId=' + boothId + '&AreaId=' + (this.areaObjforAdd?.areaId || 0) + '&CommitteeTypeId=' + this.boothCommitteeType
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetBoothWiseCommitteGeneralAndFemaleSearchState?ClientId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothComitySearchVoterArray = res.responseData;
        this.pushVoterListArray.map((ele: any) => {
          this.boothComitySearchVoterArray.map((ele1: any) => {
            ele?.voterId == ele1?.voterId ? ele1['disableFlag'] = true : '';
          })
        })
      } else {
        this.spinner.hide();
        this.boothComitySearchVoterArray = [];
      }
    }, (error: any) => { this.spinner.hide(); this.router.navigate(['../500'], { relativeTo: this.route }) })
  }


  onKeyUpSearchData() {
    this.subject.next();
  }

  searchVoterData() {
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.voterSearch.value;
      this.paginationNo = 1;
      this.clearBCForm();
      this.getSearchVoterBCGeneralAndFemale(this.boothIdforAdd);
    });
  }


  boothCommitteeForm: FormGroup | any;
  submitted: boolean = false;
  btnTextBoothComity = 'Submit';
  @ViewChild('addCommitteeMemberModel') addCommitteeMemberModel: any;
  saveUpdateFlag: any;
  voterClickObj: any;
  // disableBCFormValue:boolean = true;
  pushVoterListArray: any[] = [];
  GenderArray = [{ id: 1, name: "Male" }, { id: 2, name: "Female" }];
  // @ViewChild('CommityMemberconfModel') CommityMemberconfModel: any;
  confornModelMsg:any;

  get b() { return this.boothCommitteeForm.controls };

  defaultBoothComityForm() {
    this.boothCommitteeForm = this.fb.group({
      id: [0],
      mobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      designationId: ['', Validators.required],

      fName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      mName: ['', [Validators.pattern(/^[A-Za-z]+$/)]],
      lName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      age: ['', Validators.required],
      gender: ['', Validators.required],
    })
  }

  checkPersidantAvail(){
    return this.pushVoterListArray?.some(item => (item?.isdeleted == 0 && item?.designationId == 10 && this.b['designationId'].value == 10));
  }

  checkMobileNo(){  return this.pushVoterListArray?.some(item => (item?.mobileNo == this.b['mobileNo'].value))}

  addBCMemberForm() {
    this.submitted = true;
    if (this.boothCommitteeForm.invalid) {
      return;
    } else if(this.checkMobileNo() == true){
      this.b['mobileNo'].setValue(''),this.toastrService.error('Mobile Number Already in list Please Enter Different');
      return;
    } else if(this.boothCommitteeForm.value?.age < 18 || this.boothCommitteeForm.value?.age > 120){
      this.b['age'].setValue(''),this.toastrService.error('Please Enter Valid Age');
      return;
    } else if (this.checkPersidantAvail() == true) {
      this.toastrService.error('You Select Only One Persident Please Select Different');
      return;
    } 
    else {
      this.isMobileNoExists();
    }
  }

  finalAddBCMemberForm(){
    let formData = this.boothCommitteeForm.value;
      let fullName = formData.fName + ' ' + formData.mName + ' ' + formData.lName;

      let obj = {
        "id": formData.id,
        "fullName": fullName,
        "mobileNo": formData.mobileNo,
        "fName": formData.fName,
        "mName": formData.mName,
        "lName": formData.lName,
        "gender": formData.gender,
        "age": formData.age,
        "boothId": this.boothComityListObj?.boothId || 0,
        "designationId": formData.designationId,
        "voterId": this.voterClickObj?.voterId,
        "clientId": parseInt(this.localStorageData?.ClientId),
        "createdBy": this.commonService.loggedInUserId(),
        "subUserTypeId": 4,
        "areaAgentId": 0,
        "committeeTypeId": this.boothCommitteeType,
        "assignedBoothlist": [
          {
            "assemblyId": this.boothComityListObj?.assemblyId || 0,
            "boothId": this.boothComityListObj?.boothId || 0,
            "constituencyId": 0,
            "electionId": 0
          }
        ],
        "areaId": this.voterClickObj?.areaId, //extra Added below three Key for condition 
        "voterNo": this.voterClickObj?.voterNo,
        "isdeleted": 0,
      }
      this.pushVoterListArray.push(obj);
      this.removeSelectedMissingArea('add',this.voterClickObj?.areaId);
      this.getSearchVoterBCGeneralAndFemale(this.boothIdforAdd); // (purpose) show only disable selected Voter
      this.clearBCForm();
  }

  removeSelectedMissingArea(flag: any,areaid:any) {
    this.boothComityListObj?.boothcommitteeMissingArea?.map((ele: any) => {
      if (this.pushVoterListArray?.length) {
        this.pushVoterListArray?.map((ele1: any) => {
          if (ele?.areaId == ele1?.areaId) {
            (flag == 'add' && areaid == ele?.areaId) ? ele['hideAreaFlag'] = true : '';
            (flag == 'delete' && areaid == ele?.areaId) ? ele['hideAreaFlag'] = false : '';
          } 
        })
      } else {
        ele['hideAreaFlag'] = false;
      }
    })
  }

  clearBCForm() {
    // this.disableBCFormValue = true;
    this.submitted = false;
    this.defaultBoothComityForm();
    this.voterClickObj = '';
    this.boothCommitteeType == 1 ? this.b['gender'].setValue(1) : this.b['gender'].setValue(2);
  }

  clearBCDetail() {
    this.submitted = false;
    this.defaultBoothComityForm();
    this.boothCommitteeType == 1 ? this.b['gender'].setValue(1) : this.b['gender'].setValue(2);
    this.pushVoterListArray = [];
    this.voterClickObj = '';
    this.voterSearch.setValue('');
  }

  areaClick(obj: any) {
    this.areaObjforAdd = obj;
    this.voterSearch.setValue('');
    this.clearBCForm();
    this.getSearchVoterBCGeneralAndFemale(this.boothIdforAdd);
  }


  AddVoterDetail(voterObj: any) {  // Add BoothCommittee Model
    this.voterClickObj = voterObj;
    // this.disableBCFormValue = false;
    // this.boothCommitteeForm.controls['designationId'].setValue(10);
    if(voterObj) {
      this.getDesignationMaster();
      // this.btnTextBoothComity = 'Submit';
      let fullName = voterObj?.englishName?.trim().split(' ');
      this.boothCommitteeForm.patchValue({
        id: 0,
        mobileNo: voterObj?.mobileNo1 || '',
        designationId: this.boothCommitteeForm.value.designationId,

        fName: fullName[0],
        mName: fullName?.length == 3 ? fullName[1] : '',
        lName: fullName?.length == 3 ? fullName[2] : fullName[1],
        age: voterObj?.age,
      })
    }
  }

  removeBindData() {
    // this.disableBCFormValue = true;
    this.defaultBoothComityForm();
    this.submitted = false;
  }

  voterAvailableOrNotinList(){
    return this.pushVoterListArray.some(item => item.isdeleted != 1);
  }

  onSubmitForm() {
    if (this.voterAvailableOrNotinList() == false) {
      this.toastrService.error('Please Add Member');
      return;
    } else {
      this.spinner.show();
      let url = this.saveUpdateFlag == 'update' ? 'ClientMasterApp/BoothCommittee/UpdateBoothCommitteeAreaUserState_1_0' : 'ClientMasterApp/BoothCommittee/CreateBoothCommitteeAreaUserState_1_0';
      this.callAPIService.setHttp('POST', url, false, this.pushVoterListArray, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {  
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.addCommitteeMemberModel.nativeElement.click();
          this.getCommitteMemberTypewise();
        } else { this.spinner.hide(); }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  //.......................................  Delete Booth Committee member code Start Here .................................//


  deleteConfirmModel(index: any,voterObj:any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.removeSelectedMissingArea('delete',voterObj?.areaId); //for Missing Area Show Hide
        if(voterObj?.areaAgentId == 0){
          this.pushVoterListArray.splice(index, 1);
        }else{
          this.pushVoterListArray.map((ele:any,i:any)=>{
            if(index == i){ ele['isdeleted'] = 1 }
          })
        }
        this.voterAvailableOrNotinList();
        this.getSearchVoterBCGeneralAndFemale(this.boothIdforAdd); // (purpose) only enabled selected Voter
      }
    });
  }

  // deleteBoothComityMember(eleObj: any) {
  //   let obj = this.localStorageData?.ClientId + '&BoothId=' + eleObj?.boothId + '&AreaAgentId=' + eleObj?.areaAgentId
  //     + '&VoterId=' + eleObj?.voterId + '&Deletedby=' + this.commonService.loggedInUserId() + '&ConstituencyId=' + 0
  //   this.callAPIService.setHttp('DELETE', 'ClientMasterApp/BoothCommittee/Delete?ClientId=' + obj, false, false, false, 'electionMicroSerApp');
  //   this.callAPIService.getHttp().subscribe((res: any) => {
  //     if (res.responseData != null && res.statusCode == "200") {
  //       this.toastrService.success(res.responseData.msg);
  //       this.getCommitteMemberTypewise();
  //     } else {
  //     }
  //   }, (error: any) => {
  //     this.router.navigate(['../500'], { relativeTo: this.route });
  //   })
  // }

  //.......................................  Delete Booth Committee member code End Here .................................//

  //............................................  Booth Committee Member List Model Code Start Here ...................................//

  getVoterlistForAssignBoothComityArray: any;
  assignedBoothComitySubject: Subject<any> = new Subject();
  areaAgentIdABL: any;
  getBoothId: any;
  voterAreaBCMLArray: any;
  getAreaIdBMCL: any;
  uservoterListArray: any[] = [];
  selectArea: any = new FormControl(0);
  searchText: any = '';
  allSelectCheckBox = new FormControl('');
  // allSelectCheckBox = new FormControl({value: '', disabled: (this.searchText != '' ? true : false)})
  @ViewChild('boothCMlist') boothCMlist: any;


  getVoterAreaListBCML(boothId: any) {
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetAreaDetailsWithBothId?ClientId=' + this.localStorageData?.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&BoothId=' + boothId,
      + '&VillageId=' + this.filterForm.value.VillageId, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.voterAreaBCMLArray = res.responseData;
      } else {
        this.voterAreaBCMLArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVoterlistForAssignBoothComity(areaAgentId: any, boothId: any) {  // List Booth Committee Member get Api Code
    this.spinner.show();
    this.areaAgentIdABL = areaAgentId;
    this.getBoothId = boothId;
    // this.allCheckedFlag = false;
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.localStorageData?.ClientId + '&BoothId=' + boothId
      + '&AreaId=' + (this.selectArea.value || 0) + '&AreaAgentId=' + areaAgentId + '&Search=' + this.searchText;
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetVoterlistForAssignBoothCommittee?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.getVoterlistForAssignBoothComityArray = res.responseData;
        this.getVoterlistForAssignBoothComityArray.find((ele: any) => {
          // ele.isAssigned == 1 ? this.allCheckedFlag = true : this.allCheckedFlag = false;
          ele.isAssigned == 1 ? this.allSelectCheckBox.setValue(true) : this.allSelectCheckBox.setValue(false);
        })
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.getVoterlistForAssignBoothComityArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearFilterAssignedBC(flag: any) {
    if (flag == 'search') {
      this.searchText = '';
    } else if (flag == 'area') {
      this.selectArea.setValue(0);
      this.searchText = '';
      this.getVoterlistForAssignBoothComity(this.areaAgentIdABL, this.getBoothId);
    }
  }

  selectAllCategory(event: any) {
    this.getVoterlistForAssignBoothComityArray.forEach((item: any) => item.isAssigned = event.target.checked);
  }

  selectSingleCategory(event: any, voterId: any) {
    this.getVoterlistForAssignBoothComityArray.forEach((ele: any) => {
      if (event.target.checked == true && ele.voterId == voterId) {
        ele['isAssigned'] = 1;
        return ele;
      } else if (event.target.checked == false && ele.voterId == voterId) {
        ele['isAssigned'] = 0;
        return ele;
      }
    });
    //.........................  check Count Code for Check All Selected Condition Start Code......................//
    let x = 1, y = 1, checkedCount, unCheckedCount;
    let arrayLength = this.getVoterlistForAssignBoothComityArray?.length;
    this.getVoterlistForAssignBoothComityArray.find((ele: any) => {
      ele.isAssigned == 1 ? checkedCount = x++ : unCheckedCount = y++;
    })
    arrayLength == checkedCount ? this.allSelectCheckBox.setValue(true) : this.allSelectCheckBox.setValue(false);
    //.........................  check Count Code for Check All Selected Condition End Code......................//
  }

  onSubmitAVoterToComityMemberForm() {
    this.getVoterlistForAssignBoothComityArray.find((ele: any) => {
      if (ele.isAssigned == 1) {
        let obj = { "headerId": 0, "voterId": ele?.voterId }
        this.uservoterListArray.push(obj);
      }
    })
    // if (this.uservoterListArray?.length == 0) {
    //   this.toastrService.error('Please select at least 1 Voter');
    //   return;
    // } else {
    let obj = {
      "headerId": 0,
      "userId": this.areaAgentIdABL,
      "constituencyId": 0,
      "boothId": this.getBoothId,
      "clientId": parseInt(this.localStorageData?.ClientId),
      "createdBy": this.commonService.loggedInUserId(),
      "uservoterlists": this.uservoterListArray
    }
    this.spinner.show();
    this.callAPIService.setHttp('POST', 'ClientMasterApp/BoothCommittee/AssignVotersToCommitteeMember', false, obj, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        this.getCommitteMemberTypewise();
        this.boothCMlist.nativeElement.click();
        this.uservoterListArray = [];
      } else {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
    // }
  }

  //............................................  Booth Committee Member List Model Code End Here ...................................//
  //-------------------------------  Send Lind for Login Credential Code Start Here  -------------------------------------
  sendDownloadLink(mobileNo: any) {
    this.callAPIService.setHttp('get', 'Send_App_Download_link?mobileno=' + mobileNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.toastrService.success(res.data1);
      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
}

// onChange_Assembly_VillageArray  ==>>  1 is Village & 2 is Assembly

