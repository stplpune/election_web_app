import { AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
declare var $: any

@Component({
  selector: 'app-committee-dashboard',
  templateUrl: './committee-dashboard.component.html',
  styleUrls: ['./committee-dashboard.component.css'],
  providers: [DatePipe]
})
export class CommitteeDashboardComponent implements OnInit {

  WorkDoneByYuvakTP: any;
  WorkDoneByYuvakBP: any;
  selweekRange: any
  WorkDoneByYuvakBarchart: any;
  WorkDoneByMemberSVGData: any;
  resBestPerMember: any;
  chart: any;
  allDistrict: any;
  filterObj = { 'globalDistrictId': 0, 'globalVillageid': 0, 'globalTalukId': 0 }
  getTalkaByDistrict: any;
  resultVillageOrCity: any;
  filterBestPer!: FormGroup;
  topFilterForm!: FormGroup;
  maxDate = new Date();
  toDate: any;
  fromDate: any;
  catValue: any;
  bestPerCat = [{ 'id': 1, 'name': "Committee" }, { 'id': 0, 'name': "Location" }];
  bestWorstArray = [{ 'id': 1, 'name': "Best" }, { 'id': 0, 'name': "Worst" }, { 'id': 2, 'name': "No Performance" }];
  defultCategoryName: any = 1;
  resWorkcategory: any;
  dateRange: any;
  dateRange1: any;
  defaultCloseBtn: boolean = false;
  resultBestPerKaryMember: any;
  memberNameArray: any;
  regions_m: any;
  isBestworst = 1;
  savgMapArray: any;
  svgMapWorkDoneByYuvakBP: any;
  svgMapWorkDoneByYuvakTp: any;
  graphInstance: any;
  WorkdonebyMembersXaxiesLabel: any;
  SubUserTypeId = this.commonService.loggedInSubUserTypeId();
  selDistrictId: any;
  selDistrictName: any;
  getAllDistrict: any;
  totalWorkCount: any;
  comityDetailBodyId: any;
  clickDistrictId: any = 0;

  resBestPerKaryMember: any;
  bestPerfListTotal: any;
  bestPerfPaginationNo: number = 1;
  bestPerfPageSize: number = 10;
  hideBestPerfTable: boolean = true;

  worstPerfMemberArray: any;
  worstPerfListTotal: any;
  worsPerfPaginationNo: number = 1;
  worsPerfPageSize: number = 10;
  hideWorstPerfTable: boolean = false;

  noPerfMemberArray: any;
  noPerfListTotal: any;
  noPerfPaginationNo: number = 1;
  noPerfPageSize: number = 10;
  hideNoPerfTable: boolean = false;


  constructor(private callAPIService: CallAPIService, private spinner: NgxSpinnerService,
    private toastrService: ToastrService, private commonService: CommonService, private router: Router, private fb: FormBuilder,
    public datepipe: DatePipe, private route: ActivatedRoute,
    public location: Location, public dateTimeAdapter: DateTimeAdapter<any>) {
    { dateTimeAdapter.setLocale('en-IN'); }
    let data: any = sessionStorage.getItem('weekRange');
    this.selweekRange = JSON.parse(data);
    this.dateRange1 = [this.selweekRange?.fromDate, this.selweekRange?.toDate];
    this.dateRange = [this.selweekRange?.fromDate, this.selweekRange?.toDate];
  }

  ngOnInit(): void {
    this.selDistrictName = "";
    this.getMemberName();
    // this.SubUserTypeId == 5 ? (this.catValue = "Committee", this.getMemberName()) : '';
    this.SubUserTypeId == 5 ? (this.catValue = "Committee") : '';
    this.commonService.loggedInUserType() == 1 ? this.WorkdonebyMembersXaxiesLabel = "District Name" : this.WorkdonebyMembersXaxiesLabel = "Committes Name"
    this.getWorkcategoryFilterDetails();
    this.defaultFilterForm();
    this.defaultFilterBestPer();
    this.geWeekReport();
    this.SvgMapCommitteeDistrictwise();
    this.getBestPerKaryMember();
    this.bestPerformance();

  }

  ngAfterViewInit() {
    this.showSvgMap(this.commonService.mapRegions());
    $(document).on('click', '#mapsvg  path', (e: any) => { // add on SVG Map
      let getClickedId = e.currentTarget;
      let distrctId = $(getClickedId).attr('id');
      this.clickDistrictId = distrctId;
      // check count on click distrctId 
      this.WorkDoneByMemberSVGData.forEach((element: any) => {
        if (distrctId == element.DistrictId) {
          if (element.TotalWork == 0) {
            this.toastrService.error("Data is not available");
            return
          } else {
            this.disNameToDisId(distrctId)
            this.topFilterForm.controls['DistrictId'].setValue(Number(distrctId));
            this.filterBestPer.controls['DistrictId'].setValue(Number(distrctId));
            this.toggleClassActive(Number(distrctId));
            this.defaultFilterBestPer();
            this.geWeekReport()
            this.getDistrict();
            this.getBestPerKaryMember();
            this.bestPerformance();
          }
        }
      });


    });
    // }
  }

  disNameToDisId(distrctId: any) {
    this.getAllDistrict.forEach((element: any) => {
      if (element.DistrictId == Number(distrctId)) {
        this.selDistrictName = element.DistrictName;
      }
    });
  }

  toggleClassActive(distrctId: any) {
    let checksvgDistrictActive = $('#mapsvg  path').hasClass("svgDistrictActive");
    checksvgDistrictActive == true ? ($('#mapsvg  path').removeClass('svgDistrictActive'), $('path#' + distrctId).addClass('svgDistrictActive')) : $('path#' + distrctId).addClass('svgDistrictActive');;
  }


  showSvgMap(regions_m: any) {
    if (this.graphInstance) {
      this.graphInstance.destroy();
    }
    this.graphInstance = $("#mapsvg").mapSvg({
      width: 550,
      height: 430,
      colors: {
        baseDefault: "#bfddff",
        background: "#fff",
        selected: "#272848",
        hover: "#ebebeb",
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
      // source: "assets/images/divisionwise.svg",
      title: "Maharashtra-bg_o",
      responsive: true
    });
    // });
  }

  CommitteeDetails(BodyId: any) {
    this.comityDetailBodyId = BodyId;
    this.filterBestPer.patchValue({
      BodyId: BodyId
    })
    this.bestPerformance();
  }

  filterData(flag: any) {
    if (flag == 'district') {
      this.getTaluka(this.filterBestPer.value.DistrictId);
    } else if (flag == 'workType') {

      if (this.isBestworst == 1) {
        this.getBestPerKaryMember();
      } else if (this.isBestworst == 0) {
        this.getWorstPerfMember();
      } else if (this.isBestworst == 2) {
        this.getNoPerfMember();
      }

    }
    this.geWeekReport();
    this.SvgMapCommitteeDistrictwise();
    // district talka committee
    this.bestPerformance();
  }

  getweekRage(event: any) {
    this.defaultCloseBtn = true;
    this.bestPerformance();
    if (this.isBestworst == 1) {
      this.getBestPerKaryMember();
    } else if (this.isBestworst == 0) {
      this.getWorstPerfMember();
    } else if (this.isBestworst == 2) {
      this.getNoPerfMember();
    }
    // this.showSvgMap(this.commonService.mapRegions());
    this.geWeekReport();
    this.SvgMapCommitteeDistrictwise();
  }

  getDistrict() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allDistrict = res.data1;
      } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    });
  }

  getTaluka(districtId: any) {
    this.spinner.show();
    this.filterObj.globalDistrictId = districtId;
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getTalkaByDistrict = res.data1;
      } else {
        this.spinner.hide();
        if (res.data == 1) {
          this.spinner.hide();
          //this.toastrService.error("Data is not available");
        } else {
          this.spinner.hide();
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  getWorkcategoryFilterDetails() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Workcategory_1_0', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resWorkcategory = res.data1;
      } else {
        this.spinner.hide();
        this.toastrService.error("Member is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  defaultFilterBestPer() {
    this.filterBestPer = this.fb.group({
      DistrictId: [0],
      TalukaId: [0],
      VillageId: [0],
      IsBody: [1],
      BodyId: [0],
    })
  }

  defaultFilterForm() {
    this.topFilterForm = this.fb.group({
      category: [0],
      fromTo: [this.dateRange],
      DistrictId: [0]
    })
  }

  clearFilter(flag: any) {
    if (flag == 'workType') {
      this.topFilterForm.controls['category'].setValue(0);
      if (this.isBestworst == 1) {
        this.getBestPerKaryMember();
      } else if (this.isBestworst == 0) {
        this.getWorstPerfMember();
      } else if (this.isBestworst == 2) {
        this.getNoPerfMember();
      }
      this.geWeekReport();
      this.SvgMapCommitteeDistrictwise();
    } else if (flag == 'dateValue') {
      this.defaultCloseBtn = false;
      this.topFilterForm.controls['fromTo'].setValue(this.dateRange1);
      this.savgMapArray = [];
      if (this.isBestworst == 1) {
        this.getBestPerKaryMember();
      } else if (this.isBestworst == 0) {
        this.getWorstPerfMember();
      } else if (this.isBestworst == 2) {
        this.getNoPerfMember();
      }
      this.geWeekReport();
      this.SvgMapCommitteeDistrictwise();
    } else if (flag == 'district') {
      this.filterBestPer.controls['DistrictId'].setValue(0);
      this.filterBestPer.controls['TalukaId'].setValue(0);
    } else if (flag == 'taluka') {
      this.filterBestPer.controls['TalukaId'].setValue(0);
    } else if (flag == 'committee') {
      this.filterBestPer.controls['BodyId'].setValue(0);
      this.filterBestPer.controls['IsBody'].setValue(1);
      this.comityDetailBodyId = 0;
    }

    this.bestPerformance();
  }

  committee() {
    this.bestPerformance();
  }

  getBestPerKaryMember() {
    this.spinner.show();
    let topFilterValue = this.topFilterForm.value;
    this.callAPIService.setHttp('get', 'DashboardData_BestPerformance_web_1_0_Pagination?UserId=' + this.commonService.loggedInUserId() + '&FromDate=' + this.datepipe.transform(topFilterValue.fromTo[0], 'dd/MM/yyyy') + '&ToDate=' + this.datepipe.transform(topFilterValue.fromTo[1],
      'dd/MM/yyyy') + '&CategoryId=' + topFilterValue.category + '&IsBest=' + this.isBestworst + '&DistrictId=' + topFilterValue.DistrictId + '&nopage=' + this.bestPerfPaginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resBestPerKaryMember = res.data1;
        this.bestPerfListTotal = res.data2[0].TotalCount;
      } else {
        this.resBestPerKaryMember = [];
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  onClickPagintionBestPerf(pageNo: any) {
    this.bestPerfPaginationNo = pageNo;
    this.getBestPerKaryMember();
  }

  getWorstPerfMember() {
    this.spinner.show();
    let topFilterValue = this.topFilterForm.value;
    this.callAPIService.setHttp('get', 'DashboardData_WorstPerformance_web_1_0_Pagination?UserId=' + this.commonService.loggedInUserId() + '&FromDate=' + this.datepipe.transform(topFilterValue.fromTo[0], 'dd/MM/yyyy') + '&ToDate=' + this.datepipe.transform(topFilterValue.fromTo[1],
      'dd/MM/yyyy') + '&CategoryId=' + topFilterValue.category + '&IsBest=' + this.isBestworst + '&DistrictId=' + topFilterValue.DistrictId + '&nopage=' + this.worsPerfPaginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.worstPerfMemberArray = res.data1;
        this.worstPerfListTotal = res.data2[0].TotalCount;
      } else {
        this.worstPerfMemberArray = [];
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  onClickPagintionWorstPerf(pageNo: any) {
    this.worsPerfPaginationNo = pageNo;
    this.getWorstPerfMember();
  }

  getNoPerfMember() {
    this.spinner.show();
    let topFilterValue = this.topFilterForm.value;
    this.callAPIService.setHttp('get', 'DashboardData_NoPerformance_web_1_0_Pagination?UserId=' + this.commonService.loggedInUserId() + '&FromDate=' + this.datepipe.transform(topFilterValue.fromTo[0], 'dd/MM/yyyy') + '&ToDate=' + this.datepipe.transform(topFilterValue.fromTo[1],
      'dd/MM/yyyy') + '&CategoryId=' + topFilterValue.category + '&IsBest=' + this.isBestworst + '&DistrictId=' + topFilterValue.DistrictId + '&nopage=' + this.noPerfPaginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.noPerfMemberArray = res.data1;
        this.noPerfListTotal = res.data2[0].TotalCount;
      } else {
        this.noPerfMemberArray = [];
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  onClickPagintionNoPerf(pageNo: any) {
    this.noPerfPaginationNo = pageNo;
    this.getNoPerfMember();
  }

  bestWorstPer(value: any) {
    this.isBestworst = value.id;
    if (value.id == 1) {
      this.getBestPerKaryMember();
      this.hideBestPerfTable = true;
      this.hideWorstPerfTable = false;
      this.hideNoPerfTable = false;
    } else if (value.id == 0) {
      this.getWorstPerfMember();
      this.hideBestPerfTable = false;
      this.hideWorstPerfTable = true;
      this.hideNoPerfTable = false;
    } else if (value.id == 2) {
      this.getNoPerfMember();
      this.hideBestPerfTable = false;
      this.hideWorstPerfTable = false;
      this.hideNoPerfTable = true;
    }
    this.comityDetailBodyId = 0;
    this.filterBestPer.controls['BodyId'].setValue(0);
  }


  // this.selweekRange.fromDate this.selweekRange.toDate
  geWeekReport() {
    this.spinner.show();
    let topFilterValue = this.topFilterForm.value;
    this.callAPIService.setHttp('get', 'DashboardData_Week_web_1_0_Committee_Work?UserId=' + this.commonService.loggedInUserId() + '&FromDate=' + this.datepipe.transform(topFilterValue.fromTo[0], 'dd/MM/yyyy') + '&ToDate=' + this.datepipe.transform(topFilterValue.fromTo[1], 'dd/MM/yyyy') + '&CategoryId=' + topFilterValue.category + '&DistrictId=' + topFilterValue.DistrictId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        res.data1 == "" ? this.WorkDoneByYuvakTP = [] : this.WorkDoneByYuvakTP = res.data1;
        res.data2 == "" ? this.WorkDoneByYuvakBP = [] : this.WorkDoneByYuvakBP = res.data2;
        res.data3 == "" ? this.WorkDoneByYuvakBarchart = [] : this.WorkDoneByYuvakBarchart = res.data3;
        this.WorkDoneByYuvak();
        this.spinner.hide();
      } else {
        this.WorkDoneByYuvakTP = [];
        this.WorkDoneByYuvakBP = [];
        this.WorkDoneByYuvakBarchart = [];
        this.WorkDoneByYuvak();
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  // .......................... SvgMap Committee_Districtwise Api   ....................................//

  SvgMapCommitteeDistrictwise() {
    this.spinner.show();
    let topFilterValue = this.topFilterForm.value;
    this.callAPIService.setHttp('get', 'DashboardData_Week_web_1_0_Committee_Districtwise?UserId=' + this.commonService.loggedInUserId() + '&FromDate=' + this.datepipe.transform(topFilterValue.fromTo[0], 'dd/MM/yyyy') + '&ToDate=' + this.datepipe.transform(topFilterValue.fromTo[1], 'dd/MM/yyyy') + '&CategoryId=' + topFilterValue.category + '&DistrictId=' + topFilterValue.DistrictId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.WorkDoneByMemberSVGData = res.data1;
        topFilterValue.DistrictId == 0 ? this.getAllDistrict = res.data1 : '';
        this.addClasscommitteeWise();
        this.mahaSVGMap(this.WorkDoneByMemberSVGData);
        this.spinner.hide();
      } else {
        this.WorkDoneByMemberSVGData = [];
        this.addClasscommitteeWise();
        this.mahaSVGMap(this.WorkDoneByMemberSVGData);
        this.spinner.hide();
      }
    })
  }

  addClasscommitteeWise() {
    $('.mapsvg-wrap path').addClass('notClicked');
    this.WorkDoneByMemberSVGData.forEach((element: any) => {
      $('.mapsvg-wrap path[id="' + element.DistrictId + '"]').addClass('clicked');
    });
  }

  bestPerformance() {
    this.spinner.show();
    let topFilterValue = this.topFilterForm.value;
    let filter = this.filterBestPer.value;
    let bodyIdBoth = this.comityDetailBodyId || filter.BodyId;
    this.callAPIService.setHttp('get', 'Web_DashboardData_BestPerformance_Filter_web_4_0?UserId=' + this.commonService.loggedInUserId() + '&FromDate=' + this.datepipe.transform(topFilterValue.fromTo[0], 'dd/MM/yyyy') + '&ToDate=' + this.datepipe.transform(topFilterValue.fromTo[1], 'dd/MM/yyyy') + '&DistrictId=' + this.clickDistrictId + '&TalukaId=' + 0 +
      '&IsBody=' + 1 + '&BodyId=' + bodyIdBoth + '&CategoryId=' + topFilterValue.category, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resultBestPerKaryMember = res.data1;
        this.spinner.hide();
      } else {
        this.resultBestPerKaryMember = [];
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  // chart DIv 
  WorkDoneByYuvak() {

    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_material);
      let chart = am4core.create('WorkDoneByYuvak', am4charts.XYChart)
      chart.colors.list = [
        am4core.color("#b959e0"),
        am4core.color("#b959e0"),
      ];
      chart.colors.step = 2;

      chart.legend = new am4charts.Legend()
      chart.legend.position = 'bottom'
      chart.legend.paddingBottom = 10
      chart.legend.labels.template.maxWidth = 20;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.title.text = "Committes Work Done Count";

      let xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
      xAxis.dataFields.category = 'DistrictName'
      xAxis.title.text = this.WorkdonebyMembersXaxiesLabel;
      xAxis.renderer.cellStartLocation = 0.1
      xAxis.renderer.cellEndLocation = 0.9
      xAxis.renderer.grid.template.location = 0;
      xAxis.renderer.labels.template.rotation = -90;
      xAxis.renderer.labels.template.verticalCenter = "middle";
      xAxis.renderer.minGridDistance = 0;
      chart.scrollbarX = new am4core.Scrollbar();
      // chart.scrollbarY = new am4core.Scrollbar();

      function createSeries(value: string | undefined, name: string) {
        let series = chart.series.push(new am4charts.ColumnSeries())
        series.dataFields.valueY = value
        series.dataFields.categoryX = 'DistrictName'
        series.name = name;

        series.events.on("hidden", arrangeColumns);
        series.events.on("shown", arrangeColumns);
        series.columns.template.tooltipText = "{valueY.value}";

        let bullet = series.bullets.push(new am4charts.LabelBullet())
        bullet.interactionsEnabled = false
        bullet.dy = 15;
        bullet.label.text = '{valueY}'
        bullet.label.fill = am4core.color('#ffffff')
        return series;
      }

      chart.data = this.WorkDoneByYuvakBarchart;
      // chart.padding(10, 5, 5, 5);
      createSeries('TotalWork', 'Work Done by Committees');
      // createSeries('TotalWork', 'Total Work Done');

      function arrangeColumns() {

        var series: any = chart.series.getIndex(0);

        let w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
        if (series.dataItems.length > 1) {
          let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
          let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
          let delta = ((x1 - x0) / chart.series.length) * w;
          if (am4core.isNumber(delta)) {
            let middle = chart.series.length / 2;

            let newIndex = 0;
            chart.series.each(function (series) {
              if (!series.isHidden && !series.isHiding) {
                series.dummyData = newIndex;
                newIndex++;
              }
              else {
                series.dummyData = chart.series.indexOf(series);
              }
            })
            let visibleCount = newIndex;
            let newMiddle = visibleCount / 2;

            chart.series.each(function (series) {
              let trueIndex = chart.series.indexOf(series);
              let newIndex = series.dummyData;

              let dx = (newIndex - trueIndex + middle - newMiddle) * delta

              series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
              series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
            })
          }
        }
      }
    });
  }
  mahaSVGMap(data: any) {
    setTimeout(() => {
      if (data.length != 0) {
        data.forEach((ele: any) => {
          if (ele.TotalWork > 0) {
            this.addAndRemoveClass(ele.DistrictId);
            //   $('path#' + ele.DistrictId).css('filter', 'invert(11%) sepia(7%) saturate(6689%) hue-rotate(205deg) brightness(98%) contrast(87%)');
            $('#mapsvg  #' + ele.DistrictName).text(ele.TotalWork);
            ele.TotalWork < 6 ? $('#mapsvg  #' + ele.DistrictId).addClass('lessThanFive') : ele.TotalWork > 6 ? $('#mapsvg  #' + ele.DistrictId).addClass('greaterThanFive') : '';

          } else {
            // let checksvgDistrictActive1 = $('#mapsvg   path').hasClass("greaterThanFive");
            // checksvgDistrictActive1 == true ? $('#mapsvg   path#' + ele.DistrictId).removeClass("greaterThanFive") : ''
            this.addAndRemoveClass(ele.DistrictId);
            $('#mapsvg  #' + ele.DistrictId).addClass("zeroActivity");
            $('#mapsvg  #' + ele.DistrictName).text('');
            this.totalWorkCount = ele.TotalWork;
            // $('path#' + ele.DistrictId).addClass('zeroActivity');
          }
        })
      } else {
        this.addClasscommitteeWise();
      }
    }, 500);
  }

  addAndRemoveClass(DistrictId: any) {
    let checksvgDistrictActive = $('#mapsvg   path').hasClass("lessThanFive");
    let checksvgDistrictActiveClass = $('#mapsvg   path').hasClass("greaterThanFive");
    if (checksvgDistrictActive == true) $('#mapsvg   path#' + DistrictId).removeClass("lessThanFive")
    if (checksvgDistrictActiveClass == true) $('#mapsvg   path#' + DistrictId).removeClass("greaterThanFive");
  }

  catChange(value: any) {
    this.catValue = value.name;
    if (this.catValue == 'Committee') {
      this.filterBestPer.controls['DistrictId'].setValue(0);
      this.filterBestPer.controls['TalukaId'].setValue(0);
      this.getMemberName();
    } else {
      this.filterBestPer.controls['BodyId'].setValue(0);
      this.filterBestPer.controls['IsBody'].setValue(1);
    }
    this.bestPerformance();
  }

  ngOnDestroy() {
    // sessionStorage.removeItem('weekRange');
    this.graphInstance.destroy();
  }

  redirectOrgDetails(bodyId: any, BodyOrgCellName: any, bodylevelId: any) {
    let obj = { bodyId: bodyId, BodyOrgCellName: BodyOrgCellName, bodylevelId: bodylevelId }
    sessionStorage.setItem('bodyId', JSON.stringify(obj))
    this.router.navigate(['../../committee/details'], { relativeTo: this.route })
  }

  redToMemberProfile(memberId: any, FullName: any) {
    let obj = { 'memberId': memberId, 'FullName': FullName }
    sessionStorage.setItem('memberId', JSON.stringify(obj));
    this.router.navigate(['../../profile'], { relativeTo: this.route })
  }

  getMemberName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetBodyOrgCellName_1_0_Committee?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.memberNameArray = res.data1;
      } else {
        this.spinner.hide(this.memberNameArray);
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  redTocommitteesOnMap(DistrictId: any, CommitteeId: any, committeeName: any) {
    let obj = { 'DistrictId': DistrictId, 'CommitteeId': CommitteeId, 'committeeName': committeeName }
    sessionStorage.setItem('DistrictIdWorkThisWeek', JSON.stringify(obj));
    this.router.navigate(['../../committees-on-map'], { relativeTo: this.route });

  }

}
