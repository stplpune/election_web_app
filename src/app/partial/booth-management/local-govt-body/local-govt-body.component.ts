import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-local-govt-body',
  templateUrl: './local-govt-body.component.html',
  styleUrls: ['./local-govt-body.component.css']
})
export class LocalGovtBodyComponent implements OnInit {

  filterForm!:FormGroup;
  localGovBodyForm!:FormGroup;
  stateArray: any;
  divisionGovtArray :any;
  divisionFilterArray :any;
  districtGovtArray :any;
  districtFilterArray :any;
  talukaGovtArray :any;
  talukaFilterArray :any;
  villageCityFilterArray :any;
  localBodyListArray :any;
  categoryArray :any;
  getTotal: any;
  paginationNo: number = 1; 
  pageSize: number = 10; 
  villageTalukaDetailsList :any;
  resultVillageOrCity :any;
  userId = this.commonService.loggedInUserId();
  urbanRuralTypeArray = [{ id: 0, name: 'Rural' }, { id: 1, name: 'Urban' }]
  villageCityGovtArray: any;
  cityFilterArray: any;
  cityGovtArray: any;
  subject: Subject<any> = new Subject();
  villageGovtObj = '';
  submitted:boolean = false;
  editObjData:any;


  constructor(
    private callAPIService: CallAPIService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private tosterService:ToastrService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getState();
    this.getCategory();
    this.defaultFilterForm();
    this.localGovBody_Form();
    this.searchData();
  }

    // ....................local GovBody Form Code Start Here ....................... //
  
    get g(){ return this.localGovBodyForm.controls };

    localGovBody_Form(){
      this.localGovBodyForm = this.fb.group({
        id:[0],
        constituencyName:['',[Validators.required]],
        isRural:[0],
        stateId: ['',[Validators.required]],
        divisionId: ['',[Validators.required]],
        districtId: ['',[Validators.required]],
        talukaId: [''],
        village_CityId: [''],
        categoryId:['',[Validators.required]],
      });
      this.addRemoveTalukaVali();
    }

    selectionType(flag?:any){
      this.clearLGBFilterForm('state');
      this.villageCityGovtArray = [];
      this.constituencyComityModelArray = [];
      this.getState('govt');
      this.addRemoveTalukaVali();
    }

    onClickCheckBox(event: any, eleObj: any) {
        this.villageCityGovtArray.map((ele:any)=>{
          if(eleObj?.villageId == ele?.villageId){
             ele['checked'] = event.target.checked;
             return ele;
          }
        })
        this.onClickUpdateComityModel();
    }

  districtSelect(flag: any) {
    flag == 'govt' ? this.g['isRural'].value != 1 ? this.getTaluka('govt') : this.getVillageCity('govt') :
      this.f['isRural'].value != 1 ? this.getTaluka('filter') : this.getVillageCity('filter');
  }

    constituencyComityModelArray:any[] = [];
    onClickUpdateComityModel() { // push checked obj in new Array 
      this.constituencyComityModelArray = [];
      let formData = this.localGovBodyForm.value;
      this.villageCityGovtArray.map((ele:any)=>{
        let obj = {
          "id": 0,
          "committeeConstituencyId": 0,
          "stateId": formData.stateId,
          "divisionId": formData.divisionId || 0,
          "districtId": formData.districtId || 0,
          "talukaId": formData.talukaId || 0,
          "villageId": ele.villageId || 0,
          "isTown": formData.isRural == 0 ? false : true,
          "createdBy": this.userId
        }
        if(ele?.checked == true) {
          this.constituencyComityModelArray.push(obj);
        }
      })
    }

    onSubmit(){
      this.submitted = true;
      if (this.localGovBodyForm.invalid) {
        this.spinner.hide();
        return;
      } if(!this.villageCityGovtArray?.some((ele: any) => { return ele.checked === true })){
        this.tosterService.error('Village / City Feild is Requird');
        return;
      } else {
        this.spinner.show();
        let formData = this.localGovBodyForm.value;
        let obj = {
          "id": formData.id,
          "constituencyName": formData.constituencyName,
          "typeId": formData.categoryId,
          "isRural": formData.isRural,
          "createdBy": this.userId,
          "constituencyCommitteeModelList": this.constituencyComityModelArray
        }

        let urlType = formData.id == 0 ? 'Constituency/ConstituenctCommittee/Create' : 'Constituency/ConstituenctCommittee/Update';
        let apiType = formData.id == 0 ? 'POST' : 'PUT';
        
        this.callAPIService.setHttp(apiType, urlType, false, obj, false, 'electionMicroSerApp');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.responseData != null && res.statusCode == "200") {
            this.spinner.hide();
            this.tosterService.success(res.statusMessage);
            this.getConstituencymastercommittee();
            this.clearForm();
            this.submitted = false;
          } else {
            this.spinner.hide();
            this.tosterService.error(res.statusMessage);
          }
        }, (error: any) => {
          this.spinner.hide();
          this.router.navigate(['../500'], { relativeTo: this.route });
        })
      }
    }

    clearForm(){
      this.submitted = false;
      this.villageCityGovtArray = [];
      this.editObjData = '';
      this.constituencyComityModelArray = [];
      this.localGovBody_Form();
      this.getState('govt');
    }

    patchFormData(obj:any){
      this.editObjData = obj;
      this.localGovBodyForm.patchValue({
        id: obj?.id,
        constituencyName: obj?.constituencyName,
        isRural: obj?.isRural,
        stateId: obj?.getAssignVillagestoConstituencyCommitteeList[0]?.stateId,
        divisionId: obj?.getAssignVillagestoConstituencyCommitteeList[0]?.divisionId,
        districtId: obj?.getAssignVillagestoConstituencyCommitteeList[0]?.districtId,
        talukaId: obj?.getAssignVillagestoConstituencyCommitteeList[0]?.talukaId,
        categoryId: obj?.typeId,
      })
      this.addRemoveTalukaVali();
      this.getDistrict('govt');
      this.getTaluka('govt');
      this.getVillageCity('govt', obj);
    }

    addRemoveTalukaVali() {
      if (this.g['isRural'].value == 0) {
        this.g["talukaId"].setValidators([Validators.required]);
        this.g["talukaId"].updateValueAndValidity();
      } else {
        this.g['talukaId'].setValue('');
        this.g['talukaId'].clearValidators();
        this.g['talukaId'].updateValueAndValidity();
      }
    }

    clearLGBFilterForm(flag?: any){
      if (flag == 'state') {
        this.g['divisionId'].setValue('');
        this.g['districtId'].setValue('');
        this.g['talukaId'].setValue('');
        this.g['village_CityId'].setValue('');
      } else if (flag == 'division') {
        this.g['districtId'].setValue('');
        this.g['talukaId'].setValue('');
        this.g['village_CityId'].setValue('');
      } else if (flag == 'district') {
        this.g['talukaId'].setValue('');
        this.g['village_CityId'].setValue('');
      } else if (flag == 'taluka') {
        this.g['village_CityId'].setValue('');
      }
    }

        // ....................local GovBody Form Code End Here ....................... //

        // ....................Filter Form Code Start Here ....................... //


  get f(){ return this.filterForm.controls };
  defaultFilterForm() {
    this.filterForm = this.fb.group({
      stateId: [''],
      isRural:[0], 
      divisionId: [''],
      districtId: [''],
      talukaId: [''],
      villageId: [''],
      categoryId:[''],
      SearchText:['']
    })
  }

  getState(flag?:any) {
    this.callAPIService.setHttp('get', 'Filter/GetAllState?UserId=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.stateArray = res.responseData;
        this.stateArray?.length == 1 ? (this.f['stateId'].setValue(this.stateArray[0]?.id),this.g['stateId'].setValue(this.stateArray[0]?.id), this.getDivision('filter'),this.getDivision('govt')) : '';
        flag == 'govt' ? '' : this.getConstituencymastercommittee();
      } else {
        this.stateArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDivision(flag?:any) { 
    let obj =  (flag == 'filter' ? this.f['stateId'].value :  this.g['stateId'].value);
    this.callAPIService.setHttp('get', 'Filter/GetAllDivision?UserId=' + this.userId + '&stateId=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        (flag == 'filter') ? (this.divisionFilterArray = res.responseData) : (this.divisionGovtArray = res.responseData);
        // this.divisionGovtArray?.length == 1 ? (this.f['divisionId'].setValue(this.divisionGovtArray[0]?.divisionId), this.getDistrict()) : '';
      } else {
        flag == 'filter' ? this.divisionFilterArray = [] : this.divisionGovtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDistrict(flag?:any) { 
    let obj = flag == 'filter' ? (this.f['stateId'].value + '&divisionId=' + this.f['divisionId'].value) :  (this.g['stateId'].value + '&divisionId=' + this.g['divisionId'].value);
    this.callAPIService.setHttp('get', 'Filter/GetAllDistricts?UserId=' + this.userId + '&stateId=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        (flag == 'filter') ? (this.districtFilterArray = res.responseData) : (this.districtGovtArray = res.responseData);
        // this.districtGovtArray?.length == 1 ? (this.f['districtId'].setValue(this.districtGovtArray[0]?.districtId), this.getTaluka()) : '';  
        // this.getTaluka();
      } else {
        flag == 'filter' ? (this.districtFilterArray = []) : (this.districtGovtArray = []);
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getTaluka(flag?:any) {
    let obj = (flag == 'filter' ? this.f['districtId'].value : this.g['districtId'].value);
    this.callAPIService.setHttp('get', 'Filter/GetAllTaluka?UserId=' + this.userId + '&districtId=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        flag == 'filter' ? (this.talukaFilterArray = res.responseData) : (this.talukaGovtArray = res.responseData);
        // this.talukaGovtArray?.length == 1 ? (this.f['talukaId'].setValue(this.talukaGovtArray[0]?.talukaId), this.getVillageCity()) : '';
      } else {
        flag == 'filter' ? this.talukaFilterArray = [] : this.talukaGovtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getVillageCity(flag?:any,editObj?:any) { // vilage & City Api
    let obj = (flag == 'filter' ? (this.f['talukaId'].value || 0) + '&DistrictId=' + this.f['districtId'].value + '&Istown=' + this.f['isRural'].value : (this.g['talukaId'].value || 0) + '&Istown=' + this.g['isRural'].value + '&DistrictId=' + this.g['districtId'].value);
    this.callAPIService.setHttp('get', 'Filter/GetVillageList?TalukaId=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        flag == 'filter' ? (this.villageCityFilterArray = res.responseData) : (this.villageCityGovtArray = res.responseData?.map((ele:any)=>{ele['checked'] = false; return ele}));
        
        if(editObj && flag == 'govt'){
          editObj?.getAssignVillagestoConstituencyCommitteeList?.map((ele:any)=>{
            res.responseData.map((ele1:any)=>{
              if(ele?.villageId == ele1?.villageId){ ele1['checked'] = true; return ele1;}
            })
          });
          this.onClickUpdateComityModel(); // old object assign to constituencyComityModelArray
        }
        // this.villageFilterArray?.length == 1 ? this.f['villageId'].setValue(this.villageFilterArray[0]?.villageId) : '';
      } else {
        flag == 'filter' ? this.villageCityFilterArray = [] : this.villageCityGovtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  // getCity(flag: any) {
  //   let obj = (flag == 'filter' ? this.f['districtId'].value : this.g['districtId'].value);
  //   this.callAPIService.setHttp('get', 'Web_GetCity_1_0?DistrictId=' + obj, false, false, false, 'electionServiceForWeb');
  //   this.callAPIService.getHttp().subscribe((res: any) => {
  //     if (res.data == '0') {
  //       flag == 'filter' ? (this.cityFilterArray = res.data1) : (this.cityGovtArray = res.data1);
  //     } else {
  //       flag == 'filter' ? this.cityFilterArray = []: this.cityGovtArray = [];
  //     }
  //   }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  // }
  
  getCategory() { 
    this.callAPIService.setHttp('get', 'Constituency/ConstituenctCommittee/GetAllConstituencyCategory', false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.categoryArray = res.responseData;
        // this.categoryArray?.length == 1 ? this.f['categoryId'].setValue(this.categoryArray[0]?.categoryId) : '';
      } else {
        this.categoryArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getConstituencymastercommittee() {  // Main Api For Table
    this.spinner.show();
    let obj = 'pageNo=' + this.paginationNo + '&pageSize=' + this.pageSize + '&StateId=' + (this.f['stateId'].value || 0) + '&DivisionId=' + (this.f['divisionId'].value || 0) + '&DistrictId='+ (this.f['districtId'].value || 0) +'&TalukaId=' + (this.f['talukaId'].value || 0) + '&CategoryId=' + (this.f['categoryId'].value || 0) +
     '&Search=' + (this.f['SearchText'].value || '') + '&IsRural=' + (this.f['isRural'].value || 0) + '&VillageId=' + (this.f['villageId'].value || 0);
    this.callAPIService.setHttp('get', 'Constituency/ConstituenctCommittee/GetAll?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.localBodyListArray = res.responseData;
        this.getTotal = res.responseData1.totalPages * this.pageSize;
      } else {
        this.spinner.hide();
        this.localBodyListArray = [];
      }
    }, (error: any) => { this.spinner.hide(); this.router.navigate(['../500'], { relativeTo: this.route }) })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getConstituencymastercommittee();
    this.clearForm();
  }

  onKeyUpSearchData() { this.subject.next()}

  searchData() {
    this.subject.pipe(debounceTime(700)).subscribe(() => {
        this.filterForm.value.SearchText
        this.paginationNo = 1;
        this.getConstituencymastercommittee();
      });
  }

  showVillageTalukaList(data?:any){
    this.villageTalukaDetailsList = data;
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
      // this.f['categoryId'].setValue('');
    } else if (flag == 'district') {
      this.f['talukaId'].setValue('');
      this.f['villageId'].setValue('');
      // this.f['categoryId'].setValue('');
    } else if (flag == 'taluka') {
      this.f['villageId'].setValue('');
      // this.f['categoryId'].setValue('');
    } else if (flag == 'village') {
      // this.f['categoryId'].setValue('');
    } else if (flag == 'search') {
      this.f['SearchText'].setValue('');
    } else if( flag == 'isRural'){
      this.f['isRural'].setValue(0);
      this.f['villageId'].setValue('');
    }
    this.getConstituencymastercommittee();
  }

          // ....................Filter Form Code End Here ....................... //

            //.......................................  Delete Supervisor Code End Here .................................//

  deleteConfirmModel(delId:any) {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteTableData(delId);
      }
    });
  }

  deleteTableData(delId:any) {
    let obj = {
      "id": delId,
      "deletedBy": this.userId
    }
    this.callAPIService.setHttp('DELETE', 'Constituency/ConstituenctCommittee/Delete', false, obj, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.tosterService.success(res.statusMessage); 
        this.clearForm();
        this.getConstituencymastercommittee();
      } else {
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......................................  Delete Supervisor Code End Here .................................//

}
