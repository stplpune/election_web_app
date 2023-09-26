import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
declare var $: any;

@Component({
  selector: 'app-committee-dashboard',
  templateUrl: './committee-dashboard.component.html',
  styleUrls: ['./committee-dashboard.component.css'],
  providers: [DatePipe]
})
export class CommitteeDashboardComponent implements OnInit, OnDestroy, AfterViewInit  {

  localStorageData = this.commonService.getlocalStorageData();
  selectedDistrictId: any;
  selectedDropdownNameValue: any;
  topVilageName_MapClicked: any;

  boothComitySummary: any;
  graphInstance: any;
  graphInstance1: any;

  @ViewChild("chart") chart: ChartComponent | undefined;
  chartOptions: any;

  talukaPresidentDashObj: object | any;
  impLeadersArray = new Array();
  presidentDetailsObj: any;
  pieChartShow: boolean = false;
  previousDistSelected: string = '';
  previousTalSelected: string = '';
  talukaByDistrictId = new Array();
  mapselected: string = 'dist'
  filteredTal = new Array();
  filteredDistrict = new Array();

  mapFilterTypeArray = [{ id: 1, value: 'Parliamentary Constituency' }, { id: 2, value: 'Assembly Constituency' }, { id: 3, value: 'District' }];
  topFilter: FormGroup | any;
  bCFormationDropArray: any;
  bCFormationCountArray: any;
  selectedTalId: any;

  getTotalPC: any;
  paginationNoPC: number = 1;
  pageSizePC: number = 10;
  // PC_Highlight:any;

  getTotalAC: any;
  paginationNoAC: number = 1;
  pageSizeAC: number = 10;
  // AC_Highlight:any;

  pastPCArray: any;
  pastACArray: any;
  viewDetailAC_DCArray: any[] = [];
  BarchartOptions: any;
  barChartShow: boolean = false;
  barChartBooths_vs_BoothcomityArray: any;
  talukaWiseBoothCommitteArray: any;

  AssemblypieChartShow: boolean = false;
  AssemblyPiechartOptions: any;
  presidentDetailObj: any;
  columnChartHeadingName = 'Talukawise Booth Committee Formation progress';


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
    this.getBCFormation_Map_Consituency(); //dropdown api
    this.getBCFormation_Map_Count(); // get district id

    this.getPastElectionName();
    this.getBarChartApi_Booths_vs_Boothcommittee();
    this.getImp_Leaders();
  }

  defaultFilter() {
    this.topFilter = this.fb.group({
      FilterTypeId: [3],
      FilterId: [''],
    })
  }

  changeFilterType() {
    this.topFilter.controls['FilterId'].setValue('');
    this.selectedDropdownNameValue = '';
    let typeId = this.topFilter.value.FilterTypeId;
    if (typeId == 1) {
      this.showSvgMapParli();
    } else if (typeId == 2) {
      this.showSvgMapAssembly(this.commonService.mapRegions());
      // this.talukaCircle_MapClick();
    } else if (typeId == 3) {
      this.firstTimeCallM_Svg();
    }
    this.selectedTalId = 0;
    this.getBCFormation_Map_Consituency(); //dropdown api
    this.callAllCommonApi();
  }

  selectDropdown() {
    this.selectedDropdownNameValue = this.bCFormationDropArray?.find((x: any) => x.constituenciesId == this.topFilter.value.FilterId)?.constituencyName; // get Dropdown Value Name
    this.selectedTalId = 0;
    if (this.topFilter.value.FilterTypeId == 3 && this.topFilter.value.FilterId) {
      this.firstTimeCallM_Svg();
      this.getBCFormation_Map_Count();
      this.selectedDistrictId = this.topFilter.value.FilterId;
      this.filteredDistrict = this.bCFormationCountArray?.filter((x: any) => x.constituenciesId == this.selectedDistrictId);
      this.setSVGPath(this.filteredDistrict, 'dist');
      this.toggleClassActive(this.selectedDistrictId);
    }
    // this.topFilter.value.FilterTypeId == 2 ? this.selectedTalId = (this.topFilter.value.FilterId || 0) : '';
    this.callAllCommonApi();
  }

  removeDropdownValue() {
    this.selectedTalId = 0;
    this.callAllCommonApi();
    this.topFilter.value.FilterTypeId == 3 ? (this.firstTimeCallM_Svg(), this.getBCFormation_Map_Count()) : '';
    this.selectedDropdownNameValue = '';
    this.paginationNoTalukaPer = 1;
  }

  callAllCommonApi(flag?: any) {
    this.impLeader_Highlight = '';
    this.boothCommittee_Summary();
    this.getImp_Leaders();
    this.paginationNoPC = 1; this.paginationNoAC = 1; this.getPastElectionName();
    flag == 'talukaClick' ? '' : this.getBarChartApi_Booths_vs_Boothcommittee();
    this.paginationNoTalukaPer = 1; this.getTalukaPresident(); //Taluka Wise Important Leaders Api
    // this.topFilter.value.FilterTypeId == 2 ? this.talukaCircle_MapClick(this.selectedTalId || 0) : '';
    this.columnChartHeadingName = this.topFilter.value.FilterTypeId == 1 ? 'Assembly Constituency Wise Committee Formation progress' : this.topFilter.value.FilterTypeId == 3 ? 'Talukawise Booth Committee Formation progress' :
      (this.topFilter.value.FilterTypeId == 2 && !this.topFilter.value.FilterId) ? this.columnChartHeadingName = 'Booth Committee Formation progress' : '';
  }

  firstTimeCallM_Svg() {
    this.selectedDistrictId = '';
    this.showSvgMap(this.commonService.mapRegions());
    this.addClasscommitteeWise();
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
        this.presidentDetailObj = res.responseData1;
        if (this.boothComitySummary) { // Add manually pie chart graph
          let obj = { 'totalBoothCommittee': 0, 'totalBooths': 0 };
          let totalBoothComity: any = ((this.boothComitySummary?.totalCommittee / this.boothComitySummary?.totalBooths) * 100)?.toFixed(2);
          let remainingBoothComity: any = (100 - totalBoothComity)?.toFixed(2);
          obj['totalBooths'] = Number(remainingBoothComity); obj['totalBoothCommittee'] = Number(totalBoothComity);
          this.constructPieChart(obj);
        }
      } else { this.boothComitySummary = []; this.presidentDetailObj = {} }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getBCFormation_Map_Consituency() {  //Dropdown Api
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=' + (this.topFilter.value.FilterTypeId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/BoothCommitteeFormation_Map_ConsituencyDropdown?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.bCFormationDropArray = res.responseData;
      } else { this.bCFormationDropArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getBCFormation_Map_Count() {   // show state map inside count
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId=' + (this.topFilter.value.FilterTypeId || 0) + '&FilterId=' + (this.topFilter.value.FilterId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommitteeFormation_Map_Count?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.bCFormationCountArray = res.responseData;
        this.addClasscommitteeWise();
      } else { this.bCFormationCountArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  electionNameACArray: any[] = [];
  electionNamePCArray: any[] = [];
  electionIdPC: any; electionTypeIdPC: any;
  electionIdAC: any; electionTypeIdAC: any;
  getPastElectionName() {
    this.electionNameACArray = [];
    this.electionNamePCArray = [];
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId;
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/GetPastElectionName?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {  // electionTypeId 2 is AC & 3 is PC
      if (res.responseData != null && res.statusCode == "200") {
        res.responseData?.map((ele: any) => { ele.electionTypeId == 2 ? this.electionNameACArray?.push(ele) : this.electionNamePCArray?.push(ele) });
        // setTimeout(() => {
        this.electionIdPC = this.electionNamePCArray[0]?.electionId; this.electionTypeIdPC = this.electionNamePCArray[0]?.electionTypeId;
        this.electionIdAC = this.electionNameACArray[0]?.electionId; this.electionTypeIdAC = this.electionNameACArray[0]?.electionTypeId;
        this.getPast_PC(this.electionIdPC, this.electionTypeIdPC);
        this.getPast_AC(this.electionIdAC, this.electionTypeIdAC);
        // }, 0);
      } else { this.electionNameACArray = []; this.electionNamePCArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getPast_PC(electionId: any, electionTypeId: any) {
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId='
      + formData?.FilterTypeId + '&FilterId=' + (formData?.FilterId || 0) + '&pageno=' + this.paginationNoPC + '&pagesize=' + this.pageSizePC
      + '&ElectionId=' + (electionId || 0) + '&ElectionTypeId=' + (electionTypeId || 0) + '&TalukaId=' + (this.selectedTalId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Past_Election_Summary?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.pastPCArray = res.responseData;
        this.getTotalPC = res.responseData1.totalPages * this.pageSizePC;
      } else { this.pastPCArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getPast_AC(electionId: any, electionTypeId: any) {
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId='
      + formData?.FilterTypeId + '&FilterId=' + (formData?.FilterId || 0) + '&pageno=' + this.paginationNoAC + '&pagesize=' + this.pageSizeAC
      + '&ElectionId=' + (electionId || 0) + '&ElectionTypeId=' + (electionTypeId || 0) + '&TalukaId=' + (this.selectedTalId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Past_Election_Summary?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.pastACArray = res.responseData;
        this.getTotalAC = res.responseData1.totalPages * this.pageSizeAC;
      } else { this.pastACArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  viewDetailAC_DC(isPc: any, ConstituencyId: any, electionId: any) {//view Detail Table Data
    // this.PC_Highlight = ConstituencyId;
    this.viewDetailAC_DCArray = [];
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId
      + '&IsPc=' + isPc + '&ConstituencyId=' + ConstituencyId + '&ElctionId=' + electionId;
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_PastElection_Summary_All?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.viewDetailAC_DCArray = res.responseData;
      } else { this.viewDetailAC_DCArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getBarChartApi_Booths_vs_Boothcommittee() { // barChartApi & villageMap Inside Count Api
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId
      + '&FilterTypeId=' + formData?.FilterTypeId + '&FilterId=' + (formData?.FilterId || 0)
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Booths_vs_Boothcommittee?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.barChartBooths_vs_BoothcomityArray = res?.responseData;

        this.addClasscommitteeWise1(this.barChartBooths_vs_BoothcomityArray); // Village Svg map
        this.selectedDistrictId ? $('path#' + this.selectedDistrictId).addClass('svgDistrictActive') : this.toggleClassActive(0);

        if (this.topFilter.value.FilterTypeId == 2 && this.topFilter.value.FilterId) {
          this.AssemblyPieChartCheck(this.barChartBooths_vs_BoothcomityArray); // pass Data For Assembly Pie Chart
        } else {
          const barchartBoothDataObj = this.barChartBooths_vs_BoothcomityArray.find((x: any) => x.totalBooths > 1 || x.totalBoothCommittee > 1) // Bar Chart
          this.barChartShow = barchartBoothDataObj ? true : false;
          this.constructBarChart(this.barChartBooths_vs_BoothcomityArray);
        }
      } else { this.barChartBooths_vs_BoothcomityArray = []; this.barChartShow = false; }
    }, (error: any) => { this.barChartShow = false; if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  talukaCircle_MapClick(villageId?: any) { //taluka circle click, taluka svg map click
    this.spinner.show();
    var obj = this.commonService.loggedInUserId() + '&ClientId=' + this.commonService.getlocalStorageData().ClientId
      + '&DistrictId=' + (this.selectedDistrictId || 0) + '&TalukaId=' + (villageId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/GetWebTalukaWiseBoothCommitteeDashbordState?UserId=' + obj, false, false, false, 'electionMicroSerApp'); //old API  Web_GetDistrict_1_0_Committee
    this.callAPIService.getHttp().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.responseData && res?.responseData.length != 0) {
        this.talukaWiseBoothCommitteArray = res.responseData;

        const barchartBoothDataObj = this.talukaWiseBoothCommitteArray.find((x: any) => x.totalBooths > 1 || x.totalBoothCommittee > 1) // Bar Chart
        this.barChartShow = barchartBoothDataObj ? true : false;
        this.constructBarChart(this.talukaWiseBoothCommitteArray);
      } else {
        this.spinner.hide();
        this.talukaWiseBoothCommitteArray = [];
        this.barChartShow = false;
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }); }
    })
  }

  //............................................ Important Leaders Top Code Start Here ...............................................//

  importantLeadersArray: any[] = [];
  getByIdImp_LeadersArray: any;
  impLeader_Highlight: any;

  getImp_Leaders() {
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId='
      + formData?.FilterTypeId + '&FilterId=' + (formData?.FilterId || 0) + '&TalukaId=' + (this.selectedTalId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/Get_BoothCommittee_Dashboard_Imp_Leaders?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.importantLeadersArray = res.responseData;
      } else { this.importantLeadersArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  redirectToleaderDetailsPage(id: any) { //Redirect leader Details Page
    this.impLeader_Highlight = id;
    window.open('../leader-details/' + id);
  }

  //............................................ Important Leaders Top Code End Here ...............................................//

  //..................................................  Maharastra/Taluka Map Code Start Here .............................................//

  onClickPagintionPC(pageNo: number) {
    this.paginationNoPC = pageNo;
    this.getPast_PC(this.electionIdPC, this.electionTypeIdPC);
  }

  onClickPagintionAC(pageNo: number) {
    this.paginationNoAC = pageNo;
    this.getPast_AC(this.electionIdAC, this.electionTypeIdAC);
  }

  svgMapColorReset() { $('#mapsvg path').css('fill', '#7289da') }

  ngAfterViewInit() {
    this.callSVGMap() // default call SVG MAP
    $(document).on('click', '#mapsvg  path', (e: any) => { // add on SVG Map
      let getClickedId = e.currentTarget;
      let distrctId = $(getClickedId).attr('id');
      this.selectedDistrictId = distrctId;
      this.toggleClassActive(Number(distrctId));
    });
  }

  callSVGMap() { this.showSvgMap(this.commonService.mapRegions()) }

  addClasscommitteeWise() {
    $('#mapsvg  path').addClass('notClicked');
    setTimeout(() => {
      this.bCFormationCountArray?.find((element: any) => {
        $('#mapsvg  path[id="' + element.constituenciesId + '"]').addClass('clicked');
        $('#mapsvg  #' + element.constituencyName).text(element.totalBoothCommittee)
      });
    }, 500);
  }

  toggleClassActive(distrctId: any) {
    let checksvgDistrictActive = $('#mapsvg  path').hasClass("svgDistrictActive");
    checksvgDistrictActive == true ? ($('#mapsvg  path').removeClass('svgDistrictActive'), $('#mapsvg  path#' + distrctId).addClass('svgDistrictActive')) : $('#mapsvg  path#' + distrctId).addClass('svgDistrictActive');
  }

  ngOnDestroy() {
    this.graphInstance ? this.graphInstance.destroy() : '';
    this.graphInstance1 ? this.graphInstance1.destroy() : '';
  }

  showSvgMap(regions_m: any) {
    if (this.graphInstance) {
      this.graphInstance.destroy();
    }
    this.graphInstance = $("#mapsvg").mapSvg({
      width: 450,
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
      viewBox: [0, 0, 700, 599],
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

  svgMaharastraMapClick() {
    this.filteredTal = [];
    this.previousTalSelected = '';
    this.selectedTalId = 0;
    $(document).on('click', '#mapsvg  path', (e: any) => {
      if (this.previousDistSelected != e.currentTarget.id || this.mapselected != 'dist') {
        this.mapselected = 'dist';
        this.selectedDistrictId = e.currentTarget.id;
        this.previousDistSelected = this.selectedDistrictId;
        this.filteredDistrict = this.bCFormationCountArray?.filter((x: any) => x.constituenciesId == e.currentTarget.id);
        this.selectedDropdownNameValue = this.filteredDistrict[0]?.constituencyName; // set only selected dropdown Name Value
        this.topFilter.controls['FilterId'].setValue(this.filteredDistrict[0]?.constituenciesId);
        this.setSVGPath(this.filteredDistrict, 'dist');
        this.callAllCommonApi();
      }
    })
  }

  svgVillageMapClick(status: string) {
    this.mapselected = 'tal';
    $(document).on('click', '#mapsvg2  path', (e: any) => {
      this.topVilageName_MapClicked = e.target.dataset.name;
      let selectedTalId = ((e.currentTarget.id).split('d')[((e.currentTarget.id).split('d').length - 1)]);
      this.selectedTalId = selectedTalId;
      if (this.previousTalSelected != selectedTalId) { //constituenciesId == talukaId
        this.previousTalSelected = selectedTalId;
        this.filteredTal = this.barChartBooths_vs_BoothcomityArray.filter((x: any) => x.constituenciesId == Number(selectedTalId));
        this.setSVGPath(this.selectedDistrictId, 'tal', this.filteredTal);
        this.callAllCommonApi('talukaClick');
        // this.topVilageName_MapClicked = this.filteredTal[0]?.constituencyName;
        this.columnChartHeadingName = this.filteredTal[0]?.constituencyName + ' ' + 'Booth Committee Formation progress';
        this.talukaCircle_MapClick(Number(selectedTalId));
      }
    })
  }

  setSVGPath(filteredDistrict: any, status: string, filterTal?: any) {
    if (status == 'dist') {
      var path = 'assets/mapSvg/' + filteredDistrict[0]?.constituencyName + '.svg';
      this.showTalukaSvgMap(this.commonService.mapRegions(), path);
    }
    // this.bindPieChartDataForTalukaPresident(this.selectedDistrictId, (filterTal? filterTal[0]?.talukaId:0)); 
  }

  showTalukaSvgMap(regions_m: any, svgPath: any) {
    this.getBarChartApi_Booths_vs_Boothcommittee();
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

  addClasscommitteeWise1(arr: any) {
    $('#mapsvg2  path').addClass('notClicked');
    setTimeout(() => {
      arr.find((element: any) => { //talukaId
        $('#mapsvg2  path[id="' + element?.constituenciesId + '"]').addClass('clicked');
        $('#mapsvg2  #' + element?.constituenciesId).text(element?.totalBoothCommittee)
      });
    }, 500);
  }

  //..................................................  Maharastra/Taluka Map Code End Here .............................................//


  constructPieChart(obj: any) {
    this.pieChartShow = (obj?.totalBoothCommittee > 1 || obj?.totalBooths > 1) ? true : false;
    this.chartOptions = {
      series: [obj?.totalBoothCommittee, obj?.totalBooths],
      chart: {
        width: 300,
        type: "pie"
      },
      // labels: ["Total Booth Committee", "Total Booths", ],
      labels: ["Completed", "Remaining",],
      colors: ['#6f42c1', '#297af0'],
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
      legend: {
        show: true,
        position: 'bottom'
      },
    };
  }

  // --------------------------------------  Construct BarChart  -----------------------

  constructBarChart(array: any) {
    this.BarchartOptions = {
      series: [
        {
          name: "Booths ",
          data: array.map((x: any) => x.totalBooths)
        },
        {
          name: "Booth Committee",
          data: array.map((x: any) => x.totalBoothCommittee)
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
        events: {
          click: (event: any) => {
            var dataPointIndex = parseInt(event.target.getAttribute("j"));
            if (isNaN(dataPointIndex)) {
            } else {
              let obj = array.at(dataPointIndex);
              this.redirectToBoothCommitteePage(obj);
            }
          }
        }
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
        formatter: function (val: any) {
          return val ? val : '';
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
        categories: array.map((x: any) => x.constituencyName)
      },
      yaxis: {},
      fill: {
        opacity: 1
      },
      tooltip: {
        enabled: false,
      }
    };
  }
  // .......................................................   Assembly Village Pie Chart Code Start Here .......................//

  assemblyPieChartListArray: any[] = [];
  HighlightRowAssemblyPieList: any;
  AssemblyPieChartCheck(aarayData: any) {
    this.assemblyPieChartListArray = [];
    aarayData.map((ele: any) => {
      let obj = { 'totalBoothCommittee': 0, 'totalBooths': 0, 'constituencyName': '', 'constituenciesId': 0 };
      let totalBoothComity: any = ((ele?.totalBoothCommittee / ele?.totalBooths) * 100)?.toFixed(2);
      let remainingBoothComity: any = (100 - totalBoothComity)?.toFixed(2);
      obj['totalBooths'] = Number(remainingBoothComity); obj['totalBoothCommittee'] = Number(totalBoothComity);
      obj['constituencyName'] = ele?.constituencyName; obj['constituenciesId'] = ele?.constituenciesId;
      this.assemblyPieChartListArray?.push(obj);
    })
    this.assemblyVillagePieChart(this.assemblyPieChartListArray[0]);
  }

  assemblyVillagePieChart(obj: any) {
    this.selectedTalId = '';
    this.columnChartHeadingName = obj?.constituencyName + ' ' + 'Booth Committee Formation progress';
    this.HighlightRowAssemblyPieList = obj?.constituenciesId;
    this.talukaCircle_MapClick(this.HighlightRowAssemblyPieList);
    this.selectedTalId = obj?.constituenciesId; this.getTalukaPresident();


    this.AssemblypieChartShow = (obj?.totalBoothCommittee > 1 || obj?.totalBooths > 1) ? true : false;
    this.AssemblyPiechartOptions = {
      series: [obj?.totalBoothCommittee, obj?.totalBooths],
      chart: {
        width: 350, type: "donut",
        // events: {
        //   click: ()=> { // whwe pie chart click then call
        //     this.columnChartHeadingName =  obj?.constituencyName +' '+'Booth Committee Formation progress';
        //     this.talukaCircle_MapClick(this.HighlightRowAssemblyPieList);
        //     this.selectedTalId = obj?.constituenciesId; this.getTalukaPresident(); 
        //   }}
      },
      labels: ["Completed", "Remaining"],
      colors: ['#6f42c1', '#297af0'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  // .......................................................   Assembly Village Pie Chart Code End Here .......................//

  showSvgMapAssembly(regions_m: any) {
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
      // viewBox: [0, 0, 1100.614, 900],
      viewBox: [0, 0, 1400, 1100],
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

  showSvgMapParli(regions_m?: any) {
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
      // viewBox: [0, 0, 750.614, 500],
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
      source: "assets/images/Maharashtra_Wahlkreise_Lok_Sabha.svg",
      title: "Maharashtra-bg_o",
      responsive: true
    });
  }

  //............................................ Taluka Wise Important Leaders Code Start Here ...............................................//

  getTotalTalukaPer: any;
  paginationNoTalukaPer: number = 1;
  pageSizeTalukaPer: number = 10;
  talukaPresidentArray: any[] = [];
  impLeadersData: any;

  getTalukaPresident() {
    let formData = this.topFilter.value;
    let obj = '&ClientId=' + this.localStorageData?.ClientId + '&StateId=' + this.localStorageData?.StateId + '&FilterTypeId='
      + formData?.FilterTypeId + '&FilterId=' + (formData?.FilterId || 0) + '&pageno=' + this.paginationNoTalukaPer + '&pagesize=' + this.pageSizeTalukaPer + '&TalukaId=' + (this.selectedTalId || 0);
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/GetWebTalukaPresidentsDashbordState?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.talukaPresidentArray = res.responseData?.responseData1;
        this.getTotalTalukaPer = res.responseData.responseData2.totalPages * this.pageSizeTalukaPer;
      } else { this.talukaPresidentArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  onClickPagintionTalukaPer(pageNo: number) {
    this.paginationNoTalukaPer = pageNo;
    this.getTalukaPresident();
  }

  redirectToBoothCommitteePage(obj: any) { //Redirect Booth Committee Page
    window.open('../booth-committee/' + obj.stateId + '.' + obj.divisionId + '.' + obj.districtId + '.' + obj.talukaId);
  }

  //............................................ Taluka Wise Important Leaders Code Start Here ...............................................//

}

//  constituenciesId = districtId , constituencyName = districtName , totalBooths = boothCommittee
// IsPc == 0 PC  && 1 is AC
//  Api name Resp :: BoothCommitteeDashboard/GetPastElectionName ==>  electionTypeId == 3 is PC 2 Is AC

