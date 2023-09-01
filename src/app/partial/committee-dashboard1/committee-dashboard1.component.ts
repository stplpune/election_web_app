import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Location } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChartComponent } from "ng-apexcharts";
import { log } from 'console';
declare var $: any;

@Component({
  selector: 'app-committee-dashboard1',
  templateUrl: './committee-dashboard1.component.html',
  styleUrls: ['./committee-dashboard1.component.css']
})
export class CommitteeDashboard1Component implements OnInit {


  localStorageData = this.commonService.getlocalStorageData();
  allDistrict: any;
  selectedDistrictId: any;

  boothComitySummary:any;
  graphInstance: any;
  graphInstance1: any;

  @ViewChild("chart") chart: ChartComponent | undefined;
  chartOptions: any;

  talukaPresidentDashObj:object | any;
  impLeadersArray = new Array();
  presidentDetailsObj:any;
  pieChartShow:boolean = false;
  previousDistSelected:string = '';
  previousTalSelected:string = '';
  talukaByDistrictId = new Array();
  mapselected:string = 'dist'
  filteredTal = new Array(); 
  filteredDistrict = new Array(); 

  mapFilterTypeArray = [{id:1, value:'Parliamentary Constituency'},{id:2, value:'Assembly Constituency'},{id:3, value:'District'}];
  topFilter:FormGroup | any;
  bCFormationDropArray:any;
  bCFormationCountArray:any;
  selectedTalId: any;

  getTotalPC: any;
  paginationNoPC: number = 1;
  pageSizePC: number = 10;

  getTotalAC: any;
  paginationNoAC: number = 1;
  pageSizeAC: number = 10;
  pastPCArray: any;
  pastACArray: any;
  viewDetailAC_DCArray: any;

  constructor(
    private commonService: CommonService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private fb: FormBuilder,
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private callAPIService: CallAPIService,
    public location: Location,
    private datepipe: DatePipe,
    public dialog: MatDialog,
    public dateTimeAdapter: DateTimeAdapter<any>) {
    { dateTimeAdapter.setLocale('en-IN'); }
  }

  ngOnInit(): void {
    this.defaultFilter();
    this.boothCommittee_Summary();
    this.getBCFormation_Map_Consituency();
    this.getDistrict();
  }

  defaultFilter(){
    this.topFilter = this.fb.group({
     FilterTypeId:[3],
     FilterId:[''],
    })
  }

  changeFilterType(){
    this.topFilter.controls['FilterId'].setValue('');
    let typeId = this.topFilter.value.FilterTypeId;
    if(typeId == 1){
      this.showSvgMapParli();
    } else if(typeId == 2){
      this.showSvgMapAssembly(this.commonService.mapRegions());
    } else if(typeId == 3){
      this.firstTimeCallM_Svg();
    }
    this.getBCFormation_Map_Consituency();
  }

  firstTimeCallM_Svg(){
    this.selectedDistrictId = '';
    this.showSvgMap(this.commonService.mapRegions());
    this.addClasscommitteeWise();
  }

  selectDropdown() {
    this.firstTimeCallM_Svg();
    this.getBCFormation_Map_Count();
    this.selectedDistrictId = this.topFilter.value.FilterId;
    this.filteredDistrict = this.allDistrict.filter((x: any) => x.districtId == this.selectedDistrictId);
    this.setSVGPath(this.filteredDistrict,'dist');
    this.toggleClassActive(this.selectedDistrictId);
  }

  svgMapColorReset(){ $('#mapsvg1 path').css('fill', '#7289da')}

  ngAfterViewInit(){
      this.callSVGMap() // default call SVG MAP
      $(document).on('click', '#mapsvg1  path', (e: any) => { // add on SVG Map
      let getClickedId = e.currentTarget;
      let distrctId = $(getClickedId).attr('id');
      this.selectedDistrictId = distrctId;
      this.toggleClassActive(Number(distrctId));
    });
  }

  callSVGMap(){ this.showSvgMap(this.commonService.mapRegions())}

  addClasscommitteeWise(){
    $('#mapsvg1  path').addClass('notClicked');
    setTimeout(() => {
      this.allDistrict.find((element: any) => {
        $('#mapsvg1  path[id="' + element.districtId + '"]').addClass('clicked');
        $('#mapsvg1  #'+element.districtName).text(element.boothCommittee)
      });
    }, 500);
  }

  toggleClassActive(distrctId: any){
    let checksvgDistrictActive = $('#mapsvg1  path').hasClass("svgDistrictActive");
    checksvgDistrictActive == true ? ($('#mapsvg1  path').removeClass('svgDistrictActive'), $('#mapsvg1  path#' + distrctId).addClass('svgDistrictActive')) : $('#mapsvg1  path#' + distrctId).addClass('svgDistrictActive');
  }

  ngOnDestroy() {
    this.graphInstance ? this.graphInstance.destroy() : '';
    this.graphInstance1 ? this.graphInstance1.destroy() : '';
  }

  boothCommittee_Summary() {
    let FTypeId = this.topFilter.value.FilterTypeId;
    let FilterId = this.topFilter.value.FilterId || 0;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&DistictId=' + (FTypeId == 3 ? FilterId : 0 || 0)
      + '&TalukaId=' + (this.selectedTalId || 0) + '&PCId=' + (FTypeId == 1 ? FilterId : 0 || 0) + '&ACId=' + (FTypeId == 2 ? FilterId : 0 || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Summary?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.boothComitySummary = res.responseData;
        if (this.boothComitySummary) { // Add manually pie chart graph
          let obj = { 'totalBooths': 0, 'totalBoothCommittee': 0 };
          let totalBoothComity: any = ((this.boothComitySummary?.totalCommittee / this.boothComitySummary?.totalBooths) * 100)?.toFixed(2);
          let remainingBoothComity: any = (100 - totalBoothComity)?.toFixed(2);
          obj['totalBooths'] = Number(remainingBoothComity); obj['totalBoothCommittee'] = Number(totalBoothComity);
          this.constructPieChart(obj);
        }
      } else { this.boothComitySummary = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getBCFormation_Map_Consituency(){    
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=' + (this.topFilter.value.FilterTypeId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/BoothCommitteeFormation_Map_ConsituencyDropdown?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.bCFormationDropArray = res.responseData;
      } else { this.bCFormationDropArray = [];}
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }
  
  getBCFormation_Map_Count(){   
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=' + (this.topFilter.value.FilterTypeId || 0) + '&FilterId=' + (this.topFilter.value.FilterId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommitteeFormation_Map_Count?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.bCFormationCountArray = res.responseData;
      } else { this.bCFormationCountArray = [];}
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getDistrict() {
    var usrData = this.commonService.getLoggedUserStateData();
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&StateId='+ (usrData?.StateId ?usrData?.StateId: 0) +'&DivisionId='+ (usrData?.DivisionId ?usrData?.DivisionId: 0) +'&DistrictId=' + (usrData?.DistrictId ?usrData?.DistrictId:  0) + '&TalukaId=' + (usrData?.TalukaId ?usrData?.DistrictId: 0);
    this.spinner.show();
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebDashbordState' + req, false, false, false, 'electionMicroSerApp'); //old API  Web_GetDistrict_1_0_Committee
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.responseData && res?.responseData.length != 0) {
        this.allDistrict = res.responseData;
        // this.selectedDistrictId=3;
        // this.svgMapClick('Default');
        this.addClasscommitteeWise(); 
        // this.selectedDistrictId ? $('path#' + this.selectedDistrictId).addClass('svgDistrictActive') : this.toggleClassActive(0);
      }
    }, (error: any) => {this.spinner.hide();
      if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route });}})
  }

  getPast_PC(){    
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=' + formData?.FilterTypeId
    + '&FilterId=' + (formData?.FilterId || 0) + '&pageno=' + this.paginationNoPC + '&pagesize=' + this.pageSizePC;
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Past_PC_Election_Summary?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.pastPCArray = res.responseData[0];
        this.getTotalPC = res.responseData1.totalPages * this.pageSizePC;
      } else { this.pastPCArray = [];}
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }  // this.pastPCArray?.electionResults

  getPast_AC(){    
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=' + formData?.FilterTypeId
    + '&FilterId=' + (formData?.FilterId || 0) + '&pageno=' + this.paginationNoAC + '&pagesize=' + this.pageSizeAC;
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Past_AC_Election_Summary?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.pastACArray = res.responseData[0];
        this.getTotalAC = res.responseData1.totalPages * this.pageSizeAC;
      } else { this.pastACArray = [];}
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }  // this.pastACArray?.electionResults

  viewDetailAC_DC(){    
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId 
    + '&IsPc=' + 0 + '&ConstituencyId=' + 0 + '&ElctionId=' + 0 ;
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_PastElection_Summary_All?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.viewDetailAC_DCArray = res.responseData;
      } else { this.viewDetailAC_DCArray = [];}
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }  // this.pastACArray?.electionResults


//------------  get Pie Chart Details --------------------------------

  bindPieChartDataForTalukaPresident(distId?:any, talId?:any){
    this.spinner.show();
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + (distId || 0) +'&TalukaId='+(talId ||0);
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebDashbordDistrictDetailState'+req, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode == '200') {
        this.presidentDetailsObj=res?.responseData;
        // this.talukaPresidentDashObj = res?.responseData1;
        this.impLeadersArray=res?.responseData2;
        if (this.talukaPresidentDashObj) { 
        //  let totalBoothComity:any = ((this.talukaPresidentDashObj?.totalBoothCommittee / this.talukaPresidentDashObj?.totalBooths) * 100)?.toFixed(2) ;
        //  let remainingBoothComity:any = (100 - totalBoothComity)?.toFixed(2);
        //  this.talukaPresidentDashObj['totalBooths'] = Number(remainingBoothComity);
        //  this.talukaPresidentDashObj['totalBoothCommittee'] = Number(totalBoothComity);
        //  this.constructPieChart(this.talukaPresidentDashObj);
        }
      } else {
        // this.talukaPresidentDashObj = [];
        this.presidentDetailsObj=[];
        this.impLeadersArray=[];
        this.pieChartShow=false;
      }
    }, (error: any) => {this.spinner.hide();this.pieChartShow=false;
      if (error.status == 500) {this.router.navigate(['../500'], { relativeTo: this.route });}})
  }

  constructPieChart(obj:any){
    this.pieChartShow =( obj?.totalBoothCommittee >1 || obj?.totalBooths >1 )? true:false;
    this.chartOptions = {
      series: [ obj?.totalBoothCommittee, obj?.totalBooths,],
      chart: {
        width: 300,
        type: "pie"
      },
      // labels: ["Total Booth Committee", "Total Booths", ],
      labels: ["Completed", "Remaining", ],
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

  pieChart11(){
      this.chartOptions = {
        series: [44, 55],
        chart: {
        width: 380,
        type: 'donut',
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270
        }
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        type: 'gradient',
      },
      legend: {
        formatter: function(val:any, opts:any) {
          return val + " - " + opts.w.globals.series[opts.seriesIndex]
        }
      },
      title: {
        text: 'Gradient Donut with custom Start-angle'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
      };
  }

  // --------------------------------------- Maharashtra SVG MAP ----------------------------------------------- //

  showSvgMap(regions_m: any){
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

  svgMapClick(){
    this.filteredTal=[];
    this.previousTalSelected='';
      $(document).on('click', '#mapsvg1  path', (e: any) => {
        if(this.previousDistSelected != e.currentTarget.id || this.mapselected!='dist'){
          this.mapselected='dist';
          this.selectedDistrictId = e.currentTarget.id;
          this.previousDistSelected =this.selectedDistrictId;
          this.filteredDistrict = this.allDistrict.filter((x: any) => x.districtId == e.currentTarget.id);
         this.setSVGPath(this.filteredDistrict, 'dist');
        }
      })
  }

  svgMapClick1(status:string){
    this.mapselected='tal';
      $(document).on('click', '#mapsvg2  path', (e: any) => {
        let selectedTalId = ((e.currentTarget.id).split('d')[((e.currentTarget.id).split('d').length-1)]);
        this.selectedTalId = selectedTalId;
        if(this.previousTalSelected != selectedTalId){
          this.previousTalSelected =selectedTalId;
          this.filteredTal = this.talukaByDistrictId.filter((x: any) => x.talukaId == Number(selectedTalId));
         this.setSVGPath(this.selectedDistrictId,'tal', this.filteredTal );
        }
      })
  }

  setSVGPath(filteredDistrict:any, status:string, filterTal?:any){
    if(status=='dist'){
      var path = 'assets/mapSvg/' + filteredDistrict[0]?.districtName + '.svg';
      this.showTalukaSvgMap(this.commonService.mapRegions(), path);
    }
    this.bindPieChartDataForTalukaPresident(this.selectedDistrictId, (filterTal? filterTal[0]?.talukaId:0)); 
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

  getTalukaCommitteeCountByDistrict(){
    var req = '?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&DistrictId=' + this.selectedDistrictId || 0;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetWebTalukaDashbordState' + req, false, false, false, 'electionMicroSerApp'); //old API  Web_GetDistrict_1_0_Committee
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.responseData && res?.responseData.length != 0) {
        this.talukaByDistrictId = res.responseData;
        this.addClasscommitteeWise1(this.talukaByDistrictId);
        this.selectedDistrictId ? $('path#' + this.selectedDistrictId).addClass('svgDistrictActive') : this.toggleClassActive(0);
      }
    }, (error: any) => {
      if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route });}})
  }

  addClasscommitteeWise1(arr: any) {
    $('#mapsvg2  path').addClass('notClicked');
    setTimeout(() => {
      arr.find((element: any) => {
        $('#mapsvg2  path[id="' + element?.talukaId + '"]').addClass('clicked');
        $('#mapsvg2  #'+element?.talukaId).text(element?.boothCommittee)
      });
    }, 500);
  }

  //........................................................  Assembly SVG Map Code Start Here .....................................//

  showSvgMapAssembly(regions_m: any){
    if (this.graphInstance) {
      this.graphInstance.destroy();
    }
    this.graphInstance = $("#mapSvgAssembly").mapSvg({
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
      viewBox: [0, 0, 1100.614, 900],
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
      source: "assets/images/Wahlkreise_zur_Vidhan_Sabha_von_Maharashtra.svg",    
      title: "Maharashtra-bg_o", 
      responsive: true
    });
  }

  //........................................................  Assembly SVG Map Code End Here .....................................//

  //.....................................................  Parliamentary SVG Map Code Start Here ..............................//

  showSvgMapParli(regions_m?: any){
    if (this.graphInstance) {
      this.graphInstance.destroy();
    }
    this.graphInstance = $("#mapSvgParli").mapSvg({
      width: 650,
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
      viewBox: [0, 0, 650.614, 400],
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
      source: "assets/images/Maharashtra_Wahlkreise_Lok_Sabha.svg", 
      title: "Maharashtra-bg_o", 
      responsive: true
    });
  }  

  //...................................................  Parliamentary SVG Map Code End Here ..............................//

}

