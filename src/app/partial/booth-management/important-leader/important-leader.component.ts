import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-important-leader',
  templateUrl: './important-leader.component.html',
  styleUrls: ['./important-leader.component.css']
})
export class ImportantLeaderComponent implements OnInit {
  impLeaderForm !: FormGroup;
  filterForm !: FormGroup;
  submitted: any;
  userId = this.commonService.loggedInUserId();
  clientId = this.commonService.getlocalStorageData().ClientId;
  leaderLevelArray = new Array();
  filterLevelArray = new Array();
  partyDetailsArray = new Array();
  filterPartyDetailsArray = new Array();
  stateArray = new Array();
  filterStateArray = new Array();
  districtArray = new Array();
  filterDistrictArray = new Array();
  talukaArray = new Array();
  filterTalukaArray = new Array();
  villageArray = new Array();
  filterVillageArray = new Array();
  polliticalUnitArray = new Array();
  tableData = new Array();
  profilePhoto: any;
  editObj: any;
  getTotal: number = 0;
  paginationNo: number = 0;
  @ViewChild('fileInput') fileInput!: ElementRef;
  totalstar: number = 5;
  starvalue: number = 0;
  gold: string = 'gold';
  userLevel = this.commonService.getLoggedUserStateData()?.BodyLevel;
  // userLevel = 3;

  constructor(public commonService: CommonService, private formBuilder: FormBuilder,
    public dialog: MatDialog, private apiService: CallAPIService, private toastrService: ToastrService,) { }

  ngOnInit(): void {
    this.defaultForm();
    this.getLeaderLevel();
    this.defaultFilterForm();
    this.getParty();
    this.getState();
    this.getDistrict();
    this.getTableData()
  }

  defaultForm() {
    this.impLeaderForm = this.formBuilder.group({
      "id": 0,
      "leaderName": ["", Validators.required],
      "mobileNo": ["", [Validators.required, Validators.pattern('^[6-9]{1}[0-9]{9}$')]],
      "partyId": ["", Validators.required],
      "leaderImportance": ["", Validators.required],
      "districtId": ["", Validators.required],
      "talukaId": ["", Validators.required],
      "remark": ["", Validators.required],
      "designation": ["", Validators.required],
      "stateId": 1,
      "address": ["", Validators.required],
      "levelId": ["", Validators.required],
      "politicalUnitId": ["", Validators.required],
      "villageId": ["", Validators.required]
    })
  }

  defaultFilterForm() {
    this.filterForm = this.formBuilder.group({
      "levelId": [""],
      "partyId": 0,
      "stateId": 1,
      "districtId": 0,
      "talukaId": 0,
      "villageId": 0,
      "searchText": [""]
    })
  }

  get fc() { return this.impLeaderForm.controls }
  get fcc() { return this.filterForm.controls }

  clearForm() {
    this.submitted = false;
    this.defaultForm();
    this.starvalue = 0;
    this.gold = 'gray';
    this.profilePhoto ? this.deleteImg() : '';
  }

  onRate(event: any) {
    this.gold = 'gold';
    this.fc['leaderImportance']?.setValue(event.newValue);
  }

  uploadImage(event: any) {
    let selResult = event.target.value.split('.');
    let getImgExt = selResult.pop();
    getImgExt.toLowerCase();
    if (getImgExt == 'png' || getImgExt == "jpg" || getImgExt == "jpeg") {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 10485760) {
          this.toastrService.error("Required file size should be less than 10 MB.");
        }
        else {
          const reader: any = new FileReader();
          reader.onload = () => {
            const formData = new FormData();
            formData.append('DirName', 'boothissue');
            formData.append('files', file);
            this.apiService.setHttp('POST', 'ClientMasterApp/BoothIssue/UploadPhotos', false, formData, false, 'electionMicroSerApp');
            this.apiService.getHttp().subscribe({
              next: (res: any) => {
                this.profilePhoto = res.filePath
                this.commonService.checkDataType(res.statusMessage) == false ? this.toastrService.success("Image Uploaded Successfully...") : this.toastrService.error(res.statusMessage);
              },
              error: ((_error: any) => { })
            })
          }
          reader.readAsDataURL(event.target.files[0]);
        }
      }
    }
    else {
      this.toastrService.error('Only Supported file Types... png, jpg, jfif, jpeg');
    }
  }

  deleteImg() {
    this.fileInput.nativeElement.value = "";
    this.profilePhoto = "";
  }

  //#region  -----------------------Drop Down Start ---------------------------------------------------------//
  getLeaderLevel() {
    this.apiService.setHttp('GET', 'ClientMasterApp/ProminentLeader/GetleaderLevel', false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.leaderLevelArray = res.responseData, this.filterLevelArray = res.responseData) : (this.leaderLevelArray = [], this.filterLevelArray = []);
      },
      error: () => { this.leaderLevelArray = []; this.filterLevelArray = []; }
    })
  }

  getParty() {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetPartyDetails?ClientId=' + this.clientId + '&UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.partyDetailsArray = res.responseData, this.filterPartyDetailsArray = res.responseData) : (this.partyDetailsArray = [], this.filterPartyDetailsArray = []);
      },
      error: () => { this.partyDetailsArray = []; this.filterPartyDetailsArray = []; }
    })
  }

  getState() {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetAllState?UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.stateArray = res.responseData, this.filterStateArray = res.responseData) : (this.stateArray = [], this.filterStateArray = []);
      },
      error: () => { this.stateArray = []; this.filterStateArray = []; }
    })
  }

  getDistrict() {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetAllDistricts?StateId=1&UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.districtArray = res.responseData, this.filterDistrictArray = res.responseData) : (this.districtArray = [], this.filterDistrictArray = []);
        this.userLevel ==3 ? (this.fc['districtId'].setValue(this.commonService.getLoggedUserStateData()?.districtId),this.getTaluka()) : ''
      },
      error: () => { this.districtArray = []; this.filterDistrictArray = []; }
    })
  }

  getTaluka(flag?: string) {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetAllTaluka?DistrictId=' + (flag ? (this.fcc['districtId'].value) : (this.fc['districtId'].value)) + '&UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          if (flag) {
            this.filterTalukaArray = res.responseData;
          } else {
            this.talukaArray = res.responseData;
        this.userLevel ==3 ? (this.fc['talukaId'].setValue(this.commonService.getLoggedUserStateData()?.talukaId),this.getVillage()) : ''
        this.editObj ? this.fc['talukaId'].setValue(this.editObj.talukaId) :  '';
          }
        } else {
          this.talukaArray = []; this.filterTalukaArray = [];
        }
      },
      error: () => { this.talukaArray = []; this.filterTalukaArray = []; }
    })
  }

  getVillage(flag?: string) {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetAllVillages?TalukaId=' + (flag ? (this.fcc['talukaId'].value) : (this.fc['talukaId'].value)) + '&UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          if (flag) {
            this.filterVillageArray = res.responseData;
          } else {
            this.villageArray = res.responseData;
            this.editObj ? this.fc['villageId'].setValue(this.editObj.villageId) : '';
          }
        } else {
          this.villageArray = []; this.filterVillageArray = [];
        }
      },
      error: () => { this.villageArray = []; this.filterVillageArray = []; }
    })
  }

  getPoliticalUnit() {
    let str = `api/BoothCommitteeDashboard/GetTalukawise_PolitalUnit?UserId=${this.userId}&ClientId=${this.clientId}`; //&DistrictId=${this.fc['districtId'].value}&TalukaId=${this.fc['talukaId'].value}
    this.apiService.setHttp('GET', str, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.polliticalUnitArray = res.responseData : this.polliticalUnitArray = [];
      },
      error: () => { this.polliticalUnitArray = [] }
    })
  }
  //#endregion -----------------------Frop Down Ends ----------------------------------------------------------//

  selectLevelClear(flag?: string) {
    if (flag == 'district') {
      this.fc["talukaId"].setValue("");
      this.fc["villageId"].setValue("");
    }
    else if (flag == 'taluka') {
      this.fc["villageId"].setValue("");
    }
    else if (flag == 'filterlevel') {
      this.fcc['levelId'].setValue("");
    }
    else if (flag == 'filterparty') {
      this.fcc['partyId'].setValue("");
    }
    else if (flag == 'filterdist') {
      this.fcc["talukaId"].setValue("");
      this.fcc["villageId"].setValue("");
    }
    else if (flag == 'filtertaluka') {
      this.fcc["villageId"].setValue("");
    }
    else if (flag == 'search') {
      this.fcc['searchText'].setValue("");
      this.getTableData();
    }
  }

  getTableData(flag?:any) {
    let filterFormVal = this.filterForm.getRawValue();
    flag ? this.paginationNo = 0 :'';
    let strUrl = `ClientMasterApp/ProminentLeader/GetAll_Web_1_0?ClientId=${this.clientId}${filterFormVal.searchText ? '&Search=' + filterFormVal.searchText : ''}${filterFormVal.levelId ? '&LevelId=' + filterFormVal.levelId : ''}&StateId=${filterFormVal.stateId}`;
    strUrl += `${filterFormVal.districtId ? '&DistrictId=' + filterFormVal.districtId : ''}${filterFormVal.talukaId ? '&TalukaId=' + filterFormVal.talukaId : ''}${filterFormVal.villageId ? '&VillageId=' + filterFormVal.villageId : ''}${filterFormVal.partyId ? '&PartyId=' + filterFormVal.partyId : ''}&pageno=${this.paginationNo + 1}&pagesize=10`;
    this.apiService.setHttp('GET', strUrl, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.tableData = res.responseData.responseData1, this.getTotal = res.responseData.responseData2.totalCount) : this.tableData = [];
      },
      error: () => { this.tableData = [] }
    })
  }

  onClickPagintion(event:any){
    this.paginationNo = event;
    this.getTableData();
  }

  patchFormData(data: any) {
    this.editObj = data;
    this.impLeaderForm.patchValue(data);
    this.getTaluka();
    this.getVillage();
    this.getPoliticalUnit();
    this.profilePhoto = data.profilePhoto;
    this.starvalue = data.leaderImportance;
    this.gold = 'gold';
    this.fc['leaderImportance']?.setValue(data.leaderImportance);
  }

  deleteConfirmModel(id?: any) {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'Yes') {
        this.deleteListData(id);
      }
    });
  }

  deleteListData(id?: any) {
    let obj = { id: id, "deletedBy": this.userId }
    this.apiService.setHttp('DELETE', 'ClientMasterApp/ProminentLeader/Delete_1_0', false, obj, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.toastrService.success(res.statusMessage), this.getTableData()) : this.toastrService.error(res.statusMessage);
      },
      error: () => { }
    })
  }

  onSubmit() {
    this.submitted = true;
    this.fc['levelId'].value != 8 ? (this.fc['politicalUnitId'].setValidators([]), this.fc['politicalUnitId'].updateValueAndValidity(), this.fc['politicalUnitId'].setValue(0)) : '';
    let formval = this.impLeaderForm.getRawValue();
    let postObj = {
      ...formval,
      "id": this.editObj ? this.editObj.id : 0,
      "electionId": 0,
      "constituencyId": 0,
      "clientId": this.clientId,
      "createdBy": this.userId,
      "partyName": "",
      "electionName": "",
      "constituencyName": "",
      "districtName": "",
      "talukaName": "",
      "villageName": "",
      "politicalUnitName": "",
      "partyShortCode": "",
      "partyIconImage": "",
      "levelName": "",
      "localGatId": 0,
      "localGatName": "",
      "profilePhoto": this.profilePhoto
    }

    if (this.impLeaderForm.invalid) {
      return;
    } else if (!this.profilePhoto) {
      this.toastrService.error("Please Upload Profile Photo");
      return;
    } else {
      this.apiService.setHttp(postObj.id == 0 ? 'POST' : 'PUT', `ClientMasterApp/ProminentLeader/${postObj.id == 0 ? 'Create_1_0' : 'Update_1_0'}`, false, postObj, false, 'electionMicroSerApp');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == 200 ? (this.toastrService.success(res.statusMessage), this.clearForm(), this.getTableData()) : this.toastrService.error(res.statusMessage);
        },
        error: () => { }
      })
    }
  }
}
