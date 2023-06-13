import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Gallery, GalleryItem, ImageItem, ThumbnailsPosition, ImageSize } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';
import { AgmInfoWindow } from '@agm/core/directives/info-window';

@Component({
  selector: 'app-voters-profile',
  templateUrl: './voters-profile.component.html',
  styleUrls: ['./voters-profile.component.css']
})
export class VotersProfileComponent implements OnInit, OnDestroy {
  voterProfileData: any;
  voterListData: any;
  posNegativeInfData: any;
  VPCommentData: any;
  voterHasVisitTypesData: any;
  voterVisitDetailDataArray: any = [];
  comUserdetImg: any;
  programGalleryImg!: GalleryItem[];
  lat: any = 19.75117687556874;
  lng: any = 75.71630325927731;
  zoom: any = 6;
  VPVotersonmapData: any;
  voterProfileFamilyData: any;
  HighlightRow: any;
  MigInfoHide: boolean = false;
  voterProfileBoothAgentData: any;
  VPMemberDetailsData: any;
  AgentId: any;
  globlAgentId: any;
  checkedActiveClass: any;
  clickOnCardFlag: boolean = false;
  profileImg: any;
  GlobalAgentId: any;
  selectedVoterIdObj: any;
  previousInfoWindow!: AgmInfoWindow;
  VPMemberDetailsCommentsData: any;


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public gallery: Gallery,
    public lightbox: Lightbox,
  ) {

    let getUrlData: any = this.route.snapshot.params.id;
    if (getUrlData) {
      getUrlData = getUrlData.split('.');
      this.voterListData = { 'AgentId': +getUrlData[0], 'ClientID': +getUrlData[1], 'VoterId': +getUrlData[2] }
    }
  }
  
  ngOnInit(): void {
    this.getVoterProfileData();
    this.getVPPoliticalInfluenceData();
    //this.getVoterHasVisitTypeData();
    this.getVPVotersonmap();
    this.getVoterprofileFamilyData();
    this.GlobalAgentId = this.voterListData.AgentId;
    this.getVoterVisitDetailData();
  }

  agentFilledData(data: any) {
    this.voterVisitDetailDataArray = [];
    // this.VPCommentData = [];
    // this.posNegativeInfData = [];
    this.GlobalAgentId = null;
    this.checkedActiveClass = data.AgentId;
    this.voterListData.AgentId = data.AgentId;
    this.MigInfoHide = false;
    this.getVoterProfileData();
    this.getVPPoliticalInfluenceData();
    //this.getVoterHasVisitTypeData();
    this.getVPVotersonmap();
    this.getVoterprofileFamilyData();
    this.getVoterVisitDetailData();
  }

  // Get Voter Profile Data.....................

  getVoterProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Voter_Profile?ClientId=' + this.voterListData.ClientID + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        let obj = res.data1[0];
        this.checkValueNullOrUnd(obj);
        // this.voterProfileBoothAgentData = res.data2
        this.clickOnCardFlag == false ? this.voterProfileBoothAgentData = res.data2 : '';
        // click on first agent 
        setTimeout(() => {
          if (this.clickOnCardFlag == false) {
            let clickFirstCard = document.getElementById('btnradio0');
            clickFirstCard?.click();
            this.clickOnCardFlag = true
          }
        }, 500);

      } else {
        this.spinner.hide();
        this.voterProfileBoothAgentData = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //.........................  check Value Null Or Undefine Only Single Object  .........................//

  checkValueNullOrUnd(obj: any) {
    Object.keys(obj).map((key: any) => {
      if (obj[key] == undefined || obj[key] == null) {
        obj[key] = "";
        return obj[key];
      }
    });
    this.voterProfileData = obj;
  }
  // data1: get ostive Negative Influence & data2: get Comment Data  //

  getVPPoliticalInfluenceData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Voterprofile_Political_Influence?ClientId=' + this.voterListData.ClientID + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        res.data1 == "" ? this.VPCommentData = [] : this.VPCommentData = res.data1;
         res.data2 == "" ?   this.posNegativeInfData = [] : this.posNegativeInfData = res.data2;
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

  //........ get Voter Has Visit Type Id...........// 

  // getVoterHasVisitTypeData() {
  //   this.spinner.show();
  //   this.callAPIService.setHttp('get', 'Web_VoterHas_VisitTypes?ClientId=' + this.voterListData.ClientID + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
  //  this.callAPIService.getHttp().subscribe((res: any) => {
  //     if (res.data == 0) {
  //       this.spinner.hide();
  //       this.voterHasVisitTypesData = res.data1;
     
  //       // ----------------- get voter Visit Details Bind  by  VoterId  start here -------------------------//
  //       //if (this.voterHasVisitTypesData.lenght != 0) {
  //       //  this.voterHasVisitTypesData.forEach((element: any) => {
  //       //    this.getVoterVisitDetailData(element.VistitTypeId);
  //       //  });
  //       //}

  //       // ----------------- get voter Visit Details Bind  by  VoterId  end here -------------------------//
  //     } else {
  //       this.spinner.hide();
  //       this.voterHasVisitTypesData = [];
  //     }
  //   }, (error: any) => {
  //     this.spinner.hide();
  //     if (error.status == 500) {
  //       this.router.navigate(['../500'], { relativeTo: this.route });
  //     }
  //   })
  // }

  //........ get get Voterprofile Family Data ...........//    

  getVoterprofileFamilyData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Voterprofile_Family?ClientId=' + this.voterListData.ClientID + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterProfileFamilyData = res.data1;

                  //....... this Senario Call to when Family member Div SHOW & call getVPMemberDetailsData().......Start code.........//
        this.voterProfileFamilyData.map((ele: any) => {
          if (ele.VoterId == this.voterListData.VoterId) {
            this.selectedVoterIdObj = { VoterId: ele.VoterId, FamilyHead: ele.FamilyHead,SrNo:ele.SrNo };
          }
        })

        if (this.selectedVoterIdObj.FamilyHead == 0 && this.selectedVoterIdObj.VoterId == this.voterListData.VoterId) {
          let obj = { ClientId: this.voterListData.ClientID, AgentId: this.voterListData.AgentId, VoterId: this.selectedVoterIdObj.VoterId }
          this.getVPMemberDetailsData(obj);
          this.MigInfoHide = true;
          this.HighlightRow = this.selectedVoterIdObj.SrNo
        }

                  //.........................End Code..............................//

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

  //.................... Get Voter Profile Member Details Data .......................//

  getVPMemberDetailsData(FMobjData: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Voter_Profile_Member_Details?ClientId=' + FMobjData.ClientId + '&AgentId=' + FMobjData.AgentId + '&VoterId=' + FMobjData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.VPMemberDetailsData = res.data1[0];
        this.VPMemberDetailsCommentsData = res.data2;
        this.VPMemberDetailsCommentsData == "" ? this.VPMemberDetailsCommentsData =[] : this.VPMemberDetailsCommentsData ;
      } else {
        this.VPMemberDetailsData = [];
        this.VPMemberDetailsCommentsData =[];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //............................. Get Family Member Data ................................//    

  familyMemberData(FMobjData: any) {
    // FMobjData.VoterId != this.voterListData.VoterId
    if (FMobjData.FamilyHead != 1) {
      this.HighlightRow = FMobjData.SrNo;
      this.MigInfoHide = true;
      this.VPMemberDetailsCommentsData =[];
      this.getVPMemberDetailsData(FMobjData);
      this.ScrollToFamilyMemberData();
    } else {
      this.MigInfoHide = false;
      this.HighlightRow = '';
    }
  }


  //........................ Scroll Family member Details ................................//
  ScrollToFamilyMemberData() {
    window.scrollTo({
      top: 20,
      left: 50,
      behavior: 'smooth'
    });
  }


  //........................ get Voter Visit Details Data ................................//                    

  getVoterVisitDetailData() {
    this.spinner.show();
    //this.callAPIService.setHttp('get', 'Web_Voter_Visit_Details?ClientId=' + 2 + '&AgentId='+ 5 + '&VoterId='+ 342671 + '&VisitTypeId='+ VisitTypeId , false, false, false, 'electionServiceForWeb');
    this.callAPIService.setHttp('get', 'Web_Voter_Visit_Details?ClientId=' + this.voterListData.ClientID + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId + '&VisitTypeId=' + 0, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterVisitDetailDataArray = res.data1;
        //let voterVisitDetailData = res.data1[0];
        //this.voterVisitDetailDataArray.push(voterVisitDetailData);
      } else {
        this.spinner.hide();
        this.voterVisitDetailDataArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  // ............................... Gallary LightBox code .............................  //
  showGallaryLightbox(data: any) {
    this.comUserdetImg = data.VisitPhoto.split(',');
    this.comUserdetImg = this.commonService.imgesDataTransform(this.comUserdetImg, 'array');
    this.gallery.ref('lightbox').load(this.comUserdetImg);
  }

  //........................... get Voter Profile Voters on map .............................//

  getVPVotersonmap() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Voter_Profile_Voters_on_map?ClientId=' + this.voterListData.ClientID + '&AgentId=' + this.voterListData.AgentId + '&VoterId=' + this.voterListData.VoterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.VPVotersonmapData = res.data1;
      } else {
        this.spinner.hide();
        this.VPVotersonmapData = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ngOnDestroy() {
    localStorage.removeItem('voter-profile');
  }

  //........................ Show Profile Photo in FullSize in LightBox..............................//

  showProfileLightbox(asd: any) {
    this.profileImg = [asd];
    this.profileImg = this.commonService.imgesDataTransform(this.profileImg, 'array');
    this.gallery.ref('lightbox').load(this.profileImg);
  }

  //.................... Agm Map infoWindow at a Time Only One Show .................................//

  markerClicked(agmMarker: any): void {
    this.previousInfoWindow?.close();
    
    if (agmMarker.infoWindow.length) {
      this.previousInfoWindow = agmMarker.infoWindow.first as AgmInfoWindow;
    }
  }

  //....................................................... Redirect To CRM History Page Code Start ..........................................//

  redirectToCRMHistoryPage(){
    let obj = {
      'agentId' : this.voterListData.AgentId,
      'clientId': this.voterListData.ClientID,
      'voterId': this.voterListData.VoterId,
      'ElectionId': 0,
      'ConstituencyId': 0
    }   
    window.open('crm-history/' + obj.agentId + '.' + obj.clientId + '.' + obj.voterId + '.' + obj.ElectionId + '.' + obj.ConstituencyId);
  }

  //....................................................... Redirect To CRM History Page code End..........................................//

}
