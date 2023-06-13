import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Component({
  selector: 'app-booth-analytics',
  templateUrl: './booth-analytics.component.html',
  styleUrls: ['./booth-analytics.component.css']
})

export class BoothAnalyticsComponent implements OnInit{
 
  subject: Subject<any> = new Subject();
  subjectForFamily: Subject<any> = new Subject();
  subjectForVoters: Subject<any> = new Subject();
  searchVoters = new FormControl('');
  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  IsSubElectionApplicable: any;
  villageNameArray: any;
  clientWiseBoothListArray: any;
  cardData: any;

  HighlightRow: any = 0;
  paginationNo: number = 1;
  filterForm!: FormGroup;

  clientIdFlag: boolean = true;
  electionFlag: boolean = true;
  constituencyFlag: boolean = true;
  villageFlag: boolean = true;
  boothFlag: boolean = true;
  dataNotFound: boolean = false;
  boothDataHide: boolean = false;
  clientIdDisabled: boolean = false;
  isAgewiseChart: boolean = false;
  isReligionwiseChart: boolean = false;
  isCasteWiseChart: boolean = false;

  impLeadersList: any;
  impLeadersTotal: any;
  impLeadersPaginationNo = 1;

  areaWiseVotersList: any;
  areaWiseVotersTotal: any;
  commonIssuesList: any;
  migrationPatternList: any;
  professionFamiliesList: any;
  partyVotersList: any;
  isPartyVotersChart: boolean = false;
  isocialMediaSuprtChart: boolean = false;

  areaWiseVoterConfig: any;
  socialSupporterConfig: any;
  votersConfig: any;
  comnIssueConfig: any;
  migrationPatternConfig: any;
  socialMediaSuprtList: any;
  votersList: any;
  supportToid: any;

  selectedBoot: any[] = []
  selectedVillage: any;
  boothwiseVotersList: any;
  AreaId: any = 0;
  IsFilled: any = 0;
  openModal: boolean = false;
  PartyId: any = 0;
  selectedBoothIds: any;
  bootwiseVotersConfig: any;
  bootwiseFamiliesConfig: any;
  bootMigratedConfig: any;

  boothwiseFamiliesList: any
  selectedTitle: any
  selectedVoterCount: any
  ProfessionId: any = 0
  CityName: any
  boothMigratedList: any

  HideVoterListLink: boolean = false;
  boothVoterListPromLeaderArray: any;
  boothFamilyVLPromLeaderArray: any;
  IsPartyCheck: any;
  PartyIdper: any;
  ageWiseVoterCountData: any;
  religionWiseVoterCountData: any;
  castWiseVoterCountData: any;
  boothFamilyDetailsArray: any

  migPatternpagesize: number = 10;
  impLeaderspagesize: number = 10;
  socialSupppagesize: number = 10;
  areaWisepagesize: number = 10;

  migVoterListpagesize: number = 10;
  ProfwiseFamilyListpagesize: number = 10;
  boothwiseVotersListpagesize: number = 10; 
  socialMediaSupVoterspagesize: number = 10;
  commonBoothIssuepagesize: number = 10;
  localLeaderWiseVoterspagesize: number = 10;

  isFamilyCheck:any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.defaultFilterForm();
    this.getClientName();
    this.checkHideDisabledField();
    am4core.addLicense("ch-custom-attribution");
    this.searchMigratedFilters('false');
    this.searchVotersFilters('false');
    this.searchFamiliesFilters('false');
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      VillageId: [0],
      BoothId: [0],
    })
  }

  checkHideDisabledField() { //when UserType Login
    if (this.commonService.loggedInSubUserTypeId() == 2) {
      this.clientIdFlag = false;
      this.clientIdDisabled = true;
    } else {
      this.clientIdFlag = true;
      this.clientIdDisabled = false;
    }
  }

  //....................  Top Filter Api Code Start Here..............................//

  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
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
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName(), this.electionFlag = false) : '';
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
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId }), this.constituencyFlag = false), this.getVillageName()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageName() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.villageNameArray = res.responseData;
        this.villageNameArray.length == 1 ? ((this.filterForm.patchValue({ VillageId: this.villageNameArray[0].villageId }), this.villageFlag = false), this.ClientWiseBoothList()) : this.ClientWiseBoothList();
        // this.ClientWiseBoothList();
      } else {
        this.villageNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + (this.filterForm.value.village || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
        this.clientWiseBoothListArray.length == 1 ? (this.boothFlag = false, this.bindData()) : this.bindData();
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
        // this.clearForm();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //....................  Top Filter Api Code End Here..............................//

  bindData() {
    this.impLeadersPaginationNo = 1;
    this.selectedBoot = [];
    this.selectedBoothIds = [];
    if (this.filterForm.value.BoothId) {
      this.clientWiseBoothListArray.filter((ele: any) => {
        if (this.filterForm.value.BoothId == ele.boothId) {
          this.selectedBoot.push(ele);
          this.selectedBoothIds.push(ele.boothId);
        }
      })
    } else {
      this.selectedBoothIds = this.clientWiseBoothListArray.map(function (ele: any) {
        return ele.boothId;
      })
    }
    this.villageNameArray.filter((ele: any) => {
      if (this.filterForm.value.VillageId == ele.villageId) {
        this.selectedVillage = ele;
      }
    })

    this.migrationPatternConfig = { id: 'migrationPatternPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.areaWiseVoterConfig = { id: 'areaWiseVoterPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.socialSupporterConfig = { id: 'socialSupporterPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.votersConfig = { id: 'votersListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.comnIssueConfig = { id: 'commonIssuePagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.bootwiseVotersConfig = { id: 'boothVotersListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.bootwiseFamiliesConfig = { id: 'boothFamiliesListPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }
    this.bootMigratedConfig = { id: 'boothMigratedPagination', itemsPerPage: 10, currentPage: 1, totalItems: 0 }

    this.bindMigratedVoters();
    this.boothSummary();
    this.boothSummaryGraphs(); // age,Religion,Cast Chart Api
    this.getProfessionWiseFamiliesCount();

    this.partyWiseVoters();
    this.bindImpLeaders();
    this.bindAreaWiseVoters();
    this.bindSocialMediaSuprt();
    this.bindAreaWiseCommonIssues();
    // this.viewBoothwiseFamiliesList();
  }

  boothSummary() { // Get Voter Top Client Summary Count
    this.dataNotFound = true
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0);
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetBoothAnalyticsSummary?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.cardData = res.responseData[0];
      } else {
        this.cardData = [];
        this.spinner.hide();
        this.dataNotFound = false;
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //............................................... Chart CoDE Start Here ..............................................//

  agewiseVotersChart(obj: any) {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('chartdiv', am4charts.XYChart)
    chart.colors.step = 2;
    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95
    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'ageGroup'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;
    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;
    function createSeries(value: any, name: any) {
      var series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'ageGroup'
      series.name = name
      series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;
      return series;
    }
    chart.data = obj;
    createSeries('totalFemale', 'Female');
    createSeries('totalMale', 'Male');
    createSeries('totalOther', 'Other');
    chart.scrollbarX = new am4core.Scrollbar();
  }

  religionwiseChart(obj: any) {
    let chart = am4core.create("religionwisediv", am4charts.PieChart);
    chart.data = obj;
    let colorSet = new am4core.ColorSet();
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "totalVoters";
    pieSeries.dataFields.category = "religionName";
    pieSeries.innerRadius = am4core.percent(50);
    pieSeries.ticks.template.disabled = true;
    pieSeries.colors = colorSet;
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.fontSize = 13;
    pieSeries.labels.template.radius = am4core.percent(-30);
    pieSeries.labels.template.fill = am4core.color("white");
    pieSeries.slices.template.tooltipText = "{category}: {value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.align = "right";
    pieSeries.labels.template.textAlign = "end";
    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });
    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });
    chart.legend = new am4charts.Legend();
    let marker = chart.legend.markers.template.children.getIndex(0);
    chart.legend.valueLabels.template.text = "{value.value}";
    chart.legend.valueLabels.template.align = "left";
  }

  casteWiseChart(obj: any) {
    var chart = am4core.create("castewisediv", am4charts.XYChart);
    chart.data = obj;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "castName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "totalVoters";
    series.dataFields.categoryX = "castName";
    series.columns.template.strokeWidth = 0;
    var bullet = series.bullets.push(new am4charts.LabelBullet());
    bullet.label.text = "{valueY}";
    bullet.label.verticalCenter = "bottom";
    bullet.label.dy = -5;
    chart.maskBullets = false;
    series.columns.template.adapter.add("fill", function (fill: any, target: any) {
      return chart.colors.getIndex(target.dataItem.index);
    })
  }

  partywiseVotersChart(obj: any) {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('partywiseVoterschartdiv', am4charts.XYChart)
    chart.colors.step = 2;
    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95
    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'partyshortcode'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;
    xAxis.renderer.minGridDistance = 30;
    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;
    function createSeries(value: any, name: any) {
      var series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'partyshortcode'
      series.name = name
      series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;
      return series;
    }
    chart.data = obj;
    createSeries("totalFamily", "Family");
    createSeries("totalVoter", "Voter");
    chart.scrollbarX = new am4core.Scrollbar();
  }

  socialMediaSuprtChart(obj: any) {
    let chart = am4core.create("socialMediaSuprtdiv", am4charts.PieChart);
    chart.data = obj;
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "support";
    pieSeries.dataFields.category = "supporterName";
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.fontSize = 10;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    pieSeries.labels.template.fill = am4core.color("white");
    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });
    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#000");
      }
      return color;
    });
    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.contentAlign = "left";
    chart.legend.valueLabels.template.text = "{category.category}";
    chart.legend.scrollable = true;
  }

  //............................................... Chart CoDE End Here ..............................................//


  //............................................... Chart Api CoDE Start Here ..............................................//

  boothSummaryGraphs() { // age,Religion,Cast Chart Api
    this.getAgeWiseVoterCount();
    this.getReligionWiseVoterCount();
    this.getCastWiseVoterCount();
  }

  getAgeWiseVoterCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetAgeWiseVoterCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.ageWiseVoterCountData = res.responseData;
        this.isAgewiseChart = true;
          this.agewiseVotersChart(this.ageWiseVoterCountData);
      } else {
        this.isAgewiseChart = false;
        this.ageWiseVoterCountData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getReligionWiseVoterCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetReligionWiseVoterCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.religionWiseVoterCountData = res.responseData;
        this.isReligionwiseChart = true;
          this.religionwiseChart(this.religionWiseVoterCountData);
      } else {
        this.isReligionwiseChart = false
        this.religionWiseVoterCountData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getCastWiseVoterCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetCastWiseVoterCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.castWiseVoterCountData = res.responseData;
        this.isCasteWiseChart = true;
          this.casteWiseChart(this.castWiseVoterCountData);
      } else {
        this.isCasteWiseChart = false
        this.castWiseVoterCountData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  partyWiseVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetPartywiseVoter?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        // this.professionFamiliesList = res.data2;
        this.partyVotersList = res.responseData;
          this.partyVotersList.length > 0 ? (this.isPartyVotersChart = true, this.partywiseVotersChart(this.partyVotersList)) : this.isPartyVotersChart = false;
      } else {
        // this.professionFamiliesList = [];
        this.partyVotersList = [];
        this.isPartyVotersChart = false
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //............................................... Chart Api CoDE End Here ..............................................//


  //.............................. Migration Pattern Table CoDE Start Here ............................//

  onClickPagintionMigrattionPattern(pageNo: any) {
    this.migrationPatternConfig.currentPage = pageNo;
    this.bindMigratedVoters();
  }

  bindMigratedVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.migrationPatternConfig.currentPage + '&pagesize=' + this.migPatternpagesize
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetMigrationPatternCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.migrationPatternList = res.responseData.responseData1;
        this.migrationPatternConfig.totalItems = res.responseData.responseData2.totalPages * this.migPatternpagesize;
      } else {
        this.migrationPatternList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //..................... Inside Code Start Here ..........................//

  onKeyUpFilterMigrated() {
    this.subject.next();
  }

  searchMigratedFilters(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootMigratedConfig.currentPage = 1; this.bootMigratedConfig.totalItems = 0;
        this.viewMigrationVotersList();
      });
  }

  onClickMigratedCount(obj: any) {
    this.CityName = obj.migratedCity, this.selectedTitle = obj.migratedCity, this.selectedVoterCount = obj.totalVoters
    this.searchVoters.setValue('');
    this.bootMigratedConfig.currentPage = 1; this.bootwiseFamiliesConfig.totalItems = 0;
    this.boothMigratedList = [];
    this.viewMigrationVotersList();
  }

  onClickPagintionBoothMigrated(pageNo: any) {
    this.bootMigratedConfig.currentPage = pageNo;
    this.viewMigrationVotersList();
  }

  viewMigrationVotersList() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootMigratedConfig.currentPage + '&Search=' + this.searchVoters.value?.trim()
      + '&CityName=' + this.CityName + '&pagesize=' + this.migVoterListpagesize;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetMigratedVoterList?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothMigratedList = res.responseData.responseData1;
        this.bootMigratedConfig.totalItems = res.responseData.responseData2.totalPages * this.migVoterListpagesize;
      } else {
        this.boothMigratedList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //..................... Inside Code End Here ..........................// 

  //.............................. Migration Pattern Table CoDE End Here ............................//

  //.............................. Profession Wise Families Table CoDE Start Here ............................//

  getProfessionWiseFamiliesCount() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0)
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetProfessionWiseFamiliesCount?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.professionFamiliesList = res.responseData;
      } else {
        this.professionFamiliesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.............................. Profession Wise Families Table CoDE End Here ............................//

  //.......................... Important Leaders In This Village/Booth Table CoDE Start Here .........................//

  onClickPagintionImpLeaders(pageNo: any) {
    this.impLeadersPaginationNo = pageNo;
    this.bindImpLeaders();
  }

  bindImpLeaders() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.impLeadersPaginationNo + '&pagesize=' + this.impLeaderspagesize
    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetBoothWiseImpLeaders?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.impLeadersList = res.responseData.responseData1;
        this.impLeadersTotal = res.responseData.responseData2.totalPages * this.impLeaderspagesize;
      } else {
        this.impLeadersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //........................... Important Leaders In This Village/Booth Table CoDE End Here ........................//

  //........................... Common Issues In This Area Table CoDE Start Here ........................//

  onClickPagintionCommonIssues(pageNo: any) {
    this.comnIssueConfig.currentPage = pageNo;
    this.bindAreaWiseCommonIssues();
  }

  bindAreaWiseCommonIssues() {

    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.comnIssueConfig.currentPage + '&pagesize=' + this.commonBoothIssuepagesize

    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetCommonBoothIssue?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.commonIssuesList = res.responseData.responseData1;
        this.comnIssueConfig.totalItems = res.responseData.responseData2.totalPages * this.commonBoothIssuepagesize;
      } else {
        this.commonIssuesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //........................... Common Issues In This Area Table CoDE End Here ........................//

  //........................... Area Wise Voters Table CoDE Start Here ........................//

  onClickPagintionareaWiseVoters(pageNo: any) {
    this.areaWiseVoterConfig.currentPage = pageNo;
    this.bindAreaWiseVoters();
  }

  bindAreaWiseVoters() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.areaWiseVoterConfig.currentPage + '&pagesize=' + this.areaWisepagesize
    let obj1 = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.areaWiseVoterConfig.currentPage + '&pagesize=' + this.areaWisepagesize
    let url;
    //this.filterForm.value.BoothId ? url = 'BoothAnalytics/GetAreaWiseVoters?' + obj1 : url = 'BoothAnalytics/GetBoothWiseVoterSummary?' + obj;
    url = 'BoothAnalytics/GetAreaWiseVoters?' + obj1 
    this.spinner.show();
    this.callAPIService.setHttp('get', url, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.areaWiseVotersList = res.responseData.responseData1;
        this.areaWiseVoterConfig.totalItems = res.responseData.responseData2.totalPages * this.areaWisepagesize;
      } else {
        this.areaWiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //........................... Area Wise Voters Table CoDE End Here ........................//

  //........................... Social Media Supporter Table CoDE Start Here ........................//

  onClickPagintionsocialSupporter(pageNo: any) {
    this.socialSupporterConfig.currentPage = pageNo;
    this.bindSocialMediaSuprt();
  }
  bindSocialMediaSuprt() {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&nopage=' + this.socialSupporterConfig.currentPage + '&pagesize=' + this.socialSupppagesize

    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetSocialMediaSupport?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.socialMediaSuprtList = res.responseData.responseData1;
        this.socialSupporterConfig.totalItems = res.responseData.responseData2.totalPages * this.socialSupppagesize;
          this.socialMediaSuprtList.length > 0 ? (this.isocialMediaSuprtChart = true, this.socialMediaSuprtChart(this.socialMediaSuprtList)) : this.isocialMediaSuprtChart = false;
      } else {
        this.isocialMediaSuprtChart = false;
        this.socialMediaSuprtList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionVoters(pageNo: any) {
    this.votersConfig.currentPage = pageNo;
    this.showVotersList(this.supportToid);
  }

  showVotersList(supporter: any) {
    this.supportToid = supporter.supporterOfId
    this.selectedTitle = supporter.supporterName
    this.selectedVoterCount = supporter.totalVoter
    this.votersList = [];

    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&SupportToid=' 
    + this.supportToid + '&pageno=' + this.votersConfig.currentPage + '&pagesize=' + this.socialMediaSupVoterspagesize + '&Search=' +''

    this.spinner.show();
    this.callAPIService.setHttp('get', 'BoothAnalytics/GetSocialMediaSupporterVoters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.votersList = res.responseData.responseData1;
        this.votersConfig.totalItems = res.responseData.responseData2.totalPages * this.socialMediaSupVoterspagesize;
      } else {
        this.votersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

//........................... Social Media Supporter Table CoDE End Here ........................//

 //...............................  Voter Table Code Start Here ................................//

  onClickAreaVoter(obj: any, isFill: any, voterType: any) {
    this.searchVoters.setValue('');
    this.bootwiseVotersConfig.currentPage = 1;
     this.bootwiseVotersConfig.totalItems = 0;
    if(voterType == 'PartyVoter'){
      this.AreaId = 0; this.PartyId = obj.partyId;
      this.selectedTitle = obj.partyName;
      this.selectedVoterCount = obj.totalVoter;
    } else{
      this.PartyId = 0; this.AreaId = obj.boothId;
      this.selectedTitle = obj.boothName;
      this.selectedVoterCount = (voterType == 'totalVoters' ? obj.totalVoters : obj.updatedVoters);
    }
    this.IsFilled = isFill;
    this.boothwiseVotersList = [];
    this.IsPartyCheck = obj.isParty;
    this.PartyIdper = obj.partyId;
    if (obj.isParty == 2) {
      this.boothVLNoSubPromLeader(obj.partyId);
    } else {
      this.viewBoothwiseVotersList();
    }
  }

  onClickPagintionBoothVoters(pageNo: any) {
    this.bootwiseVotersConfig.currentPage = pageNo;
    if (this.IsPartyCheck == 2) {
      this.boothVLNoSubPromLeader(this.PartyIdper);
    } else {
      this.viewBoothwiseVotersList();
    }
  }

  viewBoothwiseVotersList() {
    let obj:any;
    let url:any;
    if(this.IsFilled == 1){ //updatedVoter
      url = 'BoothAnalytics/GetAreaWiseUpdatedVoters?';
      obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value?.trim() +
      '&AreaId=' + this.AreaId + '&pagesize=' + this.boothwiseVotersListpagesize 
    } else if(this.IsFilled == 2){ //totalVoters
      url = 'BoothAnalytics/GetAreaWiseTotalVoterList?';
      obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value?.trim() +
      '&AreaId=' + this.AreaId + '&pagesize=' + this.boothwiseVotersListpagesize
    } else if(this.IsFilled == 3){ //PartyVoter
      url = 'BoothAnalytics/GetPartyWiseVoters?';
      obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value?.trim() +
      '&PartyId=' + this.PartyId + '&pagesize=' + this.boothwiseVotersListpagesize + '&IsFamily=' + 0
    }

    this.spinner.show();
    this.callAPIService.setHttp('get', url + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothwiseVotersList = res.responseData.responseData1;
        this.bootwiseVotersConfig.totalItems = res.responseData.responseData2.totalPages * this.boothwiseVotersListpagesize;
      } else {
        this.boothwiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onKeyUpFilterVoters() {
    this.subjectForVoters.next();
  }

  searchVotersFilters(flag: any) {
    this.subjectForVoters
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootwiseVotersConfig.currentPage = 1; this.bootwiseVotersConfig.totalItems = 0;
        if (this.IsPartyCheck == 2) {
          this.boothVLNoSubPromLeader(this.PartyIdper);
        } else {
          this.viewBoothwiseVotersList();
        }
      }
      );
  }

  clearFiltersVoters(flag: any) {  //families & voters Search Clear
    if (flag == 'clearSearchVoters') {
      this.searchVoters.setValue('');
      this.bootwiseVotersConfig.currentPage = 1;
      if (this.IsPartyCheck == 2) {
        this.boothVLNoSubPromLeader(this.PartyIdper);
      } else {
        this.viewBoothwiseVotersList();
      }
    } else if (flag == 'clearSearchFamilies') {
      this.searchVoters.setValue('');
      this.bootwiseFamiliesConfig.currentPage = 1;
      if (this.IsPartyCheck == 2) {
        this.boothFamillyVLNoSubPromLeader(this.PartyIdper);
      } else {
        this.viewBoothwiseFamiliesList();
      }
    } else if (flag == 'clearSearchMigrated') {
      this.searchVoters.setValue('');
      this.bootMigratedConfig.currentPage = 1;
      this.viewMigrationVotersList();
    }
  }

   //...............................  Families Table Code Start Here ................................//

  onKeyUpFilterFamilies() {
    this.subjectForFamily.next();
  }

  searchFamiliesFilters(flag: any) {
    this.subjectForFamily
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchVoters.value;
        this.bootwiseFamiliesConfig.currentPage = 1;
         this.bootwiseFamiliesConfig.totalItems = 0;
         if (this.IsPartyCheck == 2) {
          this.boothFamillyVLNoSubPromLeader(this.PartyIdper);
        } else {
          this.viewBoothwiseFamiliesList();
        }
      }
      );
  }

  onClickFamilyCount(obj: any, isFamily: any) {
    this.isFamilyCheck = isFamily;
    isFamily == 1 && (this.AreaId = 0, this.ProfessionId = 0, this.PartyId = obj.partyId, this.selectedTitle = obj.partyName, this.selectedVoterCount = obj.totalFamily)
    isFamily == 2 && (this.PartyId = 0, this.ProfessionId = 0, this.AreaId = obj.boothId, this.selectedTitle = obj.boothName, this.selectedVoterCount = obj.totalFamily)
    isFamily == 3 && (this.PartyId = 0, this.AreaId = 0, this.ProfessionId = obj.srNo, this.selectedTitle = obj.profession, this.selectedVoterCount = obj.totalVoters)
    this.searchVoters.setValue('');
    this.bootwiseFamiliesConfig.currentPage = 1; 
    this.bootwiseFamiliesConfig.totalItems = 0;
    this.boothwiseFamiliesList = [];
    this.IsPartyCheck = obj.isParty;
    this.PartyIdper = obj.partyId;
    if (obj.isParty == 2) {
      this.boothFamillyVLNoSubPromLeader(obj.partyId);
    } else {
      this.viewBoothwiseFamiliesList();
    }
  }

  onClickPagintionBoothFamilies(pageNo: any) {
    this.bootwiseFamiliesConfig.currentPage = pageNo;

    if (this.IsPartyCheck == 2) {
      this.boothFamillyVLNoSubPromLeader(this.PartyIdper);
    } else {
      this.viewBoothwiseFamiliesList();
    }
  }

  viewBoothwiseFamiliesList() {
    let obj:any;
    let url:any;
    if(this.isFamilyCheck == 1){
      url = 'BoothAnalytics/GetPartyWiseVoters?';
      obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseFamiliesConfig.currentPage  + '&Search=' + this.searchVoters.value?.trim() +
      '&PartyId=' + this.PartyId + '&pagesize=' + this.boothwiseVotersListpagesize + '&IsFamily=' + 1
    } else if(this.isFamilyCheck == 2) {
      url = 'BoothAnalytics/GetAreaWiseFamilies?';
      obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value?.trim()
      + '&AreaId=' + this.AreaId + '&pagesize=' + this.ProfwiseFamilyListpagesize
    } if(this.isFamilyCheck == 3) {
      url = 'BoothAnalytics/GetProfessionwiseFamilyList?';
      obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value?.trim()
      + '&ProfessionId=' + this.ProfessionId + '&pagesize=' + this.ProfwiseFamilyListpagesize
    }

    this.spinner.show();
    this.callAPIService.setHttp('get', url + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothwiseFamiliesList = res.responseData.responseData1;
        this.bootwiseFamiliesConfig.totalItems = res.responseData.responseData2.totalPages * this.ProfwiseFamilyListpagesize;
      } else {
        this.boothwiseFamiliesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  familyDetails(ParentVoterId: any, AgentId: any) {
    let obj = 'ParentVoterId=' + ParentVoterId + '&AgentId=' + AgentId + '&ClientId=' + this.filterForm.value.ClientId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'VoterList/GetFamilyMember?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothFamilyDetailsArray = res.responseData;
      } else {
        this.boothFamilyDetailsArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }
  
  // Web_Get_Client_Booth_MigrationCitywise_VoterList_1_0(long ClientId, long UserId, long ElectionId, long ConstituencyId, long AssemblyId, long BoothId, long VillageId, string Search, int nopage, string CityName)
  // ------------------------------------------filter data all methodes start here ------------------------------ //

  redirectToVoterPrfile(obj: any) {
    window.open('../voters-profile/' + (obj.UserId || obj.userid || obj.agentId || 0) + '.' + this.filterForm.value.ClientId + '.' + obj.voterId);
  }

  clearForm() {
    this.cardData = [];
    this.impLeadersList = [];
    this.commonIssuesList = [];
    this.socialMediaSuprtList = [];
    this.votersList = [];
    this.areaWiseVotersList = [];
    this.impLeadersList = [];
    this.dataNotFound = false;
    this.impLeadersPaginationNo = 1;
  }

  clearFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.reset()
    } else if (flag == 'electionId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId })
    } else if (flag == 'constituencyId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId })
    } else if (flag == 'VillageId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId })
      this.selectedVillage = '';
    } else if (flag == 'BoothId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId, VillageId: this.filterForm.value.VillageId })
      this.clientWiseBoothListArray = [];
      this.filterForm.controls['BoothId'].setValue(0);
    }
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
  }

  //................................... nullish FilterForm .....................................//

  nullishFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.VillageId ?? this.filterForm.controls['VillageId'].setValue(0);
    fromData.BoothId ?? this.filterForm.controls['BoothId'].setValue(0);
  }

  // ........................  Redirect To redToViewBoothWise Voter-List Page ...............................//

  redToViewBoothWiseVoterListPage() {
    this.nullishFilterForm();
    let formData = this.filterForm.value;
    let obj = {
      ClientId: formData.ClientId, ElectionId: formData.ElectionId, ConstituencyId: formData.ConstituencyId,
      VillageId: formData.VillageId, BoothId: formData.BoothId, flag: 1
    }
    window.open('../view-boothwise-voters-list/' + obj.ClientId + '.' + obj.ElectionId + '.' + obj.ConstituencyId
      + '.' + obj.VillageId + '.' + obj.BoothId + '.' + obj.flag);
  }

  VoterListLinkShowHide() {
    if (this.filterForm.value.VillageId != 0 && this.filterForm.value.BoothId != 0 && this.areaWiseVotersList?.length != 0) {
      this.HideVoterListLink = true;
    }
    else {
      this.HideVoterListLink = false;
    }
  }

  //............................   Prominent Leader Regarding Code Start Here ...................................//

  boothVLNoSubPromLeader(PartyId: any) {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseVotersConfig.currentPage + '&Search=' + this.searchVoters.value?.trim() +
   '&ProminentLeaderId=' + PartyId + '&pagesize=' + this.localLeaderWiseVoterspagesize + '&IsFamily=' + 0 
   
   this.spinner.show();
   this.callAPIService.setHttp('get', 'BoothAnalytics/GetLocalLeaderWiseVoters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothwiseVotersList = res.responseData.responseData1;
        this.bootwiseVotersConfig.totalItems = res.responseData.responseData2.totalPages * this.localLeaderWiseVoterspagesize;
      } else {
        this.boothwiseVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  boothFamillyVLNoSubPromLeader(PartyId: any) {
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&BoothId=' + (this.filterForm.value.BoothId || 0) + '&VillageId=' + (this.filterForm.value.VillageId || 0) + '&pageno=' + this.bootwiseFamiliesConfig.currentPage + '&Search=' + this.searchVoters.value?.trim() +
     '&ProminentLeaderId=' + PartyId + '&pagesize=' + this.localLeaderWiseVoterspagesize + '&IsFamily=' + 1
   
    this.spinner.show();
   this.callAPIService.setHttp('get', 'BoothAnalytics/GetLocalLeaderWiseVoters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothwiseFamiliesList = res.responseData.responseData1; //  Array Name is Same As viewBoothwiseFamiliesList();
        this.bootwiseFamiliesConfig.totalItems = res.responseData.responseData2.totalPages * this.localLeaderWiseVoterspagesize;
      } else {
        this.boothwiseFamiliesList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //............................   Prominent Leader Regarding Code End Here ...................................//

}
