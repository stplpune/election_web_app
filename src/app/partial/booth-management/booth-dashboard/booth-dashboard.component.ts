import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


@Component({ selector: 'app-booth-dashboard', templateUrl: './booth-dashboard.component.html', styleUrls: ['./booth-dashboard.component.css'] })
export class BoothDashboardComponent implements OnInit {
  webBannerImage: any;
  totalVotersCount !: number;
  totalBoothsCount !: number;
  totalMaleCount !: number;
  totalFeMaleCount !: number;

  cliendId !: any;
  electionId !: any;
  constitusionId !: any;
  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  chartData: any;
  isAgewiseChart: boolean = false;

  constructor(private spinner: NgxSpinnerService, private callAPIService: CallAPIService, private toastrService: ToastrService, public commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.bannerImg();
    this.getClientName();
  }

  bannerImg() {
    this.webBannerImage = this.commonService.getlocalStorageData().WebBannerImage;
  }

  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientNameArray = res.responseData;
        this.cliendId = this.clientNameArray.length == 1 ? this.clientNameArray[0].clientId : undefined;
        if (this.cliendId != null && this.cliendId != undefined) {
          this.getElectionName();
        }
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
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.cliendId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        console.log(this.electionNameArray);
        this.electionId = this.electionNameArray.length > 0 ? this.electionNameArray[0].electionId : undefined;
        if (this.electionId != null && this.electionId != undefined) {
          this.getConstituencyName();
        }
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
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.cliendId + '&ElectionId=' + this.electionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        console.log(this.electionId);
        this.constitusionId = this.constituencyNameArray[0].constituencyId
        this.getAnaliticalData();
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  changeElection(event: any) {
    this.electionId = event.target.value;
    this.getConstituencyName();
  }
  changeConstituency(event: any) {
    this.constitusionId = event.target.value;
    this.getAnaliticalData();
  }
  getAnaliticalData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetDataUsingElectionAndConsitusionId?ClientId=' + this.cliendId + '&constitusionId=' + this.constitusionId + '&electionId=' + this.electionId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.totalBoothsCount = res.responseData.totalBoothsCount;
        this.totalVotersCount = res.responseData.totalVoters;
        this.totalMaleCount = res.responseData.totalMaleCount;
        this.totalFeMaleCount = res.responseData.totalFemaleCount;
        this.chartData = res.responseData.ageWiseReport;
        setTimeout(() => { // bind charts
          this.chartData.length > 0 ? (this.isAgewiseChart = true, this.agewiseVotersChart(this.chartData)) : this.isAgewiseChart = false;
        }, 500);

        console.log(this.totalBoothsCount);

      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }
  agewiseVotersChart(obj: any) {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create('chartdiv', am4charts.XYChart)
    chart.colors.step = 2;
    chart.legend = new am4charts.Legend()
    chart.legend.position = 'bottom'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 20
    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'ageGroup'
    xAxis.fontSize = 13;
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.labels.template.fontSize = 10;
    xAxis.title.text = "Age";

    xAxis.renderer.labels.template.verticalCenter = "middle";
    xAxis.renderer.minGridDistance = 0;

    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.renderer.labels.template.fontSize = 10;
    yAxis.title.text = "No. of Voters";
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
    createSeries('totalOther', 'Other Gender');
    chart.scrollbarX = new am4core.Scrollbar();

  }

}
