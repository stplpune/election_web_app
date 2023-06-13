import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-voter-call-entries',
  templateUrl: './voter-call-entries.component.html',
  styleUrls: ['./voter-call-entries.component.css']
})
export class VoterCallEntriesComponent implements OnInit {

  getFeedbacksList:any;
  getFeedbacksListTotal:any;
  feedbacksPaginationNo:number = 1;
  feedbacksPageSize:number = 10;
  
  feedbackTypeArray = [{id:1, name:'Positive'},{id:2, name:'Negitive'},{id:3, name:'Neutral'}]
  enterNewFeedbackForm!:FormGroup;
  submitted:boolean = false;
  voterListData: any;
  voterProfileData: any;
  voterProfileFamilyData: any;
  VPCommentData: any;
  posNegativeInfData: any;
  Date:any = new Date();
  max = new Date();

  constructor(
    public dialogRef: MatDialogRef<VoterCallEntriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb:FormBuilder,
    private commonService: CommonService,
    private toastrService : ToastrService,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private datePipe: DatePipe,
    ) { dateTimeAdapter.setLocale('en-IN');
        this.voterListData = this.data;}

  ngOnInit(): void {
    this.defaultFeedbackForm();
    this.feedbacksList();
    this.getVoterProfileData();
    this.getVPPoliticalInfluenceData();
    this.getVoterprofileFamilyData();
  }

  defaultFeedbackForm(){
    this.enterNewFeedbackForm = this.fb.group({
      Id:[0],	
      FeedBackType:	['',Validators.required],
      Description:[''],	
      FollowupDate:['',Validators.required],
      NotToCall:[0],
    })
  }

  get f() { return this.enterNewFeedbackForm.controls };

                    //............................. Get Feedbacks List................................//

  feedbacksList(){
    this.spinner.show();
    let obj: any = 'VoterId='+ this.voterListData.VoterId +'&nopage='+this.feedbacksPaginationNo + '&ClientId='+ this.voterListData.ClientId ;
    this.callAPIService.setHttp('get', 'Get_Electioncrm_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getFeedbacksList = res.data1;
        this.getFeedbacksListTotal = res.data2[0].TotalCount;
      } else {
        this.getFeedbacksList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

                         //............................. Insert Feedbacks Election Data................................//
  
 onSubmitFeedbackForm(){
     this.submitted = true;
     if (this.enterNewFeedbackForm.invalid) {
      this.spinner.hide();
      return;
    } else {
       this.spinner.show();
       let data = this.enterNewFeedbackForm.value;
       data.NotToCall == true ? data.NotToCall = 1 : data.NotToCall = 0 ;
       data.FollowupDate = this.datePipe.transform(data.FollowupDate, 'yyyy/MM/dd HH:mm:ss');
       this.Date = this.datePipe.transform(this.Date, 'yyyy/MM/dd HH:mm:ss');

       let obj = 'Id='+ data.Id + '&VoterId='+ this.voterListData.VoterId + '&FeedBackDate='+ this.Date + '&FeedBackType='+ data.FeedBackType 
       + '&Description='+ data.Description + '&FollowupDate='+ data.FollowupDate + '&CreatedBy='+ this.commonService.loggedInUserId() + '&NotToCall='+ data.NotToCall + '&ClientId='+ this.voterListData.ClientId ;

       this.callAPIService.setHttp('get', 'Insert_Electioncrm_1_0?' + obj, false, false, false, 'electionServiceForWeb');
       this.callAPIService.getHttp().subscribe((res: any) => {
         if (res.data == 0) {
           this.toastrService.success(res.data1[0].Msg);
           this.spinner.hide();
           this.feedbacksList();
           this.clearForm();
           this.submitted = false;
         } else {
           this.spinner.hide();
         }
       }, (error: any) => {
         if (error.status == 500) {
           this.router.navigate(['../500'], { relativeTo: this.route });
         }
       })
     }
   }

                              //........................ Get Voter Profile Data.....................//

  getVoterProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Voter_Profile_CRM?ClientId=' + this.voterListData.ClientId + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        let obj  = res.data1[0];
        this.checkValueNullOrUnd(obj);
       // this.voterProfileBoothAgentData = res.data2;
     } else {
        this.spinner.hide();
      //  this.voterProfileBoothAgentData = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  checkValueNullOrUnd(obj:any){
    Object.keys(obj).map((key:any)=> {
      if (obj[key]==undefined || obj[key]==null) {
        obj[key] = "";
        return obj[key];
      }
    });
    this.voterProfileData = obj;
  }

                          //............. get get Voterprofile Family Data ...............//    

  getVoterprofileFamilyData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Voterprofile_Family?ClientId=' + this.voterListData.ClientId + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterProfileFamilyData = res.data1;
      } else {
        this.voterProfileFamilyData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

                              // data1: get ostive Negative Influence & data2: get Comment Data  //

  getVPPoliticalInfluenceData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Voterprofile_Political_Influence?ClientId=' + this.voterListData.ClientId + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.VPCommentData = res.data1;
        this.posNegativeInfData = res.data2;
      } else {
        this.VPCommentData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  onNoClick(text:any): void {
    this.dialogRef.close(text);
  }

  clearForm(){
    this.defaultFeedbackForm();
    this.submitted = false;
  }

  onClickPagintion(pageNo: number) {
    this.feedbacksPaginationNo = pageNo;
    this.feedbacksList();
  }

  voterDateRangeSelect(asd:any){

  }
  
}
