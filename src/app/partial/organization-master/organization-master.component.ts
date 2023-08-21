import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../dialogs/delete/delete.component';
import { AddDesignationComponent } from '../dialogs/add-designation/add-designation.component';

@Component({
  selector: 'app-organization-master',
  templateUrl: './organization-master.component.html',
  styleUrls: ['./organization-master.component.css']
})
export class OrganizationMasterComponent implements OnInit {

  allDistrict: any;
  allDivision: any;
  getTalkaByDistrict: any;
  orgMasterForm!: FormGroup;
  AddDesignationForm!: FormGroup;
  filterForm!: FormGroup;
  categoryArray = [{ id: 1, name: "Rural" }, { id: 0, name: "Urban" }];
  IsMultiple = [{ id: 1, name: "Yes" }, { id: 0, name: "No" }];
  allotedDesignationArray = [{ id: 0, name: "All" }, { id: 2, name: "No" }, { id: 5, name: "1 To 5" }, { id: 10, name: "5 To 10" }, , { id: 11, name: "Above 10" }];
  defultCategory = "Rural";
  selCityFlag: boolean = false;
  selVillageFlag: boolean = true;
  resultVillageOrCity: any;
  villageCityLabel = "Village/Town";
  allStates: any;
  globalDistrictId: any;
  globalDivisionId: any;
  allLevels: any;
  setVillOrcityName = "VillageName";
  setVillOrCityId = "VillageId";
  submitted = false;
  addDesFormSubmitted = false;
  btnText = "Create Committee";
  organizationRes: any;
  searchText: any;
  districtId: any = "";
  allowClearFlag: boolean = true;
  selEditOrganization: any;
  items: string[] = [];
  HighlightRow: any;
  resultDesignation: any;
  BodyOrgCellName: any;
  total: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  searchFilter = "";
  @ViewChild('closeModalAddDesignation') closeModalAddDesignation: any;
  //@ViewChild('openDeleteCommitteeModal') openDeleteCommitteeModal: any;
  desBodyId: any;
  allAssignedDesignations: any;
  modalDeafult = false;
  globalTalukaID: any;
  disableFlagDivi: boolean = true;
  disableFlagDist: boolean = true;
  disableFlagTal: boolean = true;
  disableFlagVill: boolean = true;
  redioBtnDisabled: boolean = true;
  addDesignation = "Assign";
  selectObj: any;
  editRadioBtnClick: any;
  subject: Subject<any> = new Subject();
  globalLevelId: any;
  allBodyAssignedDesignation: any;
  globalselLevelFlag!: string;
  editLevalFlag: any;
  deletebodyId!: number;
  heightedRow: any;
  getSessionData:any;
  getCommiteeDetails:any;
  checkUserlevel:any;
  resCommitteeByLevel:any;
  result:any;
  allDistrictByCommittee:any;
  @ViewChild('closeewCommitteeModal') closeewCommitteeModal: any;

  constructor(private callAPIService: CallAPIService, private router: Router, private fb: FormBuilder,
    private toastrService: ToastrService, public commonService: CommonService, public dialog: MatDialog,
    private spinner: NgxSpinnerService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.checkUserlevel = this.commonService.getlocalStorageData();
    this.getSessionData = this.commonService.getlocalStorageData();
    this.defultFilterForm();
    this.getOrganizationList();
    this.customForm();
    this.getLevel();
    this.searchFilters('false');
    this.getDistrictByCommittee();
    this.getCommiteeDetails = this.commonService.getCommiteeInfo();
  }

  initCommittees(){
    this.getState();
    // this.getDistrict();
    this.getDesignation();
    this.defaultDesignationForm();
  }

  defultFilterForm() {
    this.filterForm = this.fb.group({
      filterDistrict: [0],
      searchText: [''],
      AllotedDesignation: [],
      LevelId: [0],
    })
  }

  getOrganizationList() {
    this.spinner.show();
    let filterData = this.filterForm.value;
    (filterData.AllotedDesignation == null || filterData.AllotedDesignation == "") ? filterData.AllotedDesignation = 0 : filterData.AllotedDesignation = filterData.AllotedDesignation
    let data = '?UserId=' + this.commonService.loggedInUserId() + '&DistrictId=' + filterData.filterDistrict + '&Search=' + filterData.searchText + '&nopage=' + this.paginationNo + '&AllotedDesignation=' + filterData.AllotedDesignation + '&LevelId=' + filterData.LevelId;
    this.callAPIService.setHttp('get', 'Web_GetOrganizationAssignedBody_1_0_Committee' + data, false, false, false, 'electionServiceForWeb'); // old Web_GetOrganizationAssignedBody_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.organizationRes = res.data1;

        this.organizationRes.map((ele: any) => {
          if (ele.DesignationAssigned) {
            let DesigAss = ele.DesignationAssigned.split(',');
            ele.DesignationAssigned = DesigAss;
          }
        })

        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        if (res.data == 1) {
          this.organizationRes = [];
        } else {
          this.toastrService.error("Please try again something went wrong");
          this.organizationRes = [];
        }
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  customForm() {
    this.orgMasterForm = this.fb.group({
      BodyOrgCellName: ['', [Validators.required,Validators.maxLength(100)]],
      StateId: ['', Validators.required],
      DivisionId: [''],
      DistrictId: [],
      TalukaId: [''],
      VillageId: [''],
      IsRural: [1],
      BodyLevelId: ['', Validators.required],
      SubParentCommitteeId:[''],
      CreatedBy: [this.commonService.loggedInUserId()],
    })
  }

  getLevel() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetLevel_1_0_Committee?UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetLevel_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allLevels = res.data1;
        console.log(this.allLevels,'levels');
        
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // this.toastrService.error("Data is not available 1");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  selectLevel(levelId: any, flag: any) {
    this.selectLevelClear();
    console.log(levelId, flag)
    this.globalLevelId = levelId;
    if (levelId == 2) {
      this.disableFlagDivi = true;
      if (this.editLevalFlag == 'edit' && flag == 'select') { // DistrictId is availble then show city 
        this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
      }
    }else if(levelId == 7){
      this.disableFlagDivi = false;
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
    }
    else if (levelId == 3) {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("")
      this.disableFlagDivi = false;;
      this.disableFlagDist = false;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
    }
    else if (levelId == 4) {
      this.disableFlagDivi = false;
      this.disableFlagTal = false;
      this.disableFlagDist = false;
      this.disableFlagVill = true;
    }
    else if (levelId == 5) {
      this.orgMasterForm.controls["VillageId"].setValue("");
      this.disableFlagDivi = false;
      this.disableFlagTal = false;
      this.disableFlagDist = false;
      this.disableFlagVill = false;
      this.setVillOrcityName = "VillageName";
      this.setVillOrCityId = "VillageId";
      this.villageCityLabel = "Village/Town";
      if (this.editLevalFlag == 'edit' && flag == 'select') { // DistrictId is availble then show city 
        this.getTaluka(this.orgMasterForm.value.DistrictId);
      }
    }
    else if (levelId == 6) {
      this.orgMasterForm.controls["VillageId"].setValue("");
      this.disableFlagDivi = false;
      this.disableFlagDist = false;
      this.disableFlagTal = true;
      this.disableFlagVill = false;
      this.setVillOrcityName = "CityName";
      this.setVillOrCityId = "Id";
      this.villageCityLabel = "City/District";
      if (this.editLevalFlag == 'edit' && flag == 'select') { // DistrictId is availble then show city 
        this.districtEvent(this.orgMasterForm.value.BodyLevelId, this.orgMasterForm.value.DistrictId);
      }

    }
    this.validationOncondition(levelId);
  }

  validationOncondition(levelId: any) {
    //     0
    // : 
    // {Id: 2, LevelName: "State"}
    // 1
    // : 
    // {Id: 7, LevelName: "Division"}
    // 2
    // : 
    // {Id: 3, LevelName: "District"}
    // 3
    // : 
    // {Id: 4, LevelName: "Taluka"}
    if (levelId == 2) {
      this.orgMasterForm.controls["StateId"].setValidators(Validators.required);
    } else if (levelId == 7) {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.orgMasterForm.controls["StateId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DivisionId"].setValidators(Validators.required);
    } else if (levelId == 3) {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.orgMasterForm.controls["StateId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DivisionId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DistrictId"].setValidators(Validators.required);
    } else if (levelId == 4) {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.orgMasterForm.controls["StateId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DivisionId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DistrictId"].setValidators(Validators.required);
      this.orgMasterForm.controls["TalukaId"].setValidators(Validators.required);

    } else if (levelId == 5) {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.orgMasterForm.controls["StateId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DivisionId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DistrictId"].setValidators(Validators.required);
      this.orgMasterForm.controls["TalukaId"].setValidators(Validators.required);
      this.orgMasterForm.controls["VillageId"].setValidators(Validators.required);

    } else if (levelId == 6) {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.orgMasterForm.controls["StateId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DivisionId"].setValidators(Validators.required);
      this.orgMasterForm.controls["DistrictId"].setValidators(Validators.required);
      this.orgMasterForm.controls["VillageId"].setValidators(Validators.required);
    }
    this.updateValueAndValidityMF(levelId);
  }

  setDefaultState(){
    this.orgMasterForm.controls['StateId'].setValue(1);
  }

  clearselOption(flag: any) { // on click select option close icon
    if(flag == 'committeeName'){
      this.disableFlagDivi = true;
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
      this.orgMasterForm.controls["StateId"].setValue("");
      this.orgMasterForm.controls["DivisionId"].setValue("");
      this.orgMasterForm.controls["DistrictId"].setValue("");
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
    } else if (flag == 'State') {
      this.disableFlagDivi = true;
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
      this.orgMasterForm.controls["StateId"].setValue("");
      this.orgMasterForm.controls["DivisionId"].setValue("");
      this.orgMasterForm.controls["DistrictId"].setValue("");
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
    }else if (flag == 'Division') {
      // this.disableFlagDivi = true;
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
      // this.orgMasterForm.controls["DivisionId"].setValue("");
      this.orgMasterForm.controls["DistrictId"].setValue("");
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
      // this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
    }else if (flag == 'District') {
      // this.disableFlagDivi = true;
      // this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
      // this.orgMasterForm.controls["DistrictId"].setValue("");
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
      // this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
    } else if (flag == 'Taluka') {
      // this.disableFlagDist = true;
      // this.disableFlagTal = true;
      this.disableFlagVill = false;
      // this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
      // this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
    } else if (flag == 'Village') {
      this.orgMasterForm.controls["VillageId"].setValidators(Validators.required);
      this.orgMasterForm.controls["VillageId"].setValue("");
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
    }else if (flag == 'SubParentCommitteeId') {
      this.orgMasterForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
    }
    // this.updateValueAndValidityMF(globalLevelId)
  }

  updateValueAndValidityMF(levelId: any) {
    if (levelId == 2) {
      this.orgMasterForm.controls["StateId"].updateValueAndValidity();
    } else if (levelId == 7) {
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.orgMasterForm.controls["StateId"].updateValueAndValidity();
      this.orgMasterForm.controls["DivisionId"].updateValueAndValidity();
    } else if (levelId == 3) {
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.orgMasterForm.controls["StateId"].updateValueAndValidity();
      this.orgMasterForm.controls["DivisionId"].updateValueAndValidity();
      this.orgMasterForm.controls["DistrictId"].updateValueAndValidity();
    } else if (levelId == 4) {
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.orgMasterForm.controls["StateId"].updateValueAndValidity();
      this.orgMasterForm.controls["DivisionId"].updateValueAndValidity();
      this.orgMasterForm.controls["DistrictId"].updateValueAndValidity();
      this.orgMasterForm.controls["TalukaId"].updateValueAndValidity();
    } else if (levelId == 5) {
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.orgMasterForm.controls["StateId"].updateValueAndValidity();
      this.orgMasterForm.controls["DivisionId"].updateValueAndValidity();
      this.orgMasterForm.controls["DistrictId"].updateValueAndValidity();
      this.orgMasterForm.controls["TalukaId"].updateValueAndValidity();
      this.orgMasterForm.controls["VillageId"].updateValueAndValidity();
    } else if (levelId == 6) {
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.orgMasterForm.controls["StateId"].updateValueAndValidity();
      this.orgMasterForm.controls["DivisionId"].updateValueAndValidity();
      this.orgMasterForm.controls["DistrictId"].updateValueAndValidity();
      this.orgMasterForm.controls["TalukaId"].updateValueAndValidity();
      this.orgMasterForm.controls["VillageId"].updateValueAndValidity();
    }
    this.clearValidatorsMF(levelId);
  }

  clearValidatorsMF(levelId: any) {
    if (levelId == 2) {
      this.orgMasterForm.controls["DistrictId"].setValue("");
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
      this.orgMasterForm.controls['DistrictId'].clearValidators();
      this.orgMasterForm.controls["DistrictId"].updateValueAndValidity();
      this.orgMasterForm.controls['TalukaId'].clearValidators();
      this.orgMasterForm.controls["TalukaId"].updateValueAndValidity();
      this.orgMasterForm.controls['VillageId'].clearValidators();
      this.orgMasterForm.controls['VillageId'].updateValueAndValidity();
      this.orgMasterForm.controls['SubParentCommitteeId'].clearValidators();
      this.orgMasterForm.controls['SubParentCommitteeId'].updateValueAndValidity();
    } else if (levelId == 3) {
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["VillageId"].setValue("");
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
      this.orgMasterForm.controls['TalukaId'].clearValidators();
      this.orgMasterForm.controls["TalukaId"].updateValueAndValidity();
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.orgMasterForm.controls['VillageId'].clearValidators();
      this.orgMasterForm.controls['VillageId'].updateValueAndValidity();
      this.orgMasterForm.controls['SubParentCommitteeId'].updateValueAndValidity();
    } else if (levelId == 4) {
      this.orgMasterForm.controls["VillageId"].setValue("");
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
      this.orgMasterForm.controls['VillageId'].clearValidators();
      this.orgMasterForm.controls['SubParentCommitteeId'].updateValueAndValidity();
      this.orgMasterForm.controls['VillageId'].updateValueAndValidity();
      this.orgMasterForm.controls['SubParentCommitteeId'].updateValueAndValidity();
    }
    // else if (levelId == 5 || levelId == 6) {
    //   this.orgMasterForm.controls["VillageId"].setValue(null);
    //   this.orgMasterForm.controls['VillageId'].clearValidators();
    //   this.orgMasterForm.controls['VillageId'].updateValueAndValidity();
    // } 
    else if (levelId == 6) {
      this.orgMasterForm.controls["TalukaId"].setValue("");
      this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
      this.orgMasterForm.controls['TalukaId'].clearValidators();
      this.orgMasterForm.controls['SubParentCommitteeId'].updateValueAndValidity();
      this.orgMasterForm.controls["TalukaId"].updateValueAndValidity();
      this.orgMasterForm.controls["SubParentCommitteeId"].updateValueAndValidity();
    }
    //else if (levelId == 6) {
    //   this.orgMasterForm.controls["VillageId"].setValue(null);
    //   this.orgMasterForm.controls['VillageId'].clearValidators();
    //   this.orgMasterForm.controls['VillageId'].updateValueAndValidity();
    // }
  }

  selectLevelClear() {
    this.disableFlagDivi = true;
    this.disableFlagDist = true;
    this.disableFlagTal = true;
    this.disableFlagVill = true;
    this.orgMasterForm.controls["StateId"].setValue("");
    this.orgMasterForm.controls["DivisionId"].setValue("");
    this.orgMasterForm.controls["DistrictId"].setValue("");
    this.orgMasterForm.controls["TalukaId"].setValue("");
    this.orgMasterForm.controls["VillageId"].setValue("");
    this.orgMasterForm.controls["SubParentCommitteeId"].setValue("");
    this.submitted = false;
  }

  getCommitteeByLevel(bodyLevelId:any) {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetBodyOrgCellName_1_0_Parent_Committee?UserId='+this.commonService.loggedInUserId()+'&BodyLevelId='+bodyLevelId, false, false, false, 'electionServiceForWeb'); // old API Web_GetLevel_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resCommitteeByLevel = res.data1;
        if (this.btnText == "Update Committee") { // edit for city
          this.orgMasterForm.controls["SubParentCommitteeId"].setValue(this.selEditOrganization.SubParentCommitteeId)
          this.getState();
        } 
        this.spinner.hide();
      } else {
        // this.toastrService.error("Data is not available 1");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getState() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetState_1_0_Committee?UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetState_1_0 
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allStates = res.data1;
        if (this.btnText == "Update Committee") { // edit for city
          this.orgMasterForm.controls["StateId"].setValue(this.selEditOrganization.StateId)
          this.getDivision(this.selEditOrganization.StateId);
        } 
        this.spinner.hide();
      } else {
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  districtEvent(levelId: any, districtId: any) {
    if (levelId == 6) {
      this.globalDistrictId = districtId;
      this.selCity();
    }
  }

  getDivision(stateId: any) {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Sp_Web_GetDivision_1_0_Committee?StateId=' + stateId +'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetDistrict_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allDivision = res.data1;
        this.globalDivisionId = this.selEditOrganization?.DivisionId;
        this.getDistrict(this.globalDivisionId, this.selEditOrganization.StateId);
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // this.toastrService.error("Data is not available 2");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getDistrict(divisionId: any, stateId: any) {
    (this.orgMasterForm.value.BodyLevelId == 3) || (this.orgMasterForm.value.BodyLevelId == 4) ? (this.disableFlagDist = false) : this.disableFlagDist = true;
    //this.spinner.show();
    // this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0_Committee?StateId=' + 1 +'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetDistrict_1_0
    this.callAPIService.setHttp('get', 'Web_GetDistrict_2_0_Committee?DivisionId=' + divisionId + '&StateId=' + stateId +'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetDistrict_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allDistrict = res.data1;
        this.globalDistrictId = this.selEditOrganization?.DistrictId;
        if(this.btnText == "Update Committee"){
          if (this.globalLevelId == 6) { // edit for city
            this.selCity();
          } else if (this.globalLevelId == 5 || this.globalLevelId == 4) { // edit for Village
            this.getTaluka(this.globalDistrictId)
          }
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // this.toastrService.error("Data is not available 2");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getDistrictByCommittee() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0_CommitteeonMap?StateId=' + 1 +'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetDistrict_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allDistrictByCommittee = res.data1;
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // this.toastrService.error("Data is not available 2");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getTaluka(districtId: any) {
    this.orgMasterForm.value.BodyLevelId==4 ? this.disableFlagTal = false : '';
    this.globalDistrictId = districtId;
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0_Committee?DistrictId=' + districtId+'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); //old API Web_GetTaluka_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.getTalkaByDistrict = res.data1;
        if (this.btnText == "Update Committee" && this.globalLevelId == 5) { // edit for Village
          this.globalTalukaID = this.selEditOrganization.TalukaId;
          if (this.globalTalukaID != "") {
            this.orgMasterForm.patchValue({ TalukaId: this.selEditOrganization.TalukaId });
            this.selVillage();
          } else {
            this.orgMasterForm.controls["TalukaId"].setValue(null);
          }
        }
        if (this.btnText == "Update Committee" && this.globalLevelId == 4) {
          this.orgMasterForm.patchValue({ TalukaId: this.selEditOrganization.TalukaId });
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getVillageOrCity(talukaID: any, selType: any) {
    //this.spinner.show();
    let appendString = "";
    selType == 'Village/Town' ? appendString = 'Web_GetVillage_1_0_Committee?talukaid=' + talukaID+'&UserId='+this.commonService.loggedInUserId() : appendString = 'Web_GetCity_1_0_Committee?DistrictId=' + this.globalDistrictId+'&UserId='+this.commonService.loggedInUserId(); //Web_GetVillage_1_0
    this.callAPIService.setHttp('get', appendString, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resultVillageOrCity = res.data1;
        if (this.btnText == "Update Committee") { // edit
          let VillageId: any;
          (this.selEditOrganization.BodyLevel != this.orgMasterForm.value.BodyLevelId) ? VillageId = this.orgMasterForm.value.VillageId : VillageId = this.selEditOrganization.VillageId;
          this.orgMasterForm.patchValue({ VillageId: VillageId });
        }
      } else {
        this.spinner.hide();
        // //this.tothis.spinner.hide();astrService.error("Data is not available");
      }
      this.spinner.hide();
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  get f() { return this.orgMasterForm.controls };

  onSubmit() {
    this.submitted = true;
    if (this.orgMasterForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if (this.orgMasterForm.value.BodyOrgCellName.trim() == '' || this.orgMasterForm.value.BodyOrgCellName == null || this.orgMasterForm.value.BodyOrgCellName == undefined) {
      this.toastrService.error("Committee Name can not contain space only");
      this.spinner.hide();
      return;
    }
    else {
      // //this.spinner.show();
      let fromData: any = new FormData();
      this.orgMasterForm.value.BodyLevelId == 6 ? this.orgMasterForm.value.IsRural = 0 : this.orgMasterForm.value.IsRural = 1;
      this.orgMasterForm.value.VillageId = 0;

      Object.keys(this.orgMasterForm.value).forEach((cr: any, ind: any) => {
        let value = Object.values(this.orgMasterForm.value)[ind] != null ? Object.values(this.orgMasterForm.value)[ind] : 0;
        fromData.append(cr, value)
      })
      // this.orgMasterForm.value.Id == null ? this.orgMasterForm.value.Id = 0 : this.orgMasterForm.value.Id = this.orgMasterForm.value.Id;
      let btnTextFlag: any;
      this.btnText == "Create Committee" ? btnTextFlag = 0 : btnTextFlag = this.HighlightRow;
      fromData.append('Id', btnTextFlag);

      // this.callAPIService.setHttp('Post', 'Web_Insert_bodycellorgmaster_1_0_SubCommittee', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.setHttp('Post', 'Web_Insert_bodycellorgmaster_2_0_SubCommittee', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.btnText = "Create  Committee";
          this.editLevalFlag = "";
          this.selectLevelClear();
          this.spinner.hide();
          this.toastrService.success(res.data1[0].Msg);
          this.getOrganizationList();
          this.clearForm();

          this.closeewCommitteeModal.nativeElement.click();
        } else {
          // //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      })
    }
  }

  clearForm() {
    this.HighlightRow = null;
    this.submitted = false;
    this.paginationNo = 1;
    // this.orgMasterForm.reset({ IsRural: 1});
    this.customForm();
    // this.getOrganizationList();
    this.selectLevelClear();
    this.btnText = "Create Committee";
  }

  filterData() {
    this.paginationNo = 1;
    this.getOrganizationList();
  }

  clearFilter(flag: any) {
    if (flag == 'district') {
      this.filterForm.controls['filterDistrict'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['searchText'].setValue('');
    } else if (flag == 'member') {
      this.filterForm.controls['AllotedDesignation'].setValue('');
    } else if (flag == 'level') {
      this.filterForm.controls['LevelId'].setValue(0);
    }
    this.paginationNo = 1;
    this.getOrganizationList();
  }

  editOrganization(BodyId: any) {
    this.clearForm();
    this.btnText = "Update Committee";
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Getbodycellorgmaster_1_0?BodyId=' + BodyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.selEditOrganization = res.data1[0];
        this.HighlightRow = this.selEditOrganization.Id;
        this.editLevalFlag = "edit"
        this.selectLevel(this.selEditOrganization.BodyLevel, this.editLevalFlag);
        this.getCommitteeByLevel(this.selEditOrganization.BodyLevel);
        this.orgMasterForm.patchValue({
          BodyOrgCellName: this.selEditOrganization.BodyOrgCellName.trim(),
          StateId: this.selEditOrganization.StateId,
          DivisionId: this.selEditOrganization.DivisionId,
          DistrictId: this.selEditOrganization.DistrictId,
          IsRural: this.selEditOrganization.IsRural,
          BodyLevelId: this.selEditOrganization.BodyLevel,
          CreatedBy: this.commonService.loggedInUserId()
        })
      } else {
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getDesignation() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Getdesignationmaster_1_0', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resultDesignation = res.data1;
        if (this.btnText == "Update Committee") { // edit
          this.orgMasterForm.patchValue({ VillageId: this.selEditOrganization.VillageId });
        }
      } else {
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  defaultDesignationForm() {
    this.AddDesignationForm = this.fb.group({
      Id: [0],
      BodyId: [],
      DesignationId: ['', Validators.required],
      IsMultiple: ['', Validators.required],
      CreatedBy: [this.commonService.loggedInUserId()],
    })
  }

  AddDesignation(BodyOrgCellName: any, bodyId: any) {
    const dialogRef = this.dialog.open(AddDesignationComponent, {
      width: '1024px',
      data: {committeeName:BodyOrgCellName,committeeId:bodyId}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes' || result == 'No') {
        this.getOrganizationList();
      }
    });


    // this.desBodyId = bodyId;
    // this.getBodyAssignedDesignation();
    // this.AlreadyAssignedDesignations(this.desBodyId)
    // this.AddDesignationForm.patchValue({
    //   BodyId: BodyOrgCellName
    // })
  }

  AlreadyAssignedDesignations(desBodyId: any) {
    //this.spinner.show();
    this.modalDeafult = true
    this.callAPIService.setHttp('get', 'Web_GetAssignedDesignation_1_0?BodyId=' + desBodyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAssignedDesignations = res.data1;
      } else {
        // this.toastrService.error("Designations is  not available");
        this.allAssignedDesignations = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  get d() { return this.AddDesignationForm.controls };

  submitDesignationForm() {
    //this.spinner.show();
    this.addDesFormSubmitted = true;
    if (this.AddDesignationForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      let fromData: any = new FormData();
      this.AddDesignationForm.value['BodyId'] = this.desBodyId;
      Object.keys(this.AddDesignationForm.value).forEach((cr: any, ind: any) => {
        fromData.append(cr, Object.values(this.AddDesignationForm.value)[ind])
      })
      this.callAPIService.setHttp('Post', 'Web_Insert_postmaster_1_0', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.addDesignation = 'Add';
          this.submitted = false;
          this.clearAddDesignationForm();
          this.spinner.hide();
          this.toastrService.success(res.data1[0].Msg);
          // this.closeModalAddDes();
          this.getBodyAssignedDesignation();
          this.AlreadyAssignedDesignations(this.desBodyId);
          this.spinner.hide();
          this.getOrganizationList();
        } else {
          this.toastrService.error("Members is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      })
    }
  }

  editDesignationForm(data: any) {
    this.heightedRow = data.SrNo;
    this.addDesignation = 'Edit';
    this.AddDesignationForm.patchValue({
      Id: data.Id,
      BodyId: this.AddDesignationForm.value.BodyId,
      DesignationId: data.DesignationId,
      IsMultiple: data.IsMultiple,
      CreatedBy: this.commonService.loggedInUserId(),
    })
    this.editRadioBtnClick = data.IsMultiple;
  }

  clearAddDesignationForm() {
    this.addDesFormSubmitted = false;
    this.AddDesignationForm.patchValue({
      IsMultiple: '',
      DesignationId: '',
    });
  }

  closeModalAddDes() {
    let closeModal: any = this.closeModalAddDesignation.nativeElement;
    closeModal.click();
  }

  onClickPagintion(pageNo: number) {
    // this.clearForm();
    this.paginationNo = pageNo;
    this.getOrganizationList();
  }

  filter(searchText: any) {
    this.searchFilter = searchText;
    this.getOrganizationList();
  }

  redirectOrgDetails(bodyId: any, bodylevelId: any, BodyOrgCellName: any) {
    // if (officeBearers == "" || officeBearers == null) {
    //   this.toastrService.error("Data not found..");
    // } else {
    let obj = { bodyId: bodyId, BodyOrgCellName: BodyOrgCellName,bodylevelId: bodylevelId}
    sessionStorage.setItem('bodyId', JSON.stringify(obj))
    this.router.navigate(['details'], { relativeTo: this.route })
    //}
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
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.filterForm.value.searchText;
        this.paginationNo = 1;
        this.getOrganizationList();
      }
      );
  }

  getBodyAssignedDesignation() {
    this.callAPIService.setHttp('get', 'Web_GetAssigned_Post_1_0?BodyId=' + this.desBodyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allBodyAssignedDesignation = res.data1;
      } else {
        this.spinner.hide();
        // this.toastrService.error("Designations is  not available");
        this.allBodyAssignedDesignation = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  selCity() {
    //this.spinner.show();
    this.villageCityLabel = "City/District";
    if (this.globalDivisionId == undefined || this.globalDivisionId == "") {
      this.toastrService.error("Please select division");
      this.spinner.hide();
      return
    }else if (this.globalDistrictId == undefined || this.globalDistrictId == "") {
      this.toastrService.error("Please select district");
      this.spinner.hide();
      return
    } else {
      this.disableFlagVill = false;
      this.getVillageOrCity(this.globalDistrictId, 'City/District');
      this.setVillOrcityName = "CityName";
      this.setVillOrCityId = "Id";
      this.spinner.hide();
    }
  }

  selVillage() {
    //this.spinner.show();
    if (this.globalDivisionId == undefined || this.globalDivisionId == "") {
      this.toastrService.error("Please select division");
      this.spinner.hide();
      return
    }else if (this.globalDistrictId == undefined || this.globalDistrictId == "") {
      this.toastrService.error("Please select district");
      this.spinner.hide();
      return
    } else {
      this.disableFlagVill = false;
      this.globalTalukaID == undefined ? this.globalTalukaID = 0 : this.globalTalukaID;
      this.btnText == "Update Committee" ? this.getVillageOrCity(this.globalTalukaID, 'Village/Town') : '';
      this.setVillOrcityName = "VillageName";
      this.setVillOrCityId = "VillageId";
      this.spinner.hide();
    }
  }

  deleteCommitteeConfirmation(bodyId: any, allottedDesignation: any) {
    if (allottedDesignation == 0) {
      // let clickDeleteCommitteeModal = this.openDeleteCommitteeModal.nativeElement;
      // clickDeleteCommitteeModal.click();
      this.deletebodyId = bodyId;
      this.deleteConfirmModel();
    } else {
      this.toastrService.info('Designations are already assigned to this Committee');
    }
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deletecommittee();
      }
    });
  }

  deletecommittee() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Delete_bodycellorgmaster_1_0?UserId=' + this.commonService.loggedInUserId() + '&BodyId=' + this.deletebodyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg)
      } else {
        this.spinner.hide();
      }
      this.getOrganizationList();
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  redTocommitteesOnMap(){
    let DistrictId:any;
    if(this.allDistrict?.length == 1){
      DistrictId =  this.allDistrict[0].DistrictId;
    } else{
      DistrictId = 0;
    }
    this.router.navigate(['../committees-on-map'], {relativeTo:this.route});
    sessionStorage.setItem('DistrictIdWorkThisWeek', JSON.stringify(DistrictId));
 
  }

  addMember(){
    // const dialogRef = this.dialog.open(AddMemberComponent, {
    //   width: '1024px',
    //   data:this.result
    // });
  }

}
