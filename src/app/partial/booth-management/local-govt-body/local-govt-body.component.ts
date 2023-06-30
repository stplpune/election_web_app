import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-local-govt-body',
  templateUrl: './local-govt-body.component.html',
  styleUrls: ['./local-govt-body.component.css']
})
export class LocalGovtBodyComponent implements OnInit {

  userId:any;
  filterForm!:FormGroup;
  mainForm!:FormGroup;
  stateArray = new Array();
  stateArray_m = new Array();
  divisionArray = new Array();
  divisionArray_m = new Array();
  districtArray = new Array();
  districtArray_m = new Array();
  talkaArray = new Array();
  talkaArray_m = new Array();
  villageArray = new Array();
  localBodyListArray = new Array();
  categoryArray = new Array();
  categoryArray_m = new Array();
  paginationNo:any = 1;
  villageTalukaDetailsList = new Array();
  resultVillageOrCity = new Array();
  urbanRuralFlag:boolean = false;
  urbanRuralTypeArray:any[] = [{id:0,name:'Rural'},{id:1,name:'Urban'}]
  get f(){ return this.filterForm.controls };
  get f_m(){ return this.mainForm.controls };
  constructor(
    private callAPIService: CallAPIService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.userId = this.commonService.loggedInUserId();
    this.getState();
    this.getCategory();
    this.defaultFilterForm();
    this.controlForm();
    this.getCommitteMemberTypewise();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      stateId: [''],
      divisionId: [''],
      districtId: [''],
      talukaId: [''],
      villageId: [''],
      categoryId:[''],
      SearchText:['']
    })
  }

  // ACCESS FORM-CONTROL VALUES USING FORM-GROUP
  controlForm(){
    this.mainForm = this.fb.group({
      constituencyName:[''],
      isRural:[0],
      stateId: [''],
      divisionId: [''],
      districtId: [''],
      talukaId: [''],
      villageId: [''],
      categoryId:[''],
    })
  }

  selType(isRuralUrbanId?:any){
    if(isRuralUrbanId == 1){
      this.urbanRuralFlag = true;
      this.f_m['stateId'].setValue('');
      this.f_m['divisionId'].setValue('');
      this.f_m['districtId'].setValue('');
    }else{
      this.f_m['stateId'].setValue('');
      this.f_m['divisionId'].setValue('');
      this.f_m['districtId'].setValue('');
      this.f_m['talukaId'].setValue('');
      this.f_m['villageId'].setValue('');
    }
  }

  getState() {
    this.callAPIService.setHttp('get', 'Filter/GetAllState?UserId=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.stateArray = res.responseData;
        this.stateArray_m = res.responseData;
        // this.stateArray?.length == 1 ? (this.f['stateId'].setValue(this.stateArray[0]?.id), this.getDivision()) : '';
      } else {
        this.stateArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDivision(flag?:any) {
    this.callAPIService.setHttp('get', 'Filter/GetAllDivision?stateId=' + ((this.f['stateId'].value) || (this.f_m['stateId'].value)) + '&UserId=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        (flag == 'state_m') ? (this.divisionArray_m = res.responseData) : (this.divisionArray = res.responseData);
        // this.divisionArray?.length == 1 ? (this.f['divisionId'].setValue(this.divisionArray[0]?.divisionId), this.getDistrict()) : '';
      } else {
        this.divisionArray = [];
        this.divisionArray_m = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDistrict(flag?:any) {
    this.callAPIService.setHttp('get', 'Filter/GetAllDistricts?UserId=' + this.userId + '&stateId=' + ((this.f['stateId'].value) || (this.f_m['stateId'].value)) + '&divisionId=' + (this.f['divisionId'].value || (this.f_m['divisionId'].value)), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        (flag == 'division_m') ? (this.districtArray_m = res.responseData) : (this.districtArray = res.responseData);
        // this.districtArray?.length == 1 ? (this.f['districtId'].setValue(this.districtArray[0]?.districtId), this.getTaluka()) : '';
        // this.getTaluka();
      } else {
        (flag == 'division_m') ? (this.districtArray_m = []) : (this.districtArray = []);
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getTaluka(flag?:any) {
    this.callAPIService.setHttp('get', 'Filter/GetAllTaluka?districtId=' + (this.f['districtId'].value || (this.f_m['districtId'].value)) + '&UserId=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        (flag == 'district_m') ? (this.talkaArray_m = res.responseData) : (this.talkaArray = res.responseData);
        // this.talkaArray?.length == 1 ? (this.f['talukaId'].setValue(this.talkaArray[0]?.talukaId), this.getVillage()) : '';
      } else {
        this.talkaArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getVillage(flag?:any) {
    this.callAPIService.setHttp('get', 'Filter/GetAllVillages?talukaId=' + (this.f['talukaId'].value || 0) + '&UserId=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.villageArray = res.responseData;
        console.log(this.villageArray);
        
        // this.villageArray?.length == 1 ? this.f['villageId'].setValue(this.villageArray[0]?.villageId) : '';
      } else {
        this.villageArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }
  
  getCategory() {
    this.callAPIService.setHttp('get', 'api/Constituencymastercommittee/GetAllConstituencyCategory', false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.categoryArray = res.responseData;
        this.categoryArray_m = res.responseData;
        // this.categoryArray?.length == 1 ? this.f['categoryId'].setValue(this.categoryArray[0]?.categoryId) : '';
      } else {
        this.categoryArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getVillageOrCity(talukaDisID: any, selType: any) {
    alert('ss')
    console.log(talukaDisID,selType);
    
     let appendString = "";
     (selType == 'taluka' && this.mainForm.value.isRural) ? appendString = 'Web_GetVillage_1_0?talukaid=' + talukaDisID : appendString = 'Web_GetCity_1_0?DistrictId=' + talukaDisID;
     this.callAPIService.setHttp('get', appendString, false, false, false, 'electionServiceForWeb');
     this.callAPIService.getHttp().subscribe((res: any) => {
       if (res.data == '0') {
         this.resultVillageOrCity = res.data1;
         console.log(this.resultVillageOrCity);
       } else {
        this.resultVillageOrCity = []
       }
     }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
   }


  getCommitteMemberTypewise() {  // Main Api For Table
    this.spinner.show();
    // api/Constituencymastercommittee/GetAll?pageNo=1&pageSize=10&StateId=1&DivisionId=1&DistrictId=1&TalukaId=1&CategoryId=1&Search=ewde
    let extendedUrl = '?pageNo=1&pageSize=10&StateId=' + (this.f['stateId'].value || 0) + '&DivisionId=' + (this.f['divisionId'].value || 0) + '&DistrictId='+ (this.f['districtId'].value || 0) +'&TalukaId=' + (this.f['talukaId'].value || 0) + '&CategoryId=' + (this.f['categoryId'].value || 0) + '&Search=' + (this.f['SearchText'].value || '') 
    this.callAPIService.setHttp('get', 'api/Constituencymastercommittee/GetAll' + extendedUrl, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.localBodyListArray = res.responseData;
        // this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
        // this.getTotalPages = res.responseData.responseData2.totalPages;
      } else {
        this.spinner.hide();
        this.localBodyListArray = [];
      }
    }, (error: any) => { this.spinner.hide(); this.router.navigate(['../500'], { relativeTo: this.route }) })
  }

  showVillageTalukaList(data?:any){
    this.villageTalukaDetailsList = data;
  }

  onClickType(val?:any){
    console.log(val,'radio Value');
    
  }

  clearFilter(flag?: any) {     
    if (flag == 'state') {
      this.f['divisionId'].setValue('');
      this.f['districtId'].setValue('');
      this.f['talukaId'].setValue('');
      this.f['villageId'].setValue('');
      this.f['categoryId'].setValue('');
    } else if (flag == 'division') {
      this.f['districtId'].setValue('');
      this.f['talukaId'].setValue('');
      this.f['villageId'].setValue('');
      this.f['categoryId'].setValue('');
    } else if (flag == 'district') {
      this.f['talukaId'].setValue('');
      this.f['villageId'].setValue('');
      this.f['categoryId'].setValue('');
    } else if (flag == 'taluka') {
      this.f['villageId'].setValue('');
      this.f['categoryId'].setValue('');
    } else if (flag == 'village') {
      this.f['categoryId'].setValue('');
    }
  }

  clearFilter_m(flag?: any){
    if (flag == 'state_m') {
      this.f_m['divisionId'].setValue('');
      this.f_m['districtId'].setValue('');
      this.f_m['talukaId'].setValue('');
      this.f_m['villageId'].setValue('');
      this.f_m['categoryId'].setValue('');
    } else if (flag == 'division_m') {
      this.f_m['districtId'].setValue('');
      this.f_m['talukaId'].setValue('');
      this.f_m['villageId'].setValue('');
      this.f_m['categoryId'].setValue('');
    } else if (flag == 'district_m') {
      this.f_m['talukaId'].setValue('');
      this.f_m['villageId'].setValue('');
      this.f_m['categoryId'].setValue('');
    }
    
  }

}
