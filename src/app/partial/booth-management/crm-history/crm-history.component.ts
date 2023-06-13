import { Component, Inject, OnInit, ViewChild, NgZone, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { now } from '@amcharts/amcharts4/.internal/core/utils/Time';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
declare var google: any;

@Component({
  selector: 'app-crm-history',
  templateUrl: './crm-history.component.html',
  styleUrls: ['./crm-history.component.css']
})
export class CrmHistoryComponent implements OnInit {

  getFeedbacksList: any;
  getFeedbacksListTotal: any;
  feedbacksPaginationNo: number = 1;
  feedBackPageSize: number = 10;
  doNotCallHideDiv: boolean = false;

  feedbackTypeArray = [{ id: 1, name: 'Positive' }, { id: 2, name: 'Negative' }, { id: 3, name: 'Neutral' }]
  enterNewFeedbackForm!: FormGroup | any;
  submitted: boolean = false;
  voterListData: any;
  voterProfileData: any;
  voterProfileFamilyData: any;
  getLengthVoterProfileFamilyData: any;
  VPCommentData: any;
  posNegativeInfData: any;
  maxFeedBack = new Date();

  max = new Date(this.commonService.isOver18().toString());
  min = new Date('01-01-1901');

  voterProfileForm!: FormGroup | any;
  submittedVP: boolean = false;
  nameCorrectionDivHide: boolean = false;
  disableDiv: boolean = true;
  expiredDisableDiv: boolean = false;
  prominentleaderArray: any;
  VoterCastListArray: any;
  religionListArray: any;
  politicalPartyArray: any;

  subjectSearchFamilyC: Subject<any> = new Subject();
  checkFamilyMemberClearFlag: boolean = false;
  headCheckArray = ['yes', 'no'];
  leaderCheckArray = ['yes', 'no'];
  migratedCheckArray = ['yes', 'no'];
  headhideDiv: boolean = false;
  leaderhideDiv: boolean = false;
  businessDethideDiv: boolean = false;
  migratedhideDiv: boolean = false;
  postalVotingDivHide: boolean = false;
  needSupportDivHide: boolean = false;
  dairyFarmerArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  goatSheepFarmerArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  sugarCaneCutterArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  yuvakArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  farmerArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  businessArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  vehicleArray = [{ id: 1, name: 'Bike' }, { id: 2, name: 'Family Car' }, { id: 3, name: 'None' }];
  financialConditionArray = [{ id: 1, name: 'Low' }, { id: 2, name: 'Middle' }, { id: 3, name: 'High' }];
  padvidharArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }]; //Is Graduate
  Ispadvidhar: any;
  bloodGroupArray = [{ id: 0, name: 'A+' }, { id: 1, name: 'A-' }, { id: 2, name: 'B+' }, { id: 3, name: 'B-' },
  { id: 4, name: 'O+' }, { id: 5, name: 'O-' }, { id: 6, name: 'AB+' }, { id: 7, name: 'AB-' }];
  childVoterDetailArray: any[] = [];
  checkedchildVoterflag: boolean = true;
  isNameCorrectionId: any;

  familyHeadVoterId: any;
  HighlightRow: any;
  isExpiredVoter = new FormControl('');

  contactlistArray: any;
  wrongMobileNumberArray: any[] = [];
  checkWrongMobileNflag: boolean = true;

  isConflictCheckFlag: any;
  conflictDataArray: any;
  conflictRecordDelObj: any;

  totalstar: number = 5;
  starvalue: number = 0;
  gold: string = 'gold';

  copyVoterProfileFamilyData: any[] = [];

  voterListforFamilyChildArray: any[] = [];
  getFamilyChildArray: any[] = [];
  submitedFamilyChildArray: any[] = [];
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  subject: Subject<any> = new Subject();
  searchFamilyMember = new FormControl('');
  checkflagFamilyMember: boolean = true;
  checkPageRefreshFlag: boolean = true;
  finalSubmitFMemberCheckFlag: boolean = false;
  familyHeadName: any;
  addContactlistArray: any;
  btnTextVerify = 'Verify';

  addressZoomSize = 6;
  migratedZoomSize = 6;
  localAreaArray: any;
  editDataObj: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastrService: ToastrService,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private datePipe: DatePipe,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
    dateTimeAdapter.setLocale('en-IN');

    let getUrlData: any = this.route.snapshot.params.id;
    if (getUrlData) {
      getUrlData = getUrlData.split('.');
      this.voterListData = {
        'AgentId': +getUrlData[0], 'ClientId': +getUrlData[1], 'VoterId': +getUrlData[2]
        , 'ElectionId': +getUrlData[3], 'ConstituencyId': +getUrlData[4]
      }
    }
  }

  ngOnInit(): void {
    this.voterListData.AgentId == 0 ? this.disableDiv = false : '';
    this.defaultFeedbackForm();
    this.defaultvoterProfileForm();
    this.feedbacksList();
    this.getVoterProfileData();
    this.getVPPoliticalInfluenceData();
    this.getVoterprofileFamilyData();
    this.getProminentleader();
    this.getIsConflictDataFlag();
    this.getReligionList();
    this.getPoliticalPartyList();
    this.getAllLocalArea();
    this.searchMigratedAddress();
    this.searchAddress();
    this.searchFMemberData('false');
  }

  defaultFeedbackForm() {
    this.enterNewFeedbackForm = this.fb.group({
      Id: [0],
      FeedBackType: ['', Validators.required],
      Description: [''],
      FollowupDate: [this.commonService.after4DayDate(), Validators.required],
      NotToCall: [this.voterProfileData?.isNotCall],
      needToCall: [0],
    })
  }

  get f() { return this.enterNewFeedbackForm.controls };

  //............................. Get Feedbacks List................................//

  feedbacksList() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId + '&VoterId=' + this.voterListData.VoterId
      + '&UserId=' + (this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()) + '&pageno=' + this.feedbacksPaginationNo + '&pagesize=' + this.feedBackPageSize
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterFeedbackCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.getFeedbacksList = res.responseData.responseData1;
        this.getFeedbacksListTotal = res.responseData.responseData2.totalPages * this.feedBackPageSize;
      } else {
        this.spinner.hide();
        this.getFeedbacksList = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //............................. Insert Feedbacks Election Data................................//

  doNotCallCheckBox(event: any, flag: any) {
    let checkflag = (flag == 'feedback' ? event.target.checked : event);
    checkflag == true ? this.doNotCallHideDiv = true : this.doNotCallHideDiv = false;
    if (checkflag == false) {
      this.enterNewFeedbackForm.controls["FollowupDate"].setValidators([Validators.required]);
      this.enterNewFeedbackForm.controls["FollowupDate"].updateValueAndValidity();
      this.enterNewFeedbackForm.controls['FollowupDate'].setValue(this.commonService.after4DayDate());
    } else {
      this.enterNewFeedbackForm.controls['FollowupDate'].setValue('');
      this.enterNewFeedbackForm.controls['FollowupDate'].clearValidators();
      this.enterNewFeedbackForm.controls['FollowupDate'].updateValueAndValidity();
    }
  }

  onSubmitFeedbackForm() {
    this.submitted = true;
    if (this.enterNewFeedbackForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      this.spinner.show();
      let data = this.enterNewFeedbackForm.value;
      data.NotToCall == true ? data.NotToCall = 1 : data.NotToCall = 0;

      let obj = {
        "id": data.Id,
        "voterId": this.voterListData.VoterId,
        "feedBackDate": this.commonService.setDate(new Date()),
        "feedBackType": data.FeedBackType,
        "description": data.Description,
        "followupDate": data.FollowupDate ? this.commonService.setDate(data.FollowupDate) : '',
        "notToCall": data.NotToCall,
        "createdBy": this.commonService.loggedInUserId(),
        "clientId": this.voterListData.ClientId,
        "needToCall": data.needToCall == true ? 1 : 0,
        "isContacted": 0
      }

      this.callAPIService.setHttp('POST', 'ClientMasterWebApi/VoterCRM/InsertVoterFeedback', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.getVoterProfileData();
          this.feedbacksList();
          this.clearForm();
          this.submitted = false;
        } else {
          this.spinner.hide();
          // this.toastrService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      })
    }
  }

  //........................ Get Voter Profile Data.....................//

  getVoterProfileData(flag?: any) {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId +
      '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId;
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.commonService.checkDataType(res.responseData?.leader) == false ? (res.responseData.leader = 'no') : res.responseData?.leader;
        this.commonService.checkDataType(res.responseData?.migrated) == false ? (res.responseData.migrated = 'no') : res.responseData?.migrated;
        res.responseData?.haveVehicle == 0 ? (res.responseData.haveVehicle = 3) : res.responseData?.haveVehicle;
        res.responseData?.financialCondition == 0 ? (res.responseData.financialCondition = 2) : res.responseData?.financialCondition;
        this.voterProfileData = res.responseData;
        flag == 'refreshFlag' ? this.refreshUrlTab() : '';
        this.editVoterProfileData(this.voterProfileData);
        this.getContactlist(this.voterProfileData);
        this.finalSubmitFMemberCheckFlag = false; this.getFamilyChildArray = []; this.submitedFamilyChildArray = [];
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  // data1: get Postive Negative Influence & data2: get Comment Data  //

  getVPPoliticalInfluenceData() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId +
      '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterProfileCRMVoterComments?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.VPCommentData = res.responseData.responseData1;
        this.posNegativeInfData = res.responseData.responseData2;
      } else {
        this.VPCommentData = [];
        this.posNegativeInfData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  clearForm() {
    this.defaultFeedbackForm();
    this.submitted = false;
    this.doNotCallHideDiv = false;
  }

  onClickPagintion(pageNo: number) {
    this.feedbacksPaginationNo = pageNo;
    this.feedbacksList();
  }

  //.......... get Political Party List ...............//
  getPoliticalPartyList() {
    this.callAPIService.setHttp('get', 'Filter/GetPartyDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + (this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.politicalPartyArray = res.responseData;
      } else {
        this.politicalPartyArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.......... get Religion List ...............//
  getReligionList() {
    this.callAPIService.setHttp('get', 'Filter/GetReligionDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + (this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.religionListArray = res.responseData;
      } else {
        this.religionListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  clearReligion() {
    this.voterProfileForm.controls['castId'].setValue('');
    this.voterProfileForm.controls['castId'].clearValidators();
    this.voterProfileForm.controls['castId'].updateValueAndValidity();
  }

  //.......... get Voter Cast List ...............//
  getVoterCastList(religionId: any) {
    this.voterProfileForm.controls["castId"].setValidators(Validators.required);
    this.voterProfileForm.controls["castId"].updateValueAndValidity();

    this.callAPIService.setHttp('get', 'Filter/GetCastDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + (this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()) + '&ReligionId=' + religionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.VoterCastListArray = res.responseData;
      } else {
        this.VoterCastListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter Prominentleader List ...............//
  getProminentleader() {
    this.callAPIService.setHttp('get', 'Filter/GetProminentleaderDetails?ClientId=' + this.voterListData.ClientId + '&UserId='
      + (this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.prominentleaderArray = res.responseData;
      } else {
        this.prominentleaderArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.......... get local Area Details List ...............//
  getAllLocalArea() {
    let obj = this.voterListData.ClientId + '&ElectionId=' + this.voterListData.ElectionId + '&ConstituencyId=' + this.voterListData.ConstituencyId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/localAreaDetails/get-localArea-Details?clientId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.localAreaArray = res.responseData;
      } else {
        this.localAreaArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //............. get get Voterprofile Family Data ...............//    

  getVoterprofileFamilyData() {
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId +
      '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterFamilyMemberCRM?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterProfileFamilyData = res.responseData;
        this.copyVoterProfileFamilyData = JSON.parse(JSON.stringify(this.voterProfileFamilyData));
        this.getLengthVoterProfileFamilyData = this.voterProfileFamilyData?.length;
        this.voterProfileFamilyData.find((ele: any) => { //get FamilyHead Name & VoterId 
          if (ele.familyHead == 1) {
            this.familyHeadVoterId = ele.voterId;
            this.familyHeadName = ele.englishName;
          }
        })
      } else {
        this.voterProfileFamilyData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter for Family Child List Code Start...............//

  getVoterListforFamilyChild() {  // select family memember Model Api
    this.spinner.show();
    let obj = 'ClientId=' + this.voterListData.ClientId + '&UserId=' + (this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()) + '&VoterId=' + this.voterListData.VoterId +
      '&ElectionId=' + this.voterListData.ElectionId + '&ConstituencyId=' + this.voterListData.ConstituencyId + '&BoothId=' + 0 + '&Search=' + this.searchFamilyMember.value.trim() + '&LastName=' + this.voterProfileData?.lastName
      + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize;
    this.callAPIService.setHttp('get', 'VoterCRM/GetVoterListforFamilyChild?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.voterListforFamilyChildArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;

        if (this.getFamilyChildArray.length == 0 && this.checkPageRefreshFlag) {
          this.voterListforFamilyChildArray.find((ele: any) => { //Add checked flag for Check Condition
            if (ele.isMember == 1) { this.getFamilyChildArray.push(ele); }
          })
          this.submitedFamilyChildArray = JSON.parse(JSON.stringify(this.getFamilyChildArray));
        }
        this.checkPageRefreshFlag = false;
        // this.getFamilyChildArray = Object.values(this.getFamilyChildArray.reduce((acc,cur)=>Object.assign(acc,{[cur.voterId]:cur}),{}))
      } else {
        this.spinner.hide(); this.voterListforFamilyChildArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionFMember(pageNo: number) {
    this.paginationNo = pageNo;
    this.getVoterListforFamilyChild();
  }

  onKeyUpFMemberSearchData() {
    this.subject.next();
  }

  searchFMemberData(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFamilyMember.value;
        this.paginationNo = 1;
        this.getVoterListforFamilyChild();
      }
      );
  }

  clearSearchFamilyMember() {
    this.searchFamilyMember.setValue('');
    this.paginationNo = 1;
    this.getVoterListforFamilyChild();
  }

  AddFamilyMember(data: any) { //add with check unique data
    this.checkflagFamilyMember = true;
    if (this.getFamilyChildArray.length <= 0) {
      this.getFamilyChildArray.push(data); this.checkflagFamilyMember = false;
    } else {
      this.getFamilyChildArray.map((ele: any) => {
        ele.voterId == data.voterId ? (this.toastrService.error('Member is Already Added'), this.checkflagFamilyMember = false) : '';
      })
    }
    this.checkflagFamilyMember && this.getFamilyChildArray.length >= 1 ? this.getFamilyChildArray.push(data) : '';
  }

  submitFamilyTree() {
    this.finalSubmitFMemberCheckFlag = true;
    this.submitedFamilyChildArray = JSON.parse(JSON.stringify(this.getFamilyChildArray));
    this.addSelectedFamilyMember();
  }

  deleteFamilyMember(index: any) {
    this.getFamilyChildArray.splice(index, 1);
  }

  clearFamilyTree() {
    this.getFamilyChildArray = JSON.parse(JSON.stringify(this.submitedFamilyChildArray));
  }

  addSelectedFamilyMember() { // Add Selected Family Member in Table Local-Side Code
    let familyHeadObj: any;
    this.voterProfileFamilyData.find((ele: any) => { // Get Family Head Obj
      if (ele.familyHead == 1) { familyHeadObj = ele; }
    })
    this.voterProfileFamilyData = [];
    familyHeadObj ? this.voterProfileFamilyData.push(familyHeadObj) : ''; // Push Family Head Obj

    this.submitedFamilyChildArray.find((ele: any) => { // Push selected Family Member Obj
      this.voterProfileFamilyData.push(ele);
    })
  }

  createFamilyTree() {
    this.submitedFamilyChildArray.map((ele: any) => { //get value in obj1 (checked = true) 
      let obj1 = {
        "childVoterId": ele.voterId,
        "voter_uid": ele.voterId,
        "voter_no": ele.voterNo,
        "assemblyId": ele.assemblyId,
        "boothId": ele.boothId
      }
      this.childVoterDetailArray.push(obj1);
    })

    let obj = {
      "parentVoterId": this.familyHeadVoterId ? this.familyHeadVoterId : this.voterProfileData?.voterId,
      "userId": this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId(),
      "modifiedBy": this.commonService.loggedInUserId(),
      "clientId": this.voterListData.ClientId,
      "childVoterDetails": this.childVoterDetailArray
    }
    this.callAPIService.setHttp('POST', 'ClientMasterWebApi/VoterCRM/CreateFamilyTree', false, obj, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        // this.toastrService.success(res.statusMessage);
        this.getVoterprofileFamilyData();
        this.clearFamilyTree();
        this.childVoterDetailArray = [];
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter for Family Child List Code End...............//

  //....... Voter Profile form code Start Here........//

  isExpiredCheckBox(event: any) {
    let flag = event.target.checked;
    flag == true ? this.expiredDisableDiv = true : this.expiredDisableDiv = false;
  }

  nameCorrectionCheckBox(event: any, flag: any) {
    let checkflag = (flag == 'noEdit' ? event.target.checked : event);
    checkflag == true ? this.nameCorrectionDivHide = true : this.nameCorrectionDivHide = false;
    this.isNameCorrectionId = checkflag == true ? 1 : 0;
    if (checkflag == true) {
      this.voterProfileForm.controls["elName"].setValidators([Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]);
      this.voterProfileForm.controls["elName"].updateValueAndValidity();
      this.voterProfileForm.controls["efName"].setValidators([Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]);
      this.voterProfileForm.controls["efName"].updateValueAndValidity();
      this.voterProfileForm.controls["emName"].setValidators([Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')]);
      this.voterProfileForm.controls["emName"].updateValueAndValidity();

      this.voterProfileForm.controls["mlName"].setValidators([Validators.required, Validators.maxLength(50), Validators.pattern(/^\S*$/)]);
      this.voterProfileForm.controls["mlName"].updateValueAndValidity();
      this.voterProfileForm.controls["mfName"].setValidators([Validators.required, Validators.maxLength(50), Validators.pattern(/^\S*$/)]);
      this.voterProfileForm.controls["mfName"].updateValueAndValidity();
      this.voterProfileForm.controls["mmName"].setValidators([Validators.maxLength(50), Validators.pattern(/^\S*$/)]);
      this.voterProfileForm.controls["mmName"].updateValueAndValidity();
    } else {
      this.voterProfileForm.controls['elName'].setValue('');
      this.voterProfileForm.controls['elName'].clearValidators();
      this.voterProfileForm.controls['elName'].updateValueAndValidity();
      this.voterProfileForm.controls['efName'].setValue('');
      this.voterProfileForm.controls['efName'].clearValidators();
      this.voterProfileForm.controls['efName'].updateValueAndValidity();
      this.voterProfileForm.controls['emName'].setValue('');
      this.voterProfileForm.controls['emName'].clearValidators();
      this.voterProfileForm.controls['emName'].updateValueAndValidity();

      this.voterProfileForm.controls['mlName'].clearValidators();
      this.voterProfileForm.controls['mlName'].updateValueAndValidity();
      this.voterProfileForm.controls['mfName'].clearValidators();
      this.voterProfileForm.controls['mfName'].updateValueAndValidity();
      this.voterProfileForm.controls['mmName'].clearValidators();
      this.voterProfileForm.controls['mmName'].updateValueAndValidity();
    }
  }

  familyHeadRadiobtn() {
    this.voterProfileForm.value.head == 'yes' ? (this.headhideDiv = true, this.voterListforFamilyChildArray = [], this.getFamilyChildArray = [], this.checkPageRefreshFlag = true
      , this.voterProfileFamilyData = this.copyVoterProfileFamilyData) : this.headhideDiv = false;
  }

  leaderRadiobtn() {
    this.voterProfileForm.value.leader == 'yes' ? this.leaderhideDiv = true : this.leaderhideDiv = false;
    if (this.voterProfileForm.value.leader == 'yes') {
      this.voterProfileForm.controls["leaderImportance"].setValidators([Validators.required]);
      this.voterProfileForm.controls["leaderImportance"].updateValueAndValidity();
    } else {
      this.voterProfileForm.controls['leaderImportance'].setValue('');
      this.starvalue = 0;
      this.voterProfileForm.controls['leaderImportance'].clearValidators();
      this.voterProfileForm.controls['leaderImportance'].updateValueAndValidity();
    }
  }

  businesDetRadiobtn() {
    this.voterProfileForm.value.haveBusiness == 1 ? this.businessDethideDiv = true : this.businessDethideDiv = false;
    if (this.voterProfileForm.value.haveBusiness == 1) {
      this.voterProfileForm.controls["businnessDetails"].setValidators([Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]);
      this.voterProfileForm.controls["businnessDetails"].updateValueAndValidity();
    } else {
      this.voterProfileForm.controls['businnessDetails'].setValue('');
      this.voterProfileForm.controls['businnessDetails'].clearValidators();
      this.voterProfileForm.controls['businnessDetails'].updateValueAndValidity();
    }
  }

  migratedRadiobtn() {//migratedArea
    this.voterProfileForm.value.migrated == 'yes' ? this.migratedhideDiv = true : this.migratedhideDiv = false;
    if (this.voterProfileForm.value.migrated == 'yes') {
      this.voterProfileForm.controls["migratedCity"].setValidators([Validators.required]);
      this.voterProfileForm.controls["migratedCity"].updateValueAndValidity();
      this.voterProfileForm.controls["migratedArea"].setValidators([Validators.required]);
      this.voterProfileForm.controls["migratedArea"].updateValueAndValidity();
    } else {
      this.voterProfileForm.controls['migratedCity'].setValue('');
      this.voterProfileForm.controls['migratedCity'].clearValidators();
      this.voterProfileForm.controls['migratedCity'].updateValueAndValidity();
      this.voterProfileForm.controls['migratedArea'].setValue('');
      this.voterProfileForm.controls['migratedArea'].clearValidators();
      this.voterProfileForm.controls['migratedArea'].updateValueAndValidity();

      this.searchMigratedAdd.setValue('');
      this.latitude = '';
      this.longitude = '';
      this.newAddedMigratedAddressLat = '';
      this.newAddedMigratedAddressLang = '';
      this.addressMigratedMarkerShow = false;
      this.copyAddressName = '';
      this.copyCityName = '';
    }
  }

  postalVotingCheckBox(event: any, flag: any) {
    let checkflag = (flag == 'noEdit' ? event.target.checked : event);
    checkflag == true ? this.postalVotingDivHide = true : this.postalVotingDivHide = false;

    if (checkflag == true) {
      this.voterProfileForm.controls["whyIsPostal"].setValidators([Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]);
      this.voterProfileForm.controls["whyIsPostal"].updateValueAndValidity();
    } else {
      this.voterProfileForm.controls['whyIsPostal'].setValue('');
      this.voterProfileForm.controls['whyIsPostal'].clearValidators();
      this.voterProfileForm.controls['whyIsPostal'].updateValueAndValidity();
    }
  }

  needSupportCheckBox(event: any, flag: any) {
    let checkflag = (flag == 'noEdit' ? event.target.checked : event);
    checkflag == true ? this.needSupportDivHide = true : this.needSupportDivHide = false;

    if (checkflag == true) {
      this.voterProfileForm.controls["needSupportText"].setValidators([Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]);
      this.voterProfileForm.controls["needSupportText"].updateValueAndValidity();
    } else {
      this.voterProfileForm.controls['needSupportText'].setValue('');
      this.voterProfileForm.controls['needSupportText'].clearValidators();
      this.voterProfileForm.controls['needSupportText'].updateValueAndValidity();
    }
  }

  onRate(event: any) {
    this.gold = 'gold'
    this.voterProfileForm.get('leaderImportance')?.setValue(event.newValue);
  }

  get v() { return this.voterProfileForm.controls };

  defaultvoterProfileForm() {
    this.voterProfileForm = this.fb.group({
      Id: [''],
      mobileNo1: ['', [Validators.pattern('[6-9]\\d{9}')]],
      mobileNo2: ['', [Validators.pattern('[6-9]\\d{9}')]],
      email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      castId: [''],
      partyId: [''],
      religionId: [''],
      watsApp1: [''],
      watsApp2: [''],
      leader: [''],
      migratedArea: [''],
      head: [''],
      dateOfBirth: [''],
      comment: [''],
      voterMarking: [''],
      migratedCity: [''],
      latitude: [''],
      longitude: [''],
      nickName: ['', Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'\/\\]\\]{}][a-zA-Z.\\s]+$')],
      migrated: [''],
      area: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)],
      leaderImportance: [''],
      // migratedLatitude: [''],
      // migratedLongitude: [''],
      occupation: [''],
      isNameChange: [''],
      mfName: [''],
      mmName: [''],
      mlName: [''],
      efName: [''],
      emName: [''],
      elName: [''],
      qualification: [''],
      bloodgroup: [''],
      isNotCall: [''],
      isDairyFarmer: [''],
      isGoatSheepFarmer: [''],
      isSugarCaneCutter: [''],
      haveVehicle: [''],
      isFarmer: [''],
      haveBusiness: [''],
      isYuvak: [''],
      financialCondition: [''],
      prominentLeaderId: [''],
      needSupportFlag: [''],
      needSupportText: [''],
      postalFlag: [''],
      whyIsPostal: [''],
      isPadvidhar: [''],
      businnessDetails: [''],
      localAreaId: [''],
    })
  }

  editFamilyMemberData(obj: any) {  //open new tab family member details
    this.HighlightRow = obj.voterId;
    if (obj.voterId != this.voterListData.VoterId) {
      window.open('crm-history/' + obj.agentId + '.' + obj.clientId + '.' + obj.voterId + '.' + this.voterListData.ElectionId + '.' + this.voterListData.ConstituencyId);
    }
  }

  editVoterProfileData(data: any) {
    this.editDataObj = data;
    this.voterProfileForm.patchValue({
      Id: this.voterProfileData.serverId,
      mobileNo1: data?.mobileNo1 == '0' ? '' : data?.mobileNo1?.trim(),
      mobileNo2: data?.mobileNo2 == '0' ? '' : data?.mobileNo2?.trim(),
      email: data.email,
      castId: data.castId == 0 ? '' : data.castId,
      partyId: data.partyId,
      religionId: data.religionId,
      watsApp1: data.watsApp1 ? true : false,
      watsApp2: data.watsApp2 ? true : false,
      leader: data.leader,
      migratedArea: data.migratedArea,
      head: data.head,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : '',
      // leaderImportance: data.leaderImportance ? Math.round(data.leaderImportance) : 0,
      leaderImportance: data.leaderImportance ? data.leaderImportance : 0,
      comment: data.comment,
      voterMarking: data.voterMarking,
      migratedCity: data.migratedCity,
      latitude: data.latitude,
      longitude: data.longitude,
      nickName: data.nickName,
      migrated: data.migrated,
      area: data.address,
      // migratedLatitude: data.migratedLatitude,  
      // migratedLongitude: data.migratedLongitude, 
      occupation: data.occupation,
      // isNameChange: data.isNameChange,
      mfName: data?.firstName?.trim(),
      mmName: data?.middleName?.trim(),
      mlName: data?.lastName?.trim(),
      efName: data.efName?.trim(),
      emName: data.emName?.trim(),
      elName: data.elName?.trim(),
      qualification: data.qualification,
      bloodgroup: data.bloodgroup,
      isNotCall: data.isNotCall,
      isDairyFarmer: data.isDairyFarmer,
      isGoatSheepFarmer: data.isGoatSheepFarmer,
      isSugarCaneCutter: data.isSugarCaneCutter,
      haveVehicle: data.haveVehicle,
      isFarmer: data.isFarmer,
      haveBusiness: data.haveBusiness,
      isYuvak: data.isYuvak,
      financialCondition: data.financialCondition,
      prominentLeaderId: data.prominentLeaderId,
      needSupportFlag: data.needSupportFlag,
      needSupportText: data.needSupportText,
      postalFlag: data.postalFlag,
      whyIsPostal: data.whyIsPostal,
      isPadvidhar: data.isPadvidhar,
      businnessDetails: data.businnessDetails,
      localAreaId: data.localAreaId,
    })
    this.isExpiredVoter.setValue(data.isExpired);
    data.isExpired == 1 ? this.expiredDisableDiv = true : this.expiredDisableDiv = false;
    data.religionId ? this.getVoterCastList(data.religionId) : '';
    this.familyHeadRadiobtn();
    this.leaderRadiobtn();
    this.migratedRadiobtn();
    this.businesDetRadiobtn();
    this.postalVotingCheckBox(data.postalFlag == 1 ? true : false, 'edit');
    this.needSupportCheckBox(data.needSupportFlag == 1 ? true : false, 'edit');
    this.nameCorrectionCheckBox(data.isNameChange == 1 ? true : false, 'edit');
    this.searchMigratedAdd.setValue(data.migratedArea);
    this.latitude = data.migratedLatitude;
    this.longitude = data.migratedLongitude;
    this.newAddedMigratedAddressLat = data.migratedLatitude;
    this.newAddedMigratedAddressLang = data.migratedLongitude;
    this.addressName = data.migratedArea;
    this.copyAddressName = data.migratedArea;
    this.cityName = data.migratedCity;
    this.copyCityName = data.migratedCity;

    this.commonService.checkDataType(data.latitude) == true ? this.searchAdd.setValue(data.address) : '';
    this.addLatitude = data.latitude;
    this.addLongitude = data.longitude;
    this.newAddedAddressLat = data.latitude;
    this.newAddedAddressLang = data.longitude;
    this.addressNameforAddress = data.address;
    this.copyAddressNameforAddress = data.address;
    // this.starvalue = this.voterProfileForm.value.leaderImportance;
    this.starvalue = Math.round(this.voterProfileForm.value.leaderImportance);
    this.defaultFeedbackForm(); this.doNotCallCheckBox(this.voterProfileData?.isNotCall == 1 ? true : false, 'profile');  //FeedBack Form code
  }

  onSubmitVoterProfile() {
    let formData = this.voterProfileForm.value;
    let x = formData.dateOfBirth ? this.datePipe.transform(this.commonService.setDate(formData.dateOfBirth), 'dd/MM/yyyy') : '';
    let y = this.datePipe.transform(this.commonService.setDate(new Date()), 'dd/MM/yyyy');

    this.submittedVP = true;
    if (this.voterProfileForm.invalid) {
      window.scroll({ top: 400, behavior: 'smooth' }); return;
    } else if (x == y) {
      this.toastrService.error('It should not be accepted Current date as the date of Birth');
      window.scroll({ top: 400, behavior: 'smooth' }); return;
    } else {
      let isDeleteFamilyMember = (this.voterProfileData?.head == 'yes' && formData.head == 'no') ? 1 : 0;
      let obj = {
        "serverId": this.voterProfileData.serverId,
        "voterId": this.voterProfileData.voterId,
        "mobileNo1": formData?.mobileNo1 || '',
        "mobileNo2": formData?.mobileNo2 || '',
        "landline": "",
        "email": formData.email || '',
        "followers": '0',
        "castId": formData.castId || 0,
        "partyId": formData.partyId || 0,
        "familysize": isDeleteFamilyMember == 1 ? '0' : this.voterProfileFamilyData?.length == 1 ? '0' : (formData.head == 'yes') ? this.voterProfileFamilyData?.length.toString() : '0',
        "religionId": formData.religionId || 0,
        "partyAffection": '0.0',
        // "leaderImportance": formData.leaderImportance == 1 ? '1.0' : formData.leaderImportance == 2 ? '2.0' : formData.leaderImportance == 3 ? '3.0' :
        //   formData.leaderImportance == 4 ? '4.0' : formData.leaderImportance == 5 ? '5.0' : '0.0',
        "leaderImportance": formData.leaderImportance == 1 ? '1.0' : formData.leaderImportance == 2 ? '2.0' : formData.leaderImportance == 3 ? '3.0' :
          formData.leaderImportance == 4 ? '4.0' : formData.leaderImportance == 5 ? '5.0' : this.voterProfileForm.value.leader == 'yes' ? this.voterProfileData.leaderImportance : '0.0',
        "watsApp1": formData.watsApp1 == true ? formData.mobileNo1 : (this.voterProfileData.watsApp1 && formData.watsApp1 == true ? this.voterProfileData.watsApp1 : ''),
        "watsApp2": formData.watsApp2 == true ? formData.mobileNo2 : (this.voterProfileData.watsApp2 && formData.watsApp2 == true ? this.voterProfileData.watsApp2 : ''),
        "facebookId": "",
        "leader": formData.leader || '',
        "migratedArea": formData.migratedArea || '',
        "regionalLang1": "",
        "regionalLang2": "",
        "userId": this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId(),
        "head": (this.voterListData?.AgentId == 0 && this.commonService.checkDataType(formData.head) == false) ? 'no' : formData.head,
        "villageId": this.voterProfileData.villageId,
        "boothId": this.voterProfileData.boothId,
        "assemblyId": this.voterProfileData.assemblyId,
        "dateOfBirth": formData.dateOfBirth ? this.commonService.setDate(formData.dateOfBirth) : '',
        "comment": formData.comment || "",
        "voterMarking": "",
        "oppCandidateId": 0,
        "feedback": "",
        "migratedCity": formData.migratedCity || '',
        "latitude": formData.area == this.addressNameforAddress ? this.addLatitude || 0 : 0,
        "longitude": formData.area == this.addressNameforAddress ? this.addLongitude || 0 : 0,
        "area": formData.area || '',  //Passing area = Address
        "voterNo": this.voterProfileData.voterNo.toString(),
        "nickName": formData.nickName || '',
        "clientId": this.voterListData?.ClientId,
        "migrated": formData.migrated || '',
        "migratedLatitude": this.latitude ? this.latitude : this.voterProfileData.migratedLatitude || 0,
        "migratedLongitude": this.longitude ? this.longitude : this.voterProfileData.migratedLongitude || 0,
        "surveyDate": new Date(),
        "buildingID": 0,
        "needSupportFlag": formData.needSupportFlag == true ? 1 : 0,
        "needSupportText": formData.needSupportText || '',
        "postalFlag": formData.postalFlag == true ? 1 : 0,
        "occupation": formData.occupation || '',
        "isNameChange": this.isNameCorrectionId,
        "mfName": formData.mfName || "",
        "mmName": formData.mmName || "",
        "mlName": formData.mlName || "",
        "efName": formData.efName || "",
        "emName": formData.emName || "",
        "elName": formData.elName || "",
        "createdDate": new Date(),
        "qualification": formData.qualification || '',
        "bloodgroup": formData.bloodgroup || '',
        "isNotCall": formData.isNotCall == true ? 1 : 0,
        "isDairyFarmer": formData.isDairyFarmer,
        "isGoatSheepFarmer": formData.isGoatSheepFarmer,
        "isSugarCaneCutter": formData.isSugarCaneCutter,
        "haveVehicle": formData.haveVehicle,
        "isFarmer": formData.isFarmer,
        "haveBusiness": formData.haveBusiness,
        "isYuvak": formData.isYuvak,
        "financialCondition": formData.financialCondition,
        "businnessDetails": formData.businnessDetails,
        "isExpired": this.isExpiredVoter.value == true ? 1 : 0,
        "prominentLeaderId": formData.prominentLeaderId || 0,
        "whyIsPostal": formData.whyIsPostal,
        "isWrongMobileNo": 0,
        "pollingAgent": 0,
        "isPadvidhar": parseInt(formData.isPadvidhar),
        "isVerified": 1,
        "isDeleteFamilyMember": isDeleteFamilyMember,
        "modifiedBy": this.commonService.loggedInUserId(),
        "localAreaId": formData.localAreaId || 0,
      }
      this.spinner.show();
      let urlType;
      let urlName;
      formData.Id == 0 ? urlType = 'POST' : urlType = 'PUT'
      formData.Id == 0 ? urlName = 'ClientMasterWebApi/VoterCRM/InsertVoterDetails_1_0' : urlName = 'ClientMasterWebApi/VoterCRM/UpdateVoterDetails_1_0'

      this.callAPIService.setHttp(urlType, urlName, false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.submittedVP = false;
          this.disableDiv = true;
          this.searchAdd.setValue('');
          (this.voterProfileForm.value.head == 'yes' && this.finalSubmitFMemberCheckFlag) ? this.createFamilyTree() : '';
          (this.voterProfileData?.head == "yes" && !this.finalSubmitFMemberCheckFlag) ? this.getVoterprofileFamilyData() : '';
          this.voterProfileForm.value.comment ? this.getVPPoliticalInfluenceData() : '';
          this.voterProfileForm.controls['isNameChange'].setValue('');
          this.toastrService.success(res.statusMessage);
          this.getVoterProfileData('refreshFlag');
          this.finalSubmitFMemberCheckFlag = false; this.getFamilyChildArray = []; this.submitedFamilyChildArray = [];
        } else {
          this.toastrService.error(res.statusMessage);
          this.spinner.hide();
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      });
    }
  }

  refreshUrlTab() {  // RefreshTab when Agent Id == 0 ..Pass Agent Id Updated
    if (this.voterListData.AgentId == 0) {
      let id = this.voterProfileData?.agentId + '.' + this.voterListData.ClientId + '.' + this.voterListData.VoterId + '.' + this.voterListData.ElectionId + '.' + this.voterListData.ConstituencyId
      this.router.navigate(['crm-history/' + id]);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  //.........................................Please tick wrong mobile Start Here ....................................//

  getContactlist(data: any) {
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetVoterContactlist?ClientId=' + this.voterListData?.ClientId + '&AgentId='
      + data?.agentId + '&VoterId=' + data?.voterId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.contactlistArray = res.responseData;
        let mobileNo1 = { 'otherMobileNo': this.contactlistArray?.mobileNo1, 'isVerified': this.contactlistArray?.isVerifiedMobile1, 'checkFlagMobile': 1 }
        let mobileNo2 = { 'otherMobileNo': this.contactlistArray?.mobileNo2, 'isVerified': this.contactlistArray?.isVerifiedMobile2, 'checkFlagMobile': 1 }
        this.contactlistArray.mobileNo2?.length > 9 ? this.contactlistArray?.othercontacts.unshift(mobileNo2) : '';
        this.contactlistArray.mobileNo1?.length > 9 ? this.contactlistArray?.othercontacts.unshift(mobileNo1) : '';
        let checkDublicateNumber = Object.values(this.contactlistArray.othercontacts.reduce((acc: any, cur: any) => Object.assign(acc, { [cur.otherMobileNo]: cur }), {}))
        this.contactlistArray.othercontacts = checkDublicateNumber;
      } else {
        this.contactlistArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  deleteConfirmModelContact() {
    if (this.wrongMobileNumberArray?.length == 0) {
      this.toastrService.error('Please Select Mobile Number');
      return;
    }
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.updateContactlist();
      }
    });
  }

  updateContactlist() { // delete Mobile no
    this.wrongMobileNumberArray.map((ele: any) => {
      delete ele.isVerified;
      return ele;
    })
    this.callAPIService.setHttp('PUT', 'ClientMasterApp/VoterList/SetIsWrongMobile', false, this.wrongMobileNumberArray, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        this.wrongMobileNumberArray = [];
        this.btnTextVerify = 'Verify';
        // this.getContactlist(this.voterProfileData);
        this.getVoterProfileData();
        this.getVoterprofileFamilyData();
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  onCheckWrongContactNumber(mobileNum: any, flag: any) {
    flag == 1 ? this.btnTextVerify = 'UnVerify' : this.btnTextVerify = 'Verify';
    this.wrongMobileNumberArray = [];
    let obj = {
      "voterId": this.voterProfileData.voterId,
      "isWrongMobileNo": 1,
      "isVerified": flag == 1 ? 0 : 1,
      "mobileNo": mobileNum,
      "clientId": this.voterListData.ClientId,
      "userId": this.voterListData?.AgentId > 0 ? this.voterListData?.AgentId : this.commonService.loggedInUserId()
    }
    this.wrongMobileNumberArray.push(obj);
  }

  updateVerifiedMobileNo() { // Verified Mobile code
    if (this.wrongMobileNumberArray.length == 0) {
      this.toastrService.error('Please Select Mobile Number');
      return;
    }
    this.wrongMobileNumberArray.map((ele: any) => {
      delete ele.isWrongMobileNo;
      return ele;
    })
    this.callAPIService.setHttp('PUT', 'ClientMasterApp/VoterList/SetIsVerifiedMobile', false, this.wrongMobileNumberArray, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        this.getContactlist(this.voterProfileData);
        this.btnTextVerify = 'Verify';
        this.getVoterprofileFamilyData();
        this.wrongMobileNumberArray = [];
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.........................................Please tick wrong mobile End Here ....................................// 

  //.........................................Conflicted Data Code Start Here ....................................// 

  getIsConflictDataFlag() {
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetIsConflictData?ClientId=' + this.voterListData?.ClientId + '&AgentId='
      + this.voterListData?.AgentId + '&VoterId=' + this.voterListData?.VoterId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.isConflictCheckFlag = res.responseData.isConflict;
        this.isConflictCheckFlag == 1 ? this.getConflictData() : '';
      } else {
        this.isConflictCheckFlag = '';
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  getConflictData() {
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/VoterCRM/GetConflictData?ClientId=' + this.voterListData?.ClientId + '&VoterId=' + this.voterListData?.VoterId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.conflictDataArray = res.responseData;
      } else {
        this.conflictDataArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  deleteConfirmModel(obj: any) {
    this.conflictRecordDelObj = obj;
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteNotifications();
      }
    });
  }

  deleteNotifications() {
    this.callAPIService.setHttp('DELETE', 'ClientMasterWebApi/VoterCRM/DeleteConflictRecord?ClientId=' + this.conflictRecordDelObj?.clientId + '&VoterId=' + this.conflictRecordDelObj?.voterId
      + '&Deletedby=' + this.commonService.loggedInUserId() + '&AgentId=' + this.conflictRecordDelObj?.agentId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.toastrService.success(res.statusMessage);
        this.conflictDataArray = [];
        this.getConflictData();
      } else {
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.........................................Conflicted Data Code End Here ....................................// 

  //......................................... Address Code Start Here ..................................................//

  geocoder: any;
  addLatitude: any = 19.0898177;
  addLongitude: any = 76.5240298;
  addPrevious: any;
  addressNameforAddress: any;
  copyAddressNameforAddress: any;
  @ViewChild('searchAddress') public searchElementRefAddress!: ElementRef;
  searchAdd = new FormControl('');
  addressMarkerShow: boolean = true;
  @ViewChild('searchAddressModel') searchAddressModel: any;

  searchAddress() {
    this.mapsAPILoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRefAddress.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.addLatitude = place.geometry.location.lat();
          this.addLongitude = place.geometry.location.lng();
          // this.newAddedAddressLat = place.geometry.location.lat();
          // this.newAddedAddressLang = place.geometry.location.lng();
          this.findAddressByCoordinates();
          this.addressMarkerShow = true;
        });
      });
    });
  }

  markerAddressDragEnd($event: MouseEvent) {
    this.addLatitude = $event.coords.lat;
    this.addLongitude = $event.coords.lng;
    // this.newAddedAddressLat = $event.coords.lat;
    // this.newAddedAddressLang = $event.coords.lng;
    this.findAddressByCoordinates();
    this.addressMarkerShow = true;
  }

  findAddressByCoordinates() {
    this.geocoder.geocode({
      'location': {
        lat: this.addLatitude,
        lng: this.addLongitude
      }
    }, (results: any) => {
      this.findAddress(results[0]);
    });
  }

  findAddress(results: any) {
    if (results) {
      this.addressNameforAddress = results.formatted_address;
      // this.copyAddressNameforAddress = results.formatted_address;
      this.addressZoomSize = 12;
      this.searchAdd.setValue(this.addressNameforAddress);
    }
  }

  clickedAddressMarker(infowindow: any) {
    if (this.addPrevious) {
      this.addPrevious.close();
    }
    this.addPrevious = infowindow;
  }

  newAddedAddressLat: any;
  newAddedAddressLang: any;
  // addBtnaddressFlag: boolean = false;

  addAddress() {
    this.voterProfileForm.controls['area'].setValue(this.addressNameforAddress);
    this.searchAdd.setValue(this.addressNameforAddress);
    this.copyAddressNameforAddress = this.addressNameforAddress;
    this.newAddedAddressLat = this.addLatitude; 
    this.newAddedAddressLang = this.addLongitude;
    this.searchAddressModel.nativeElement.click();
    // this.addBtnaddressFlag = true;
  }

  clearAddress() {
    this.addressMarkerShow = false;
    this.searchAdd.setValue('');
    this.addressZoomSize = 6;
    this.addressNameforAddress = '';
    this.addLatitude = 19.0898177;
    this.addLongitude = 76.5240298;
  }

  openAddressModel() {
    this.addressZoomSize = 6;
    this.searchAdd.setValue(this.copyAddressNameforAddress);
    this.addLatitude = this.newAddedAddressLat;
    this.addLongitude = this.newAddedAddressLang;
    this.copyAddressNameforAddress ? this.addressMarkerShow = true : this.addressMarkerShow = false;
    this.addressNameforAddress = this.copyAddressNameforAddress;
  }

  //.........................................Address code End Here ....................................//

  //.........................................Migrated Address to get Pincode Code Start Here ..................................................//

  latitude: any;
  longitude: any;
  previous: any;
  cityName: any;
  copyCityName:any;
  addressName: any;
  copyAddressName: any;
  @ViewChild('searchMigrated') public searchElementRef!: ElementRef;
  searchMigratedAdd = new FormControl('');
  addressMigratedMarkerShow: boolean = true;
  @ViewChild('searchMigratedAddressModel') searchMigratedAddressModel: any;

  searchMigratedAddress() {
    this.mapsAPILoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.findMigratedAddressByCoordinates();
          this.addressMigratedMarkerShow = true;
        });
      });
    });
  }

  markerMigratedDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.findMigratedAddressByCoordinates();
    this.addressMigratedMarkerShow = true;
  }

  findMigratedAddressByCoordinates() {
    this.geocoder.geocode({
      'location': {
        lat: this.latitude,
        lng: this.longitude
      }
    }, (results: any) => {
      this.findMigratedAddress(results[0]);
    });
  }

  findMigratedAddress(results: any) {
    if (results) {
      this.addressName = results.formatted_address;
      results.address_components.forEach((element: any) => {
        if (element.types[0] == "locality") {
          this.cityName = element.long_name;
        }
        this.migratedZoomSize = 12;
        this.searchMigratedAdd.setValue(this.addressName);
      });
    }
  }

  clickedMigratedMarker(infowindow: any) {
    if (this.previous) {
      this.previous.close();
    }
    this.previous = infowindow;
  }
  
  newAddedMigratedAddressLat: any;
  newAddedMigratedAddressLang: any;
  // addBtnaddressFlag: boolean = false;

  addMigratedAddress() {
    this.voterProfileForm.controls['migratedCity'].setValue(this.cityName);
    this.voterProfileForm.controls['migratedArea'].setValue(this.addressName);
    this.searchMigratedAdd.setValue(this.addressName);
    this.copyAddressName = this.addressName;
    this.copyCityName = this.cityName;
    this.newAddedMigratedAddressLat = this.latitude; 
    this.newAddedMigratedAddressLang = this.longitude;
    this.searchMigratedAddressModel.nativeElement.click();
    // this.addBtnaddressFlag = true;
  }

  clearMigratedAddress() {
    this.addressMigratedMarkerShow = false;
    this.searchMigratedAdd.setValue('');
    this.migratedZoomSize = 6;
    this.addressName = '';
    this.cityName = '';
    this.latitude = 19.0898177;
    this.longitude = 76.5240298;
  }

  openMigratedAddressModel() {
    this.migratedZoomSize = 6;
    this.searchMigratedAdd.setValue(this.copyAddressName);
    this.latitude = this.newAddedMigratedAddressLat;
    this.longitude = this.newAddedMigratedAddressLang;
    this.copyAddressName ? this.addressMigratedMarkerShow = true : this.addressMigratedMarkerShow = false;
    this.addressName = this.copyAddressName;
    this.cityName = this.copyCityName;
  }

  //.........................................Migrated Address to get Pincode Code End Here ....................................//

}
