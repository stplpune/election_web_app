import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { AddDesignationComponent } from '../add-designation/add-designation.component';

@Component({
  selector: 'app-add-committee',
  templateUrl: './add-committee.component.html',
  styleUrls: ['./add-committee.component.css']
})
export class AddCommitteeComponent implements OnInit {

  addCommitteeForm!: FormGroup;
  submitted = false;
  villageCityLabel = "Village";
  allLevels: any;
  resCommitteeByLevel: any;
  allStates: any;
  allDistrict: any;
  allDistrictByCommittee: any;
  getTalkaByDistrict: any;
  resultVillageOrCity: any;
  globalDistrictId: any;
  setVillOrCityId = "VillageId";
  setVillOrcityName = "VillageName";
  disableFlagDist: boolean = true;
  disableFlagTal: boolean = true;
  disableFlagVill: boolean = true;
  redioBtnDisabled: boolean = true;
  globalLevelId: any;
  parentCommitteeId: any;
  bodyLevelIdBoth: any;
  bodylevelId: any;


  constructor(private callAPIService: CallAPIService, private router: Router, private fb: FormBuilder,
    private toastrService: ToastrService, private commonService: CommonService, public dialog: MatDialog,
    public dialogRef: MatDialogRef<AddCommitteeComponent>,@Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService, private route: ActivatedRoute) { 
    }

    ngOnInit(): void {
      this.parentCommitteeId = this.data.bodyId;
      this.bodylevelId = this.data.bodylevelId;

      this.customForm();
      this.getLevel();
      this.getCommitteeByLevel(this.bodyLevelIdBoth);
      this.getState();
      // this.getDistrict();
      //this.getDistrictByCommittee();
    }
    
  customForm() {
    this.addCommitteeForm = this.fb.group({
      Id:[0],
      BodyOrgCellName: ['', [Validators.required,Validators.maxLength(100)]],
      StateId: ['', Validators.required],
      DistrictId: [],
      TalukaId: [''],
      VillageId: [''],
      IsRural: [1],
      BodyLevelId: [this.bodylevelId || 2, Validators.required],
      SubParentCommitteeId:[this.parentCommitteeId || ''],
      CreatedBy: [this.commonService.loggedInUserId()],
    })
  }

  clearselOption(flag: any) { // on click select option close icon
    if (flag == 'State') {
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
      this.addCommitteeForm.controls["StateId"].setValue("");
      this.addCommitteeForm.controls["DistrictId"].setValue("");
      this.addCommitteeForm.controls["TalukaId"].setValue("");
      this.addCommitteeForm.controls["VillageId"].setValue("");
    } else if (flag == 'District') {
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
      this.addCommitteeForm.controls["DistrictId"].setValue("");
      this.addCommitteeForm.controls["TalukaId"].setValue("");
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
    } else if (flag == 'Taluka') {
      this.disableFlagDist = true;
      this.disableFlagTal = true;
      this.disableFlagVill = false;
      this.addCommitteeForm.controls["TalukaId"].setValue("");
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
    } else if (flag == 'Village') {
      this.addCommitteeForm.controls["VillageId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
    }else if (flag == 'SubParentCommitteeId') {
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
    }
    // this.updateValueAndValidityMF(globalLevelId)
  }

  selectLevelClear() {
    this.disableFlagDist = true;
    this.disableFlagTal = true;
    this.disableFlagVill = true;
    this.addCommitteeForm.controls["StateId"].setValue("");
    this.addCommitteeForm.controls["DistrictId"].setValue("");
    this.addCommitteeForm.controls["TalukaId"].setValue("");
    this.addCommitteeForm.controls["VillageId"].setValue("");
    this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
    this.submitted = false;
  }

  clearForm() {
   // this.HighlightRow = null;
    this.submitted = false;
    // this.paginationNo = 1;
    // this.orgMasterForm.reset({ IsRural: 1});
    this.customForm();
    //this.getOrganizationList();
    this.selectLevelClear();
  }

  getLevel() {
    //this.spinner.show();
    this.selectLevel(this.globalLevelId);
    this.callAPIService.setHttp('get', 'Web_GetLevel_1_0_Committee?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetLevel_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        let Levels = res.data1;
        //filter by level
        this.bindLevelWise(Levels);
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

  bindLevelWise(Levels:any){
    this.allLevels =  Levels.filter((item: any) => {
      if (item.Id >= this.bodylevelId) {
        return item
      }
    });
  }

  getCommitteeByLevel(bodyLevelId:any) {
    //this.spinner.show();
    this.bodyLevelIdBoth = bodyLevelId || this.bodylevelId;
    this.callAPIService.setHttp('get','Web_GetBodyOrgCellName_1_0_Parent_Committee?UserId='+this.commonService.loggedInUserId()+'&BodyLevelId='+this.bodyLevelIdBoth, false, false, false, 'electionServiceForWeb'); // old API Web_GetLevel_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resCommitteeByLevel = res.data1;

        if(this.bodyLevelIdBoth != 2){
        this.resCommitteeByLevel.forEach((element:any, i:any) => {
          if(this.resCommitteeByLevel[i].Id == this.parentCommitteeId){
            this.addCommitteeForm.controls["SubParentCommitteeId"].setValue(element.Id)
          }
        });
        }else{
          this.addCommitteeForm.controls["SubParentCommitteeId"].setValue(0)
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

  getDistrict() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0_Committee?StateId=' + 1 +'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetDistrict_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allDistrict = res.data1;
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
    // this.globalDistrictId = districtId;
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0_Committee?DistrictId=' + districtId+'&UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); //old API Web_GetTaluka_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.getTalkaByDistrict = res.data1;
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
    // let globalDistrictId ;
    // this.globalDistrictId == undefined  ? globalDistrictId = 0 : globalDistrictId = this.globalDistrictId
    selType == 'Village' ? appendString = 'Web_GetVillage_1_0_Committee?talukaid=' + talukaID+'&UserId='+this.commonService.loggedInUserId() : appendString = 'Web_GetCity_1_0_Committee?DistrictId=' + this.globalDistrictId+'&UserId='+this.commonService.loggedInUserId(); //Web_GetVillage_1_0
    this.callAPIService.setHttp('get', appendString, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resultVillageOrCity = res.data1;
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

  selectLevel(levelId: any) {
    this.globalLevelId = levelId || this.bodylevelId;
    if (this.globalLevelId == 2) {
      this.disableFlagDist = true;
      // if (this.editLevalFlag == 'edit' && flag == 'select') { // DistrictId is availble then show city 
      //   this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
      // }
    }
    else if (this.globalLevelId == 3) {
      this.disableFlagDist = false;
      this.disableFlagTal = true;
      this.disableFlagVill = true;
    }
    else if (this.globalLevelId == 4) {
      this.disableFlagTal = false;
      this.disableFlagDist = false;
      this.disableFlagVill = true;
    }
    else if (this.globalLevelId == 5) {
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.disableFlagTal = false;
      this.disableFlagDist = false;
      this.disableFlagVill = false;
      this.setVillOrcityName = "VillageName";
      this.setVillOrCityId = "VillageId";
      this.villageCityLabel = "Village";
      // if (this.addCommitteeForm == 'edit' && flag == 'select') { // DistrictId is availble then show city 
      //   this.getTaluka(this.orgMasterForm.value.DistrictId);
      // }
    }
    else if (this.globalLevelId == 6) {
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.disableFlagDist = false;
      this.disableFlagTal = true;
      this.disableFlagVill = false;
      this.setVillOrcityName = "CityName";
      this.setVillOrCityId = "Id";
      this.villageCityLabel = "City";
      // if (this.editLevalFlag == 'edit' && flag == 'select') { // DistrictId is availble then show city 
      //   this.districtEvent(this.orgMasterForm.value.BodyLevelId, this.orgMasterForm.value.DistrictId);
      // }

    }
     this.validationOncondition(levelId);
  }
  selCity() {
    //this.spinner.show();
    this.villageCityLabel = "City";
    if (this.globalDistrictId == undefined || this.globalDistrictId == "") {
      this.toastrService.error("Please select district");
      this.spinner.hide();
      return
    } else {
      this.disableFlagVill = false;
      this.getVillageOrCity(this.globalDistrictId, 'City');
      this.setVillOrcityName = "CityName";
      this.setVillOrCityId = "Id";
      this.spinner.hide();
    }
  }

  validationOncondition(levelId: any) {
    if (levelId == 2) {
      this.addCommitteeForm.controls["StateId"].setValidators(Validators.required);
    } else if (levelId == 3) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["StateId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["DistrictId"].setValidators(Validators.required);
    } else if (levelId == 4) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["StateId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["DistrictId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["TalukaId"].setValidators(Validators.required);

    } else if (levelId == 5) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["StateId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["DistrictId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["TalukaId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["VillageId"].setValidators(Validators.required);

    } else if (levelId == 6) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["StateId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["DistrictId"].setValidators(Validators.required);
      this.addCommitteeForm.controls["VillageId"].setValidators(Validators.required);
    }
    this.updateValueAndValidityMF(levelId);
  }

  updateValueAndValidityMF(levelId: any) {
    if (levelId == 2) {
      this.addCommitteeForm.controls["StateId"].updateValueAndValidity();
    } else if (levelId == 3) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.addCommitteeForm.controls["StateId"].updateValueAndValidity();
      this.addCommitteeForm.controls["DistrictId"].updateValueAndValidity();
    } else if (levelId == 4) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.addCommitteeForm.controls["StateId"].updateValueAndValidity();
      this.addCommitteeForm.controls["DistrictId"].updateValueAndValidity();
      this.addCommitteeForm.controls["TalukaId"].updateValueAndValidity();
    } else if (levelId == 5) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.addCommitteeForm.controls["StateId"].updateValueAndValidity();
      this.addCommitteeForm.controls["DistrictId"].updateValueAndValidity();
      this.addCommitteeForm.controls["TalukaId"].updateValueAndValidity();
      this.addCommitteeForm.controls["VillageId"].updateValueAndValidity();
    } else if (levelId == 6) {
      this.addCommitteeForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.addCommitteeForm.controls["StateId"].updateValueAndValidity();
      this.addCommitteeForm.controls["DistrictId"].updateValueAndValidity();
      this.addCommitteeForm.controls["TalukaId"].updateValueAndValidity();
      this.addCommitteeForm.controls["VillageId"].updateValueAndValidity();
    }
    this.clearValidatorsMF(levelId);
  }

  clearValidatorsMF(levelId: any) {
    if (levelId == 2) {
      this.addCommitteeForm.controls["DistrictId"].setValue("");
      this.addCommitteeForm.controls["TalukaId"].setValue("");
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
      this.addCommitteeForm.controls['DistrictId'].clearValidators();
      this.addCommitteeForm.controls["DistrictId"].updateValueAndValidity();
      this.addCommitteeForm.controls['TalukaId'].clearValidators();
      this.addCommitteeForm.controls["TalukaId"].updateValueAndValidity();
      this.addCommitteeForm.controls['VillageId'].clearValidators();
      this.addCommitteeForm.controls['VillageId'].updateValueAndValidity();
      this.addCommitteeForm.controls['SubParentCommitteeId'].clearValidators();
      this.addCommitteeForm.controls['SubParentCommitteeId'].updateValueAndValidity();
    } else if (levelId == 3) {
      this.addCommitteeForm.controls["TalukaId"].setValue("");
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
      this.addCommitteeForm.controls['TalukaId'].clearValidators();
      this.addCommitteeForm.controls["TalukaId"].updateValueAndValidity();
      this.addCommitteeForm.controls["SubParentCommitteeId"].updateValueAndValidity();
      this.addCommitteeForm.controls['VillageId'].clearValidators();
      this.addCommitteeForm.controls['VillageId'].updateValueAndValidity();
      this.addCommitteeForm.controls['SubParentCommitteeId'].updateValueAndValidity();
    } else if (levelId == 4) {
      this.addCommitteeForm.controls["VillageId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
      this.addCommitteeForm.controls['VillageId'].clearValidators();
      this.addCommitteeForm.controls['SubParentCommitteeId'].updateValueAndValidity();
      this.addCommitteeForm.controls['VillageId'].updateValueAndValidity();
      this.addCommitteeForm.controls['SubParentCommitteeId'].updateValueAndValidity();
    }
    else if (levelId == 6) {
      this.addCommitteeForm.controls["TalukaId"].setValue("");
      this.addCommitteeForm.controls["SubParentCommitteeId"].setValue("");
      this.addCommitteeForm.controls['TalukaId'].clearValidators();
      this.addCommitteeForm.controls['SubParentCommitteeId'].updateValueAndValidity();
      this.addCommitteeForm.controls["TalukaId"].updateValueAndValidity();
      this.addCommitteeForm.controls["SubParentCommitteeId"].updateValueAndValidity();
    }
  }


  onNoClick(): void {
    this.dialogRef.close();
  }
  get f() { return this.addCommitteeForm.controls };

  onSubmit() {
    this.submitted = true;
    if (this.addCommitteeForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if (this.addCommitteeForm.value.BodyOrgCellName.trim() == '' || this.addCommitteeForm.value.BodyOrgCellName == null || this.addCommitteeForm.value.BodyOrgCellName == undefined) {
      this.toastrService.error("Committee Name can not contain space only");
      this.spinner.hide();
      return;
    }
    else {
      // //this.spinner.show();
      let fromData: any = new FormData();
      this.addCommitteeForm.value.BodyLevelId == 6 ? this.addCommitteeForm.value.IsRural = 0 : this.addCommitteeForm.value.IsRural = 1;


      Object.keys(this.addCommitteeForm.value).forEach((cr: any, ind: any) => {
        let value = Object.values(this.addCommitteeForm.value)[ind] != null ? Object.values(this.addCommitteeForm.value)[ind] : 0;
        fromData.append(cr, value)
      })

      this.callAPIService.setHttp('Post', 'Web_Insert_bodycellorgmaster_1_0_SubCommittee', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.selectLevelClear();
          this.spinner.hide();
          this.toastrService.success(res.data1[0].Msg);
          //this.getOrganizationList();
          this.clearForm();
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

}
