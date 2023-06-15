import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-recent-post-details',
  templateUrl: './recent-post-details.component.html',
  styleUrls: ['./recent-post-details.component.css']
})
export class RecentPostDetailsComponent implements OnInit {
  Liked: boolean = false;
  comments: boolean = false;
  Shared: boolean = false;
  ListView: boolean = false;
  MapView: boolean = false;
  activitieDetails: any;
  resLikesList: any;
  activityId: any;
  resCommentsList_1_0: any;
  resInsLikesList: any;
  Comment = new FormControl();
  pageNo: any;
  loginUserId: any;
  viewDataArray: any;

  constructor(
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    public dialogRef: MatDialogRef<RecentPostDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.loginUserId = this.commonService.loggedInUserId();
    this.activitieDetails = this.data.data;
    console.log(this.activitieDetails)
    this.pageNo = this.data.pageNo;
    this.activityId = this.activitieDetails.Id;
    this.getLikesList(this.activityId)
  }

  dashboardActivities(flag: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Dashboard_Activities_Web?UserId=' + this.commonService.loggedInUserId() + '&PageNo=' + this.pageNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        let getObjByActivityId = res.data1;
        getObjByActivityId.forEach((ele: any) => {
          if (ele.Id == this.activityId) {
            this.activitieDetails = ele;
          }
        })
        if (flag == 'comments') {
          this.getCommentsList(this.activityId);
        } else if (flag == 'likes') {
          this.getLikesList(this.activityId);
        }
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getLikesList(activityId: any) {
    // this.insertLikesList(activityId);
    this.spinner.show();
    this.callAPIService.setHttp('get', 'GetLikesList_1_0?ActivityId=' + activityId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resLikesList = res.data1;
        this.spinner.hide();
      } else {
        this.resLikesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    });
  }

  insertLikesList(activityId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'InsertLikes_1_0?ActivityId=' + activityId + '&LikeTypeId=1&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resInsLikesList = res.data1;
        this.dashboardActivities('likes')
        this.spinner.hide();
      } else {
        this.resLikesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  viewListdata(activityId: any , flag:any) { //view and Shared Api
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetActivityLikes_1_0?ActivityId=' + activityId + '&flag='+ flag , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.viewDataArray = res.data1;
        console.log(this.viewDataArray)
      } else {
        this.spinner.hide();
        this.viewDataArray = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getCommentsList(activityId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'GetCommentsList_1_0?ActivityId=' + activityId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resCommentsList_1_0 = res.data1;
        this.spinner.hide();
      } else {
        this.resCommentsList_1_0 = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  // Comments function's start here
  submitComment() {
    if (this.Comment.value == '' || this.Comment.value == null || this.Comment.value == undefined) {
      this.toastrService.error('Comment is required');
      return
    }
    this.insertCommentsList(this.activityId)
  }

  cancel() {
    this.Comment.reset();
  }

  insertCommentsList(activityId: any) {
    this.spinner.show();
    let obj = 'Id=0&ActivityId=' + activityId + '&Comments=' + this.Comment.value + '&UserId=' + this.commonService.loggedInUserId();
    this.callAPIService.setHttp('get', 'Insert_Comments_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.Comment.reset();
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        // this.Comment.setValue('');
        this.dashboardActivities('comments');
        this.spinner.hide();
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  deleteComments(id: any) {
    this.spinner.show();
    let obj = 'Id=' + id + '&ActivityId=' + this.activityId + '&UserId=' + this.commonService.loggedInUserId();
    this.callAPIService.setHttp('get', 'DeleteComments_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.error(res.data1[0].Msg);
        this.dashboardActivities('comments');
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  // Comments function's end here

  socialMediaCheck(flag: any) {
    flag == 'Liked' ? (this.Liked = true, this.comments = false, this.Shared = false , this.ListView = false) : '';
    flag == 'ListView' ? (this.ListView = true, this.comments = false, this.Shared = false , this.Liked = false) : '';
    flag == 'Comments' ? (this.comments = true, this.Liked = false, this.Shared = false , this.ListView = false) : '';
    flag == 'Shared' ? (this.Shared = true, this.comments = false, this.Liked = false , this.ListView = false) : '';
  }


  onNoClick(text: any): void {
    this.spinner.hide();
    this.dialogRef.close(text);
  }

}
