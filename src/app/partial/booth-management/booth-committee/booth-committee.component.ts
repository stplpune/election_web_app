import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

@Component({
  selector: 'app-booth-committee',
  templateUrl: './booth-committee.component.html',
  styleUrls: ['./booth-committee.component.css']
})
export class BoothCommitteeComponent implements OnInit {

  filterForm!: FormGroup;
  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  voterAreaArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  boothWiseComityGenerlAndFemaleArray: any;
  searchVoterBCGeneralAndFemaleArray: any;
  getTotal: any;
  paginationNo: number = 1; 
  pageSize: number = 10;
  designationMasterArray: any;
  globleBoothCommitteeType = 1;
  missingAreaData:any;
  boothIdforAdd:any;
  assignVoterObj:any;
  @ViewChild('CommityMemberconfModel') CommityMemberconfModel: any;
  confoUserId:any;
  confornModelMsg: any;
  getTotalPages: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.defaultMainFilterForm();
    this.defaultBoothComityForm();
    this.getClientName();
  }

  defaultMainFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      village: [0],
      getBoothId: [''],
      AreaId: [0],
    })
  }
  
  getClientName() {
    this.nullishFilterForm(); 
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName() {
    this.nullishFilterForm();     
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName()) : '';
      } else {
        this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {
    this.nullishFilterForm();      
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData() {
    this.globleBoothCommitteeType = 1;
    this.filterForm.controls['village'].setValue(0);
    this.filterForm.controls['getBoothId'].setValue(0);
    this.filterForm.controls['AreaId'].setValue(0);
    this.getBoothWiseCommitteGeneralAndFemale(); 
    this.ClientWiseBoothList();
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.villageDropdown = res.responseData;
      } else {
        this.villageDropdown = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Booth List ...............//
  ClientWiseBoothList() {
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter Area List ...............//
  getVoterAreaList() {
    this.callAPIService.setHttp('get', 'Filter/GetAreaDetails?ClientId=' + this.filterForm.value.ClientId + '&ElectionId='
      + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId + '&BoothId=' + (this.filterForm.value.getBoothId || this.boothIdforAdd),
      + '&VillageId=' + this.filterForm.value.village, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.voterAreaArray = res.responseData;
        this.filterForm.value.AreaId ? this.areaNameBC.setValue(this.filterForm.value.AreaId) : '';
      } else {
        this.voterAreaArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue(0);
      this.filterForm.controls['AreaId'].setValue(0);
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue(0);
      this.filterForm.controls['AreaId'].setValue(0);
      this.dataNotFound = false;
    } else if (flag == 'constituencyId') {
      this.globleBoothCommitteeType = 1;
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue(0);
      this.filterForm.controls['AreaId'].setValue(0);
      this.dataNotFound = false;
      this.ClientWiseBoothList();
    } else if (flag == 'village') {
      this.globleBoothCommitteeType = 1;
      this.filterForm.controls['getBoothId'].setValue(0);
      this.filterForm.controls['AreaId'].setValue(0);
      this.ClientWiseBoothList();
      this.getBoothWiseCommitteGeneralAndFemale();
    } else if (flag == 'boothId') {
      this.globleBoothCommitteeType = 1;
      this.filterForm.controls['getBoothId'].setValue(0);
      this.filterForm.controls['AreaId'].setValue(0);
      this.getBoothWiseCommitteGeneralAndFemale();
    }
  }

  nullishFilterForm() { //Check all value null || undefind || empty 
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0);
    fromData.AreaId ?? this.filterForm.controls['AreaId'].setValue(0);
  }

  getBoothWiseCommitteGeneralAndFemale(){  // Main Api For Table
    this.nullishFilterForm(); 
    this.spinner.show(); 
    let obj = this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId + '&AreaId=' + this.filterForm.value.AreaId 
    + '&IsPresident=' + 0 + '&CommitteeTypeId=' + this.globleBoothCommitteeType + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetBoothWiseCommitteMemberCommitteeTypewise?ClientId='+ obj , false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothWiseComityGenerlAndFemaleArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
        this.getTotalPages = res.responseData.responseData2.totalPages;
       } else {
        this.spinner.hide();
        this.boothWiseComityGenerlAndFemaleArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getBoothWiseCommitteGeneralAndFemale();
  }

  getSearchVoterBCGeneralAndFemale(boothId:any){
    this.nullishFilterForm(); 
    this.spinner.show(); 
    this.boothIdforAdd = boothId;
    let obj = this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + boothId + '&AreaId=' + (this.areaNameBC.value || this.filterForm.value.AreaId ) + '&CommitteeTypeId=' + this.globleBoothCommitteeType 
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetBoothWiseCommitteGeneralAndFemaleSearch?ClientId='+ obj , false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.searchVoterBCGeneralAndFemaleArray = res.responseData;
        this.searchVoterBCGeneralAndFemaleArray.map((ele:any)=>{
          ele['mixVoterName'] = ' [' + ele.voterNo + '] ' + ele.englishName;
          return ele;
        })
       } else {
        this.spinner.hide();
        this.searchVoterBCGeneralAndFemaleArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getDesignationMaster(){  // Get Designation Master
    this.nullishFilterForm(); 
    this.callAPIService.setHttp('get', 'ClientMasterApp/BoothCommittee/GetDesignationMaster?ClientId='+ this.filterForm.value.ClientId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.designationMasterArray = res.responseData;
       } else {
        this.spinner.hide();
        this.designationMasterArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }


  boothCommitteeForm!: FormGroup | any;
  submitted: boolean = false;
  btnTextBoothComity = 'Submit';
  @ViewChild('addCommitteeMemberModel') addCommitteeMemberModel: any;
  assignedBoothlist: any;
  boothCommitteeObj: any;
  saveUpdateFlag:any;
  areaNameBC = new FormControl('');

  get f() { return this.boothCommitteeForm.controls };

  defaultBoothComityForm() {
    this.boothCommitteeForm = this.fb.group({
      id: [0],
      mobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      fName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      mName: ['', [Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      lName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]],
      designationId: ['',Validators.required],
      voterName: ['']
    })
  }

  bindVoterDetail(event: any) {  // Add And Update BoothCommittee Model
    this.saveUpdateFlag == 'add' ? this.boothCommitteeForm.controls['designationId'].setValue(2):'';
    if (event?.length || this.saveUpdateFlag == 'update') {
      this.getDesignationMaster();
      let eleObj = this.saveUpdateFlag == 'add' ? event[0]?.data : event;
      this.saveUpdateFlag == 'add' ? (this.btnTextBoothComity = 'Submit', this.boothCommitteeForm?.controls['id'].setValue(0)) : (this.btnTextBoothComity = 'Update', this.boothCommitteeForm.controls['id'].setValue(eleObj?.areaAgentId));
      this.submitted = false; 
      let fullName = this.saveUpdateFlag == 'add' ? eleObj?.englishName?.trim().split(' ') : eleObj?.voterName?.trim().split(' ');

      this.boothCommitteeForm.patchValue({
        id: this.boothCommitteeForm.value.id,
        mobileNo: this.saveUpdateFlag == 'add' ? eleObj?.mobileNo1 || '' : eleObj?.mobileNo,
        fName: fullName[0],
        mName: fullName?.length == 3 ? fullName[1] : '',
        lName: fullName?.length == 3 ? fullName[2] : fullName[1],
        gender: 0,
        designationId: this.saveUpdateFlag == 'update' ? eleObj?.designationId : this.boothCommitteeForm.value.designationId
      }) 
      this.assignedBoothlist = [
        {
          "assemblyId": 0,
          "boothId": eleObj?.boothId,
          "constituencyId": this.filterForm.value.ConstituencyId,
          "electionId": this.filterForm.value.ElectionId
        }
      ];
      this.boothCommitteeObj = {
        "id": 0,
        "boothId": eleObj?.boothId,
        "voterId": eleObj?.voterId,
        "clientId": parseInt(this.filterForm.value.ClientId),
        "createdBy": this.commonService.loggedInUserId(),
        "committeeTypeId": this.globleBoothCommitteeType
      }
    }
  }

  removeBindData(){
    this.defaultBoothComityForm();
    this.designationMasterArray = [];
    this.submitted = false;
  }

  onSubmitForm() {
    this.submitted = true;
    if (this.boothCommitteeForm.invalid) {
      return;
    } else {
      this.spinner.show();
      let formData = this.boothCommitteeForm.value;
      let fullName = formData.fName + ' ' + formData.mName + ' ' + formData.lName;
      let obj = {
        "id": formData.id,
        "fullName": fullName,
        "mobileNo": formData.mobileNo,
        "fName": formData.fName,
        "mName": formData.mName,
        "lName": formData.lName,
        "gender": formData.gender == 'M' ? 1 : formData.gender == 'F' ? 2 : 3,  // Update Senario gender Not Pass bakend Side
        "clientId": parseInt(this.filterForm.value.ClientId),
        "createdBy": this.commonService.loggedInUserId(),
        "subUserTypeId": 4,
        "assignedBoothlist": this.assignedBoothlist
      }

      this.callAPIService.setHttp('POST', 'ClientMasterApp/BoothCommittee/CreateBoothCommitteeAreaUser', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
            this.boothCommiteeSubmit(res.responseData.userId);
          this.submitted = false;
        } else if (res.statusCode == "409" && res.responseData.id < res.responseData.userId) {
          this.spinner.hide();
          this.confoUserId = res.responseData.userId;
          this.confornModelMsg = res.responseData.msg;
          this.CommityMemberconfModel.nativeElement.click();
          // this.spinner.hide();
          // if (confirm("Do You Want to Add Committee Member!")) {
          //   this.boothCommiteeSubmit(res.responseData.userId);
          //   this.submitted = false;
          // } 
        } else if(res.statusCode == "409" && res.responseData.id == 0 && res.responseData.userId == 0){
          this.spinner.hide();
          this.toastrService.error(res.statusMessage);
        }
        else {
          this.spinner.hide();
          this.boothCommiteeSubmit(res.responseData.userId);
          // this.toastrService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  committeeMConformation(confoUserId:any){ 
    this.boothCommiteeSubmit(confoUserId);
    this.submitted = false;
  }

  boothCommiteeSubmit(areaAgentId: any) {  // when CreateCallCenterUse Id get then Call boothCommitee Api
    this.boothCommitteeObj['areaAgentId'] = areaAgentId;
    this.boothCommitteeObj['designationId'] = this.boothCommitteeForm.value.designationId,
    this.spinner.show();
    this.callAPIService.setHttp('POST', 'ClientMasterApp/BoothCommittee/AddBoothCommitteeMember_WithDesignation', false, [this.boothCommitteeObj], false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.getBoothWiseCommitteGeneralAndFemale();
        this.addCommitteeMemberModel.nativeElement.click();
        this.toastrService.success(res.statusMessage);
        this.submitted = false;
      } else {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  filterVoterByAreaId() {
    this.submitted = false;
    this.defaultBoothComityForm();
    this.getSearchVoterBCGeneralAndFemale(this.boothIdforAdd);
  }

    //.......................................  Delete Booth Committee member code Start Here .................................//

    deleteConfirmModel(obj: any) {
      const dialogRef = this.dialog.open(DeleteComponent,{
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'Yes') {
          this.deleteBoothComityMember(obj);
        }
      });
    }
  
    deleteBoothComityMember(eleObj: any) {
      let obj = this.filterForm.value.ClientId + '&BoothId=' + eleObj?.boothId + '&AreaAgentId=' + eleObj?.areaAgentId
        + '&VoterId=' + eleObj?.voterId + '&Deletedby=' + this.commonService.loggedInUserId() + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      this.callAPIService.setHttp('DELETE', 'ClientMasterApp/BoothCommittee/Delete?ClientId=' + obj, false, false, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.toastrService.success(res.responseData.msg);
          this.getBoothWiseCommitteGeneralAndFemale();
        } else {
        }
      }, (error: any) => {
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  
    //.......................................  Delete Booth Committee member code End Here .................................//

     //............................................  Booth Committee Member List Model Code Start Here ...................................//

  getVoterlistForAssignBoothComityArray: any;
  assignedBoothComitySubject: Subject<any> = new Subject();
  areaAgentIdABL: any;
  getBoothId:any;
  voterAreaBCMLArray: any;
  getAreaIdBMCL: any;
  uservoterListArray: any[] = [];
  selectArea:any = new FormControl(0);
  searchText: any = '';
  allSelectCheckBox = new FormControl('');
  // allSelectCheckBox = new FormControl({value: '', disabled: (this.searchText != '' ? true : false)})
  @ViewChild('boothCMlist') boothCMlist: any;
   

  getVoterAreaListBCML(boothId:any) { //.......... repeat call Area List Api...............//
    this.filterForm.value.AreaId ? this.selectArea.setValue(this.filterForm.value.AreaId) : '';
    this.callAPIService.setHttp('get', 'Filter/GetAreaDetails?ClientId=' + this.filterForm.value.ClientId + '&ElectionId='
      + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId + '&BoothId=' + boothId,
      + '&VillageId=' + this.filterForm.value.village, false, false, 'electionMicroServiceForWeb');
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

  getVoterlistForAssignBoothComity(areaAgentId: any,boothId:any) {  // List Booth Committee Member get Api Code
    this.spinner.show();
    this.areaAgentIdABL = areaAgentId;
    this.getBoothId = boothId;
    // this.allCheckedFlag = false;
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + boothId
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
      this.getVoterlistForAssignBoothComity(this.areaAgentIdABL,this.getBoothId);
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
        "constituencyId": this.filterForm.value.ConstituencyId,
        "boothId": this.getBoothId,
        "clientId": parseInt(this.filterForm.value.ClientId),
        "createdBy": this.commonService.loggedInUserId(),
        "uservoterlists": this.uservoterListArray
      }
      this.spinner.show();
      this.callAPIService.setHttp('POST', 'ClientMasterApp/BoothCommittee/AssignVotersToCommitteeMember', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.getBoothWiseCommitteGeneralAndFemale();
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
