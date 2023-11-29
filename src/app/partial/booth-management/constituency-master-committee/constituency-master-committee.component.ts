import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { log } from 'console';

@Component({
  selector: 'app-constituency-master-committee',
  templateUrl: './constituency-master-committee.component.html',
  styleUrls: ['./constituency-master-committee.component.css'],
})
export class ConstituencyMasterCommitteeComponent implements OnInit {
  filterForm!: FormGroup;
  localGovBodyForm!: FormGroup;
  stateArray: any;
  divisionGovtArray: any;
  divisionFilterArray: any;
  districtGovtArray: any;
  districtFilterArray: any;
  talukaGovtArray: any;
  talukaFilterArray: any;
  villageCityFilterArray: any;
  localBodyListArray: any;
  categoryArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  villageTalukaDetailsList: any;
  resultVillageOrCity: any;
  userId = this.commonService.loggedInUserId();
  localStorageData = this.commonService.getlocalStorageData();
  urbanRuralTypeArray = [
    { id: 0, name: 'Rural' },
    { id: 1, name: 'Urban' },
  ];
  villageCityGovtArray: any;
  cityFilterArray: any;
  cityGovtArray: any;
  subject: Subject<any> = new Subject();
  villageGovtObj = '';
  submitted: boolean = false;
  editObjData: any;
  assemblyArray = new Array();
  boothArray = new Array();
  boothUnderConstituencyArr: any[] = [];
  boothlistDisplay: any[] = [];
  searchBooths = '';
  talkaArray: any;

  constructor(
    private callAPIService: CallAPIService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private tosterService: ToastrService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getCategory();
    this.defaultFilterForm();
    this.localGovBody_Form();
    this.getAssemblyConstituency();
    this.searchData();
    this.getConstituencymastercommittee();
  }

  // ....................local GovBody Form Code Start Here ....................... //

  get g() {
    return this.localGovBodyForm.controls;
  }

  localGovBody_Form() {
    this.localGovBodyForm = this.fb.group({
      id: [0],
      constituencyName: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      assemblyId: ['', [Validators.required]],
      talukaId: ['', [Validators.required]],
      booth: ['']
    });
  }

  selectionType(flag?: any) {
    this.constituencyComityModelArray = [];
  }

  constituencyComityModelArray: any[] = [];
  onClickCheckBox1(event?: any, data?: any) {
    this.boothArray.map((ele: any) => {
      if (data.boothId == ele.boothId) {
        ele['checked'] = event.target.checked;
        return ele;
      }
    })
    this.updateTestMethod();
  }

  updateTestMethod() {
    this.constituencyComityModelArray = [];
    this.boothArray.map((ele1: any) => {
      if (ele1.checked == true) {
        this.constituencyComityModelArray.push(ele1)
      }
    })
  }

  clearBoothArray() {
    this.boothArray = [];
  }

  patchFormData(obj: any) {  
    this.editObjData = obj;
    this.localGovBodyForm.patchValue({
      id: obj?.id,
      constituencyName: obj?.constituencyName,
      categoryId: obj?.typeId,
      // talukaId: obj?.talukaId,
      assemblyId: obj?.getAssignBoothstoConstituencyCommitteeModel[0]?.assemblyId,
    });
    setTimeout(() => {this.g['talukaId'].setValue(obj?.talukaId);}, 100);
    this.getTaluka();

    this.editObjData?.getAssignBoothstoConstituencyCommitteeModel?.length
      ? this.getBoothsUnderAssemblies(this.editObjData?.getAssignBoothstoConstituencyCommitteeModel) : this.boothArray = [];
  }

  onSubmit() {
    this.submitted = true;
    if (this.localGovBodyForm.invalid) {
      this.spinner.hide();
      return;
    } else if (!this.constituencyComityModelArray?.length) {
      this.tosterService.error('Please Select at least One Booth');
      return;
    }
    else {
      this.spinner.show();
      let formData = this.localGovBodyForm.value;

      let constituencyComityArray:any[] = [];
      constituencyComityArray = this.constituencyComityModelArray.map((ele:any)=>{
        let data = {
          "id": 0,
          "committeeConstituencyId": 0,
          "assemblyId": this.localGovBodyForm.value.assemblyId,
          "boothId": ele.boothId
        }
        return data;
      })

      let obj = {
        id: formData?.id || this.editObjData?.id,
        constituencyName: formData.constituencyName || this.editObjData?.constituencyName,
        typeId: formData.categoryId || this.editObjData?.typeId,
        talukaId: formData.talukaId,
        createdBy: this.userId,
        boothstoConstituencyCommitteeModelList: constituencyComityArray,
      };

      let urlType = formData.id == 0 ? 'Constituency/ConstituenctCommittee/Create_1_0' : 'Constituency/ConstituenctCommittee/Update_1_0';
      let apiType = formData.id == 0 ? 'POST' : 'PUT';

      this.callAPIService.setHttp(apiType, urlType, false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe(
        (res: any) => {
          if (res.responseData != null && res.statusCode == '200') {
            this.spinner.hide();
            this.tosterService.success(res.statusMessage);
            this.getConstituencymastercommittee();
            this.clearForm();
            this.submitted = false;
          } else {
            this.spinner.hide();
            this.tosterService.error(res.statusMessage);
          }
        },
        (error: any) => {
          this.spinner.hide();
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      );
    }
  }

  displayBoothsAssiged(boothArr?: any) {
    for (let index = 0; index < boothArr.length; index++) {
      this.boothlistDisplay.push(boothArr[index].boothName);
    }
  }

  clearForm() {
    this.submitted = false;
    this.villageCityGovtArray = [];
    this.editObjData = '';
    this.boothArray = [];
    this.constituencyComityModelArray = [];
    this.localGovBody_Form();
    this.editObjData = '';
  }

  // ....................local GovBody Form Code End Here ....................... //

  // ....................Filter Form Code Start Here ....................... //

  get f() {
    return this.filterForm.controls;
  }
  defaultFilterForm() {
    this.filterForm = this.fb.group({
      categoryId: [''],
      assemblyId: [''],
      SearchText: [''],
    });
  }

  getCategory() {
    // Api for Category
    this.callAPIService.setHttp('get', 'Constituency/ConstituenctCommittee/GetAllConstituencyCategory', false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.categoryArray = res.responseData;
        } else {
          this.categoryArray = [];
        }
      },
      (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      }
    );
  }

  getAssemblyConstituency() {
    // Api for Assembly Consituceny
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=2';
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/BoothCommitteeFormation_Map_ConsituencyDropdown?UserId=' +
      this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.assemblyArray = res.responseData;
        } else {
          this.assemblyArray = [];
        }
      },
      (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      }
    );
  }

  getTaluka() {
    this.callAPIService.setHttp('get', 'Filter/GetTalukalist_From_Assembly?AssemblyId=' + (this.localGovBodyForm.value.assemblyId || 0), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.talkaArray = res.responseData;
        // this.talkaArray?.length == 1 ? (this.f['TalukaId'].setValue(this.talkaArray[0]?.talukaId), this.getVillage()) : '';
      } else {
        this.talkaArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getBoothsUnderAssemblies(updateData?: any) {
    this.constituencyComityModelArray = [];
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Web_GetBoothList_Boothcommittee_with_PoliticalUnit?UserId=' +
      this.userId + '&ConstituencyId=' + (this.localGovBodyForm.value.assemblyId || 0), false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.boothArray = res.responseData;
          if (updateData) {
            this.boothArray?.map((boothele: any) => {
              updateData.map((ele: any) => {
                ele.boothId == boothele.boothId ? (boothele['checked'] = true, this.constituencyComityModelArray.push(boothele)) : '';
              });
            });
          }
        } else {
          this.boothArray = [];
        }
      },
      (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      }
    );
  }

  getConstituencymastercommittee() {
    // Main Api For Table
    this.spinner.show();
    let obj = 'pageNo=' + this.paginationNo + '&pageSize=' + this.pageSize + '&AssemblyId=' + (this.filterForm?.value?.assemblyId || 0) +
      '&CategoryId=' + (this.f['categoryId'].value || 0) + '&Search=' + (this.f['SearchText'].value || '');
    this.callAPIService.setHttp('get', 'Constituency/ConstituenctCommittee/GetAll_1_0?' + obj,
      false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.spinner.hide();
          this.localBodyListArray = res.responseData;
          this.getTotal = res.responseData1.totalPages * this.pageSize;
        } else {
          this.spinner.hide();
          this.localBodyListArray = [];
        }
      },
      (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    );
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getConstituencymastercommittee();
    this.clearForm();
  }

  onKeyUpSearchData() {
    this.subject.next();
  }

  searchData() {
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.filterForm.value.SearchText;
      this.paginationNo = 1;
      this.getConstituencymastercommittee();
    });
  }

  showVillageTalukaList(data?: any) {
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
    } else if (flag == 'isRural') {
      this.f['isRural'].setValue(2);
      this.f['villageId'].setValue('');
    }
    this.getConstituencymastercommittee();
  }

  // ....................Filter Form Code End Here ....................... //

  //.......................................  Delete Supervisor Code End Here .................................//

  deleteConfirmModel(delId: any) {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'Yes') {
        this.deleteTableData(delId);
      }
    });
  }

  deleteTableData(delId: any) {
    let obj = {
      id: delId,
      deletedBy: this.userId,
    };
    this.callAPIService.setHttp('DELETE', 'Constituency/ConstituenctCommittee/Delete_1_0', false, obj, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.statusCode == '200') {
          this.tosterService.success(res.statusMessage);
          this.clearForm();
          this.getConstituencymastercommittee();
        } else { }
      },
      (error: any) => {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    );
  }
}
