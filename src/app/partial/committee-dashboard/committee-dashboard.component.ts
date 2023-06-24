import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
declare var $: any
import { debounceTime } from 'rxjs/operators';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import { DateTimeAdapter } from 'ng-pick-datetime';
import { DatePipe } from '@angular/common';
import { AddCommitteeComponent } from '../dialogs/add-committee/add-committee.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../dialogs/delete/delete.component';
import { AddMemberComponent } from '../dialogs/add-member/add-member.component';
import { ChartComponent } from "ng-apexcharts";

@Component({
  selector: 'app-committee-dashboard',
  templateUrl: './committee-dashboard.component.html',
  styleUrls: ['./committee-dashboard.component.css'],
  providers: [DatePipe]
})
export class CommitteeDashboardComponent implements OnInit {

  resultCommittees: any;
  resultOrganizationMember: any;
  activeRow: any;
  selCommitteeName: any;
  // districtName = "Maharashtra State";
  defaultCommitteesFlag: boolean = false;
  defaultMembersFlag: boolean = false;
  globalBodyId: any;
  defaultCloseBtn: boolean = false;
  allDistrict: any;
  selectedDistrictId: any;
  // selDistrict = new FormControl();
  fromToDate = new FormControl();
  Search = new FormControl('');
  subject: Subject<any> = new Subject();
  searchFilter = "";
  // DistrictId: any; //DistrictId fetch Work this Week Page
  fromDate: any = '';
  toDate: any = '';
  clearDataFlag: any;
  DistWiseCommityWGraphArray: any;
  graphInstance: any;
  graphInstance1: any;
  loggedDistrictId: any;
  loggedUserTypeId: any;
  allowClear: boolean = true;
  allDistrictMaharashta: any;
  CommitteeId: any;
  committeeName: any;
  selCommiteeFlag: boolean = true;
  onClickFlag:boolean = false;
  allLevels: any;
  CheckBoxLevelArray: any = [];
  CheckBoxLevelArrayJSON: any;
  CompofComityHide : boolean = true;
  hideComityGraph : boolean = false;
  bodyMember!:FormGroup;
  addMemberFlag: any;
  bodyMemberDetails: any;
  mobileNoValue: any;
  submitted: boolean = false;
  @ViewChild('addMemberModal') addMemberModal: any;
  @ViewChild('closeAddMemberModal') closeAddMemberModal: any;
  dataAddEditMember: any;
  bodyId: any;
  userPostBodyId: any;
  allDesignatedMembers: any;
  TotalWorkAndIosCount: any;
  DesignationNameBYBodyId: any;
  resultBodyMemActDetails: any;
  subCommitteeName: any;
  commiteeObj:any;
  globalbodylevel:any;

  subject1: Subject<any> = new Subject();
  searchFilter1 = "";
  hideMemberDetailsField : boolean = false;
  UserIdForRegMobileNo = '';
  committeeNameBOMember: any;

  @ViewChild("chart") chart: ChartComponent | undefined;
  chartOptions: any;
  talukaPresidentDashObj!:object;
  BarchartOptions:any
  talukaPresidentDashArray=new Array();
  talukaIMPleaderArray=new Array();
  talukaPresidentDataArray=new Array();
  impLeadersArray=new Array();
  impLeaderDetails=new Array();
  presidentDetailsObj:any;
  barChartShow:boolean=false;
  pieChartShow:boolean=false;

  constructor(private commonService: CommonService, private toastrService: ToastrService,
    private spinner: NgxSpinnerService, private router: Router, private fb: FormBuilder, public datePipe: DatePipe,
    private route: ActivatedRoute, private callAPIService: CallAPIService, public location: Location, 
    private datepipe:DatePipe,
    public dialog: MatDialog, public dateTimeAdapter: DateTimeAdapter<any>) {
    { dateTimeAdapter.setLocale('en-IN'); }
    let getsessionStorageData: any = sessionStorage.getItem('DistrictIdWorkThisWeek');
    if(getsessionStorageData){
      let DistrictId = JSON.parse(getsessionStorageData);
      // this.DistrictId = DistrictId.DistrictId;
      this.CommitteeId = DistrictId.CommitteeId;
      this.committeeName = DistrictId.committeeName;
    }
  }

  ngOnInit(): void {
    this.loggedUserTypeId = this.commonService.loggedInSubUserTypeId();
    this.getDistrict();
  }

  svgMapColorReset() {
    $('#mapsvg1 path').css('fill', '#7289da');
  }

  ngAfterViewInit() {
    this.callSVGMap() // default call SVG MAP
    // this.DistrictId == "" || this.DistrictId == undefined ? this.DistrictId = 0 : this.DistrictId = this.DistrictId;
    //this.selectDistrict(this.DistrictId); 10/01/22

    $(document).on('click', '#mapsvg1  path', (e: any) => { // add on SVG Map
      this.hideComityGraph= false;
      this.CheckBoxLevelArray = [];
      this.onClickFlag = true;
      this.defaultMembersFlag = false;
      let getClickedId = e.currentTarget;
      let distrctId = $(getClickedId).attr('id');
      // this.DistrictId = 0;
      this.selectedDistrictId = distrctId;
      this.toggleClassActive(Number(distrctId));
      // this.getOrganizationByDistrictId(Number(distrctId));
    });
  }

  callSVGMap() {
    this.showSvgMap(this.commonService.mapRegions());
  }

  addClasscommitteeWise() {
    $('#mapsvg1  path').addClass('notClicked');
    setTimeout(() => {
      this.allDistrict.find((element: any) => {
        $('#mapsvg1  path[id="' + element.districtId + '"]').addClass('clicked');
        $('#mapsvg1  #'+element.districtName).text(element.boothCommittee )
      });
    }, 500);
  }

  toggleClassActive(distrctId: any) {
    let checksvgDistrictActive = $('#mapsvg1  path').hasClass("svgDistrictActive");
    checksvgDistrictActive == true ? ($('#mapsvg1  path').removeClass('svgDistrictActive'), $('#mapsvg1  path#' + distrctId).addClass('svgDistrictActive')) : $('#mapsvg1  path#' + distrctId).addClass('svgDistrictActive');;
  }

  ngOnDestroy() {
    sessionStorage.removeItem('DistrictIdWorkThisWeek');
    if (this.graphInstance) {
      this.graphInstance.destroy();
    }
    if (this.graphInstance1) {
      this.graphInstance1.destroy();
    }
  }

  getDistrict() {
    var usrData = this.commonService.getLoggedUserStateData();
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&StateId='+ usrData?.StateId || 0 +'&DivisionId='+ usrData?.DivisionId || 0 +'&DistrictId=' + usrData?.DistrictId || 0 + '&TalukaId=' + usrData?.TalukaId || 0;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebDashbordState' + req, false, false, false, 'electionMicroSerApp'); //old API  Web_GetDistrict_1_0_Committee
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.responseData && res?.responseData.length != 0) {
        this.allDistrict = res.responseData;
        // this.districtWiseCommityWorkGraph(id); 10/01/22
        
        this.selectedDistrictId=3;//this.allDistrict[0]?.districtId  
        this.svgMapClick('Default');
        this.addClasscommitteeWise(); 
        
        // this.onClickFlag == false ?  $('#mapsvg1  path#' + this.selectedDistrictId).addClass('svgDistrictActive') : '';
       
        //  id == undefined ||   id == null ||  id == ""  ? '': this.toggleClassActive(id);
        this.selectedDistrictId ? $('path#' + this.selectedDistrictId).addClass('svgDistrictActive') : this.toggleClassActive(0);
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }
//------------  get Pie Chart Details --------------------------------
  bindPieChartDataForTalukaPresident(distId?:any){
    this.spinner.show();
    
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + distId || 0;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebDashbordDistrictDetailState'+req, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode == '200') {
        this.presidentDetailsObj=res?.responseData;
        this.talukaPresidentDashObj = res?.responseData1;
        this.impLeadersArray=res?.responseData2;
        this.constructPieChart(this.talukaPresidentDashObj)
      } else {
        this.talukaPresidentDashObj = [];
        this.presidentDetailsObj=[];
        this.impLeadersArray=[];
        this.pieChartShow=false;
      }
    }, (error: any) => {
      this.spinner.hide();
      this.pieChartShow=false;
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
    
    this.bindBarChartDataForTalukaPresident(distId)
  }
  constructPieChart(obj:any){
    this.pieChartShow =( obj?.totalBoothCommittee >1 || obj?.totalBooths >1 )? true:false;
    this.chartOptions = {
      series: [ obj?.totalBoothCommittee, obj?.totalBooths,],
      chart: {
        width: 380,
        type: "pie"
      },
      labels: ["Total Booth Committee", "Total Booths", ],
      colors:['#f89e14','#297af0'], 
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "top"
            }
          }
        }
      ],
      legend:{
        show: true,
        position: 'bottom'
      },
    };
  }

  // --------------------------------------  Construct BarChart  -----------------------
  bindBarChartDataForTalukaPresident(distId?:any){
    this.spinner.show();
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + distId || 0;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebTalukaWiseBoothCommitteeDashbordState'+req, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode == '200') {
        this.talukaPresidentDashArray = res?.responseData;
        const barchartBoothDataObj=this.talukaPresidentDashArray.find((x:any)=> x.totalBooths >1 || x.boothCommittee >1 )
        this.barChartShow =barchartBoothDataObj? true:false;
        this.constructBarChart(this.talukaPresidentDashArray);
      } else {
        this.talukaPresidentDashArray = [];
        this.barChartShow=false;
      }
    }, (error: any) => {
      this.spinner.hide();
      this.barChartShow=false;
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  constructBarChart(talDetailsArray:any){
    this.BarchartOptions = {
      series: [
        {
          name: "Booths ",
          data: talDetailsArray.map((x:any)=>x.totalBooths)
        },
        {
          name: "Booth Committee's",
          data: talDetailsArray.map((x:any)=>x.boothCommittee)
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show:false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
           dataLabels: {
            position: "top" 
          }
        }
      },
      
      dataLabels: {
        enabled: true,
        formatter: function(val:any) {
          return val? val : '';
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        }
      },
      
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: talDetailsArray.map((x:any)=>x.talukaName)
      },
      yaxis: {
        // title: {
        //   text: "$ (thousands)"
        // }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        enabled: false,
      }
    };
  }

  // ------------------------------ Taluka President ------------------------------

  getTalukaPresidentData(){
    this.spinner.show();
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + this.selectedDistrictId || 0;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebTalukaPresidentsDashbordState' + req, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode == '200') {
        this.talukaPresidentDataArray = res!.responseData;
      } else {
        this.talukaPresidentDataArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  /// ------------------------------  talukawise imp leaders -------------------------
  getTalukaWiseIMPLeader(){
    this.spinner.show();
     var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + this.selectedDistrictId || 0;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetTalukaWiseIMPLeader' + req, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode == '200') {
        this.talukaIMPleaderArray = res?.responseData;
      } else {
        this.talukaIMPleaderArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  // --------------------------------------- Maharashtra SVG MAP ----------------------------------------------- //

  showSvgMap(regions_m: any) {
    if (this.graphInstance) {
      this.graphInstance.destroy();
    }
    this.graphInstance = $("#mapsvg1").mapSvg({
      width: 550,
      height: 430,
      colors: {
        baseDefault: "#bfddff",
        background: "#fff",
        selected: "#7289da",
        hover: "#7289da",
        directory: "#bfddff",
        status: {}
      },
      regions: regions_m,
      viewBox: [0, 0, 763.614, 599.92],
      cursor: "pointer",
      zoom: {
        on: false,
        limit: [0, 50],
        delta: 2,
        buttons: {
          on: true,
          location: "left"
        },
        mousewheel: true
      },
      tooltips: {
        mode: "title",
        off: true,
        priority: "local",
        position: "bottom"
      },
      popovers: {
        mode: "on",
        on: false,
        priority: "local",
        position: "top",
        centerOn: false,
        width: 300,
        maxWidth: 50,
        maxHeight: 50,
        resetViewboxOnClose: false,
        mobileFullscreen: false
      },
      gauge: {
        on: false,
        labels: {
          low: "low",
          high: "high"
        },
        colors: {
          lowRGB: {
            r: 211,
            g: 227,
            b: 245,
            a: 1
          },
          highRGB: {
            r: 67,
            g: 109,
            b: 154,
            a: 1
          },
          low: "#d3e3f5",
          high: "#436d9a",
          diffRGB: {
            r: -144,
            g: -118,
            b: -91,
            a: 0
          }
        },
        min: 0,
        max: false
      },
      source: "assets/images/maharashtra_districts_texts.svg",
      title: "Maharashtra-bg_o",
      responsive: true
    });
  }

  svgMapClick(status:string){
    if(status=='mapClick'){
      $(document).on('click', '#mapsvg1  path', (e: any) => {
        console.log(e, e.currentTarget.id);
        this.selectedDistrictId = e.currentTarget.id;
        var filteredDistrict = this.allDistrict.filter((x: any) => x.districtId == e.currentTarget.id)
       this.setSVGPath(filteredDistrict);
      })
    }else{
      var filteredDistrict = this.allDistrict.filter((x: any) => x.districtId == this.selectedDistrictId)
      this.setSVGPath(filteredDistrict)
    }
    
   
  }
  setSVGPath(filteredDistrict:any){
    var path = 'assets/mapSvg/' + filteredDistrict[0]?.districtName + '.svg';
    this.showTalukaSvgMap(this.commonService.mapRegions(), path);
    this.bindPieChartDataForTalukaPresident(this.selectedDistrictId); 
    this.getTalukaWiseIMPLeader();
    this.getTalukaPresidentData();
  }

  showTalukaSvgMap(regions_m: any, svgPath: any) {
    this.getTalukaCommitteeCountByDistrict();
    if (this.graphInstance1) {
      this.graphInstance1.destroy();
    }
    this.graphInstance1 = $("#mapsvg2").mapSvg({
      width: 550,
      height: 430,
      colors: {
        baseDefault: "#bfddff",
        background: "#fff",
        selected: "#7289da",
        hover: "#7289da",
        directory: "#bfddff",
        status: {}
      },
      regions: regions_m,
      viewBox: [0, 0, 763.614, 599.92],
      cursor: "pointer",
      zoom: {
        on: false,
        limit: [0, 50],
        delta: 2,
        buttons: {
          on: true,
          location: "left"
        },
        mousewheel: true
      },
      tooltips: {
        mode: "title",
        off: true,
        priority: "local",
        position: "bottom"
      },
      popovers: {
        mode: "on",
        on: false,
        priority: "local",
        position: "top",
        centerOn: false,
        width: 300,
        maxWidth: 50,
        maxHeight: 50,
        resetViewboxOnClose: false,
        mobileFullscreen: false
      },
      gauge: {
        on: false,
        labels: {
          low: "low",
          high: "high"
        },
        colors: {
          lowRGB: {
            r: 211,
            g: 227,
            b: 245,
            a: 1
          },
          highRGB: {
            r: 67,
            g: 109,
            b: 154,
            a: 1
          },
          low: "#d3e3f5",
          high: "#436d9a",
          diffRGB: {
            r: -144,
            g: -118,
            b: -91,
            a: 0
          }
        },
        min: 0,
        max: false
      },
      source: svgPath,
      title: "Maharashtra-bg_o",
      responsive: true
    });
  }

  // setReuestParameters(){
  //   const req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + this.selectedDistrictId ? this.selectedDistrictId :3 || 0;
    
  //   console.log(req)
  //   return req
  // }

 
  getTalukaCommitteeCountByDistrict(){
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + this.selectedDistrictId || 0;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebTalukaDashbordState' + req, false, false, false, 'electionMicroSerApp'); //old API  Web_GetDistrict_1_0_Committee
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.responseData && res?.responseData.length != 0) {
        // res.responseData.map((x:any)=>{
        //   x.talukaName=x.talukaName.split(' ')[0]
        // })
        var talukaByDistrictId = res.responseData;
        // this.districtWiseCommityWorkGraph(id); 10/01/22
        this.addClasscommitteeWise1(talukaByDistrictId);
        // this.onClickFlag == false ?  $('#mapsvg1  path#' + this.selectedDistrictId).addClass('svgDistrictActive') : '';
       
        //  id == undefined ||   id == null ||  id == ""  ? '': this.toggleClassActive(id);
        this.selectedDistrictId ? $('path#' + this.selectedDistrictId).addClass('svgDistrictActive') : this.toggleClassActive(0);
        
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  addClasscommitteeWise1(arr: any) {
    $('#mapsvg2  path').addClass('notClicked');
    setTimeout(() => {
      arr.find((element: any) => {
        $('#mapsvg2  path[id="' + element.talukaId + '"]').addClass('clicked');
        $('#mapsvg2  #'+element.talukaId).text(element?.boothCommittee)
      });
    }, 500);
  }
  

  /// -----------------------------------  open Modal -----------------
  openImpLeaderModal(vId:any){
    this.talukaIMPleaderArray.filter((res:any)=>{
      for(let i=0;i<res.talukaWiseIMPLeaders.length;i++){
        if(vId == res?.talukaWiseIMPLeaders[i]?.voterId ){
          this.impLeaderDetails = res?.talukaWiseIMPLeaders[i]
          console.log(this.impLeaderDetails);
        }
      }
      
      // if(res?.talukaWiseIMPLeaders.voterId == vId){
      //   this.impLeaderName =
      // }
    })
  }



}

