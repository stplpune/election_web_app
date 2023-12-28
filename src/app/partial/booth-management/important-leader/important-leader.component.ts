import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
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
  constructor(public commonService: CommonService, private formBuilder: FormBuilder,
    private apiService: CallAPIService) { }

  ngOnInit(): void {
    this.defaultForm();
    this.getLeaderLevel();
    this.defaultFilterForm();
    this.getParty();
    this.getState();
    this.getDistrict();
  }

  defaultForm() {
    this.impLeaderForm = this.formBuilder.group({
      "id": 0,
      "leaderName": [""],
      "mobileNo": [""],
      "partyId": 0,
      "leaderImportance": 0,
      "districtId": 0,
      "talukaId": 0,
      "remark": [""],
      "designation": [""],
      "stateId": 1,
      "address": [""],
      "levelId": 0,
      "politicalUnitId": 0,
      "villageId": 0,
      "profilePhoto": [""]
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

  clearForm() { }

  //#region  -----------------------Drop Down Start ---------------------------------------------------------//
  getLeaderLevel() {
    this.apiService.setHttp('GET', 'ClientMasterApp/ProminentLeader/GetleaderLevel', false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.leaderLevelArray = res.responseData, this.filterLevelArray = res.responseData) : (this.leaderLevelArray = [], this.filterLevelArray = []);
      },
      error: () => { this.leaderLevelArray = []; this.filterLevelArray =[]; }
    })
  }

  getParty() {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetPartyDetails?ClientId=' + this.clientId + '&UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.partyDetailsArray = res.responseData, this.filterPartyDetailsArray = res.responseData) : (this.partyDetailsArray = [], this.filterPartyDetailsArray = []);
      },
      error: () => { this.partyDetailsArray = []; this.filterPartyDetailsArray =[]; }
    })
  }

  getState() {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetAllState?UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.stateArray = res.responseData, this.filterStateArray = res.responseData) : (this.stateArray = [], this.filterStateArray = []);
      },
      error: () => { this.stateArray = []; this.filterStateArray =[]; }
    })
  }

  getDistrict() {
    this.apiService.setHttp('GET', 'ClientMasterWebApi/Filter/GetAllDistricts?StateId=1&UserId=' + this.userId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.districtArray = res.responseData, this.filterDistrictArray = res.responseData) : (this.districtArray = [], this.filterDistrictArray = []);
      },
      error: () => { this.districtArray = []; this.filterDistrictArray =[]; }
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
          }
        } else {
          this.talukaArray = []; this.filterTalukaArray = [];
        }
      },
      error: () => { this.talukaArray = []; this.filterTalukaArray=[]; }
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
          }
        } else {
          this.villageArray = []; this.filterVillageArray = [];
        }
      },
      error: () => { this.villageArray = []; this.filterVillageArray =[]; }
    })
  }

  getPoliticalUnit() {
    let str = `api/BoothCommitteeDashboard/GetTalukawise_PolitalUnit?UserId=${this.userId}&ClientId=${this.clientId}&DistrictId=${this.fc['districtId'].value}&TalukaId=${this.fc['talukaId'].value}`;
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
      this.defaultFilterForm();
    }
  }

  getTableData() { }

  onSubmit() { }

}
