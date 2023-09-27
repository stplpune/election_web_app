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

@Component({
  selector: 'app-committees-on-map',
  templateUrl: './committees-on-map.component.html',
  styleUrls: ['./committees-on-map.component.css', '../partial.component.css']
})

export class CommitteesOnMapComponent implements OnInit, OnDestroy, AfterViewInit {

  resultCommittees: any;
  resultOrganizationMember: any;
  activeRow: any;
  selCommitteeName: any;
  districtName = "Maharashtra State";
  defaultCommitteesFlag: boolean = false;
  defaultMembersFlag: boolean = false;
  globalBodyId: any;
  defaultCloseBtn: boolean = false;
  allDistrict: any;
  selectedDistrictId: any;
  selDistrict = new FormControl();
  fromToDate = new FormControl();
  Search = new FormControl('');
  subject: Subject<any> = new Subject();
  searchFilter = "";
  DistrictId: any; //DistrictId fetch Work this Week Page
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

  constructor(private commonService: CommonService, private toastrService: ToastrService,
    private spinner: NgxSpinnerService, private router: Router, private fb: FormBuilder, public datePipe: DatePipe,
    private route: ActivatedRoute, private callAPIService: CallAPIService, public location: Location, 
    private datepipe:DatePipe,
    public dialog: MatDialog, public dateTimeAdapter: DateTimeAdapter<any>) {
    { dateTimeAdapter.setLocale('en-IN'); }
    let getsessionStorageData: any = sessionStorage.getItem('DistrictIdWorkThisWeek');
    if(getsessionStorageData){
      let DistrictId = JSON.parse(getsessionStorageData);
      this.DistrictId = DistrictId.DistrictId;
      this.CommitteeId = DistrictId.CommitteeId;
      this.committeeName = DistrictId.committeeName;
    }
  }

  ngOnInit(): void {
    this.loggedUserTypeId = this.commonService.loggedInSubUserTypeId();
    // this.selDistrictName();
    this.DistrictId ? this.getOrganizationByDistrictId(this.DistrictId) : this.getOrganizationByDistrictId(0);
    this.searchFilterByCommittee('false');
    !this.allLevels ? this.getLevel() : '';
     this.searchFilterMember();
  }

  selDistrictName() {
    this.loggedUserTypeId == 5 ? this.districtName = this.commonService.getCommiteeInfo().CommiteeName : this.districtName = "Maharashtra State";
  }

  svgMapColorReset() {
    $('#mapsvg1 path').css('fill', '#7289da');
  }

  ngAfterViewInit() {
    this.callSVGMap() // default call SVG MAP
    this.DistrictId == "" || this.DistrictId == undefined ? this.DistrictId = 0 : this.DistrictId = this.DistrictId;
    //this.selectDistrict(this.DistrictId); 10/01/22

    $(document).on('click', '#mapsvg1  path', (e: any) => { // add on SVG Map
      this.hideComityGraph= false;
      !this.allLevels ? this.getLevel() : '';
      this.CheckBoxLevelArray = [];
      this.onClickFlag = true;
      this.defaultMembersFlag = false;
      let getClickedId = e.currentTarget;
      let distrctId = $(getClickedId).attr('id');
      this.DistrictId = 0;
      this.selectedDistrictId = distrctId;
      this.toggleClassActive(Number(distrctId));
      this.getOrganizationByDistrictId(Number(distrctId));
    });
  }

  callSVGMap() {
    this.showSvgMap(this.commonService.mapRegions());
  }

  addClasscommitteeWise(id: any) {
    $('#mapsvg1  path').addClass('notClicked');
    setTimeout(() => {
      this.allDistrict.find((element: any) => {
        $('#mapsvg1  path[id="' + element.DistrictId + '"]').addClass('clicked');
        $('#mapsvg1  #'+element.DistrictName).text(element.TotalCommittee )
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

  selectDistrict(event: any) {
    this.hideComityGraph= false;
    !this.allLevels ? this.getLevel() : '';
    this.CheckBoxLevelArray = [];
    this.DistrictId = 0;
    this.selectedDistrictId = event;
    this.getOrganizationByDistrictId(this.selectedDistrictId);
    this.toggleClassActive(this.selectedDistrictId);
    this.defaultMembersFlag = false;
    // this.comActiveClass(0);  
  }

  onCheckChangeLevel(event: any,CheckBoxLevelId:any){
    this.hideComityGraph = false;
    if (event.target.checked == false) {
      let index = this.CheckBoxLevelArray.map((x: any) => { return x; }).indexOf(CheckBoxLevelId);
      this.CheckBoxLevelArray.splice(index, 1);
      this.getOrganizationByDistrictId(this.selectedDistrictId);
      //this.districtWiseCommityWorkGraph(this.selectedDistrictId); 10/01/22
      this.defaultMembersFlag = false;
      this.activeRow = 0;
      //this.CompofComityHide = false;
    }
    else {
      this.CheckBoxLevelArray.push(CheckBoxLevelId);
      this.getOrganizationByDistrictId(this.selectedDistrictId);
      //this.districtWiseCommityWorkGraph(this.selectedDistrictId); 10/01/22
      this.defaultMembersFlag = false;
      this.activeRow = 0;
      //this.CompofComityHide = false;
    }
  }

  ScrollCompComity(){
    this.fromToDate.setValue('');
    this.fromDate = '';
    this.toDate = '';
    this.hideComityGraph = true;
   setTimeout(() => {
    $('html, body .showmap').animate({ scrollTop: $('.showmap').offset().top }, 'slow');

    let checkDistrictId = this.DistrictId || this.selectedDistrictId;
    this.districtWiseCommityWorkGraph(checkDistrictId);
   }, 500);
  }

  getOrganizationByDistrictId(id?: any) {
    this.spinner.show();
    //this.CheckBoxLevelArray = this.CheckBoxLevelArray.join();
    let ids = id == undefined || id == "" || id == null ? 0 : id;
    this.CheckBoxLevelArrayJSON = this.CheckBoxLevelArray.join() || 0;
    //this.callAPIService.setHttp('get', 'Sp_Web_GetOrganization_byDistrictId_2_0?UserId=' + this.commonService.loggedInUserId() + '&DistrictId=' + id + '&Search=' + this.searchFilter + '&FromDate=&ToDate=', false, false, false, 'electionServiceForWeb');
    this.callAPIService.setHttp('get', 'Web_GetOrganization_byDistrictId_3_0?UserId=' + this.commonService.loggedInUserId() + '&DistrictId=' + ids + '&Search=' + this.searchFilter + '&LevelId=' + this.CheckBoxLevelArrayJSON + '&FromDate=&ToDate=', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        !this.allDistrict ?  this.getDistrict(id) : '';
        
        this.defaultCloseBtn = true;
        if (id == 0) {
          this.defaultCloseBtn = false;
        }
        this.defaultCommitteesFlag = true;
        this.spinner.hide();
        this.resultCommittees = res.data1;
        this.selDistrict.setValue(Number(id));
      } else {
        !this.allDistrict ?  this.getDistrict(id) : '';
        this.defaultCommitteesFlag = true;
        this.defaultCloseBtn = true;
        this.resultCommittees = [];
        this.selDistrict.setValue('');
        this.spinner.hide();
        this.selDistrict.setValue(Number(id));
      }

    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getDistrict(id: any) {
    // this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_WithCount_1_0_CommitteeonMap?StateId=' + 1 + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); //old API  Web_GetDistrict_1_0_Committee
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allDistrict = res.data1;
        // if district id != 0  then show district name
        this.CommitteeId && this.selCommiteeFlag ? this.committeeNameByOrganizationMember(this.CommitteeId, this.committeeName) : '';
        if (id != 0) {
          this.allDistrict.find((ele: any) => {
            if (ele.DistrictId == id) {
              this.districtName = ele.DistrictName;
            }
          });
        }
        // this.districtWiseCommityWorkGraph(id); 10/01/22
        this.addClasscommitteeWise(id);
        this.onClickFlag == false ?  $('#mapsvg1  path#' + this.selectedDistrictId).addClass('svgDistrictActive') : '';
       
         id == undefined ||   id == null ||  id == ""  ? '': this.toggleClassActive(id);
        // this.selectedDistrictId ? $('path#' + this.selectedDistrictId).addClass('svgDistrictActive') : this.toggleClassActive(0);
        
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getLevel() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetLevel_1_0_Committee_On_Map?UserId='+this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetLevel_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allLevels = res.data1;
        this.allLevels = this.allLevels.filter((item:any)=> (item.Id !== 10 && item.Id !== 8 && item.Id !== 9))
        this.spinner.hide();
      } else {
        this.spinner.hide();
        // this.toastrService.error("Data is not available 1");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  committeeNameByOrganizationMember(bodyId: any, committeeName: any) {
    this.defaultBodyMemForm(committeeName);
    this.committeeNameBOMember =  committeeName;
    this.spinner.show();
    this.globalBodyId = bodyId;
    this.activeRow = bodyId
    this.callAPIService.setHttp('get', 'Web_GetOrganizationMember_byBodyId_1_0?UserId=' + this.commonService.loggedInUserId() + '&BodyId=' + bodyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.comActiveClass(1)
        this.spinner.hide();
        this.selCommitteeName = committeeName;
        this.getOrganizationByDistrictId();
        this.resultOrganizationMember = res.data1;
      } else {
        this.comActiveClass(1)
        this.resultOrganizationMember = [];
        this.selCommitteeName = committeeName;
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  redirectOrgDetails() {
      let obj = { bodyId: this.globalBodyId, BodyOrgCellName: this.selCommitteeName,bodylevelId:this.commiteeObj.bodylevel}
      sessionStorage.setItem('bodyId', JSON.stringify(obj))
      this.router.navigate(['../committee/details'], { relativeTo: this.route })
  }

  redToMemberProfile(memberId:any,FullName:any){
    console.log(memberId,'-',FullName);
    let obj = {'memberId':memberId, 'FullName':FullName}
    sessionStorage.setItem('memberId', JSON.stringify(obj));
    // this.router.navigate(['/add-member'], {relativeTo:this.route})
  }

  comActiveClass(flag: any) { // 0 - false 1 - true
    flag == 0 ? this.defaultMembersFlag = false : this.defaultMembersFlag = true;
    this.selCommiteeFlag = false;

  }
  // --------------------------------------- filter start here ----------------------------------------------- //

  clearFilter(flag: any) {
    if (flag == 'CommitteesIn') {
      //this.CompofComityHide = false;
      this.selDistrict.reset();
      this.selDistrictName();
      this.defaultCloseBtn = false;
      this.onClickFlag  = true;
      // this.removeSessionData();
      this.toggleClassActive(0);
      this.getLevel();
      this.CheckBoxLevelArray = [];
      this.selectedDistrictId = 0;
      sessionStorage.removeItem('DistrictIdWorkThisWeek');
      this.hideComityGraph= false;
      this.getOrganizationByDistrictId(0);
    } else if (flag == 'dateRangePIcker') {
      this.clearDateRangeByFilter();
    }
    this.comActiveClass(0);
    this.activeRow = 0;
    // this.showSvgMap(this.commonService.mapRegions());

  }

  removeSessionData() {
    sessionStorage.setItem('DistrictIdWorkThisWeek', '');
  }


  selDateRangeByFilter(getDate: any) {
    this.comActiveClass(0);
    this.fromDate = this.datePipe.transform(getDate[0], 'dd/MM/yyyy');
    this.toDate = this.datePipe.transform(getDate[1], 'dd/MM/yyyy');
    let checkDistrictId;
    (this.selDistrict.value =="" || this.selDistrict.value  == null || isNaN(this.selDistrict.value) == true)  ? checkDistrictId = 0 :  checkDistrictId =  this.selDistrict.value;
    this.districtWiseCommityWorkGraph(checkDistrictId);
  }

  clearDateRangeByFilter() {
    this.fromToDate.setValue('');
    this.fromDate = '';
    this.toDate = '';
    let checkDistrictId;
    (this.selDistrict.value =="" || this.selDistrict.value  == null || isNaN(this.selDistrict.value) == true)  ? checkDistrictId = 0 :  checkDistrictId =  this.selDistrict.value;
    this.districtWiseCommityWorkGraph(checkDistrictId);
  }

  clearallFilter(){
    this.clearFilter('CommitteesIn');
    this.clearDateRangeByFilter();
    this.clearFilterByCommittee();
  }

  filterByCommittee() {
    this.subject.next();
  }

  searchFilterByCommittee(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.Search.value;
        this.activeRow = null;
        this.hideComityGraph= false;
        this.getOrganizationByDistrictId(this.selectedDistrictId);
      this.defaultMembersFlag = false;
      });
  }

  clearFilterByCommittee() {
    this.hideComityGraph= false;
    //this.CompofComityHide = false;
    this.Search.reset('');
    this.searchFilter = "";
    // this.selDistrict.reset();
    this.selDistrictName();
    let checkDistrictId;
    
    (this.selDistrict.value =="" || this.selDistrict.value  == null || isNaN(this.selDistrict.value) == true)  ? checkDistrictId = 0 :  checkDistrictId =  this.selDistrict.value;
    this.toggleClassActive(checkDistrictId);
    this.getOrganizationByDistrictId(checkDistrictId);
    //this.districtWiseCommityWorkGraph(checkDistrictId);  10/1/22
    this.defaultCloseBtn = false;
    this.defaultMembersFlag = false;
  }

  // --------------------------------------- Comparison of Committees chart start here ----------------------------------------------- //
  districtWiseCommityWorkGraph(id: any) {
    this.spinner.show();
    let ids = id == undefined || id == null || id == "" ? 0 : id;
    let obj = this.commonService.loggedInUserId() + '&DistrictId=' + ids + '&FromDate=' + this.fromDate + '&ToDate=' + this.toDate + '&Search=' + this.Search.value+ '&LevelId=' + this.CheckBoxLevelArrayJSON;
    // this.callAPIService.setHttp('get', 'Web_DistrictWiseCommitteeWorkGraph?UserId=' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.setHttp('get', 'Web_DistrictWiseCommitteeWorkGraph_1_0?UserId=' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.DistWiseCommityWGraphArray = res.data1;
        this.WorkDoneByYuvak();
        //$('html, body').animate({ scrollTop: $('.showmap').offset().top }, 'slow');
      } else {
        this.DistWiseCommityWGraphArray = [];
        this.WorkDoneByYuvak();
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  WorkDoneByYuvak() {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_material);
      let chart = am4core.create('WorkDoneByYuvak1', am4charts.XYChart)
      chart.responsive.enabled = true;

      chart.colors.list = [
        // am4core.color("#515ee6"),
        // am4core.color("#515ee6"),
        am4core.color("#b959e0"),
        am4core.color("#b959e0"),
      ];
      chart.colors.step = 2;

      chart.legend = new am4charts.Legend()
      chart.legend.position = 'top'
      chart.legend.paddingBottom = 10
      chart.legend.labels.template.maxWidth = 20

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.title.text = "Committes Work Done Count";

      let xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
      xAxis.dataFields.category = 'BodyOrgCellName'
      xAxis.title.text = "Committes Name";
      xAxis.renderer.cellStartLocation = 0.1
      xAxis.renderer.cellEndLocation = 0.9
      xAxis.renderer.grid.template.location = 0;
      xAxis.renderer.labels.template.rotation = -90;
      xAxis.renderer.labels.template.verticalCenter = "middle";
      xAxis.renderer.minGridDistance = 30;
      chart.scrollbarX = new am4core.Scrollbar();

      let label = xAxis.renderer.labels.template;
      // label.truncate = true;
      // label.maxWidth = 120;
      label.tooltipText = "{category}";

      function createSeries(value: string | undefined, name: string) {
        let series = chart.series.push(new am4charts.ColumnSeries())
        series.dataFields.valueY = value
        series.dataFields.categoryX = 'BodyOrgCellName'
        series.name = name

        series.events.on("hidden", arrangeColumns);
        series.events.on("shown", arrangeColumns);
        series.columns.template.tooltipText = "{valueY.value}";
        let bullet = series.bullets.push(new am4charts.LabelBullet())
        bullet.interactionsEnabled = false
        bullet.dy = 30;
        bullet.label.text = '{valueY}'
        bullet.label.fill = am4core.color('#ffffff')
        return series;
      }

      chart.data = this.DistWiseCommityWGraphArray;
       chart.padding(10, 5, 5, 5);
      // createSeries('TotalWork', 'Work Done by Committees');
      createSeries('TotalWork', 'Total Work Done');

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


  // --------------------------------------- Open dialog Add Committee ----------------------------------------------- //

  openDialogAddCommittee(Data:any) {
    let obj:any
    if(Data == undefined || Data == null || Data == '' ){
      obj =  { bodyId :'', bodylevelId : 2}
    }else{
      obj =  { bodyId : Data.Id, bodylevelId : Data.bodylevel}
    }
    const dialogRefActivityDetails = this.dialog.open(AddCommitteeComponent, {
      width: '600px',
      data: obj
    });
    dialogRefActivityDetails.afterClosed().subscribe(result => {
      this.getOrganizationByDistrictId(0);
    });
  }

  deleteConfirmModel(userpostbodyId:any, bodyId:any, bodyName:any) {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
       this.deleteClientData(userpostbodyId, bodyId, bodyName);
      }
    });
  }

  deleteClientData(userpostbodyId:any, bodyId:any, bodyName:any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Delete_AssignMember_1_0?userpostbodyId=' + userpostbodyId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg);
        this.committeeNameByOrganizationMember(bodyId, bodyName);
        // this.getBodyMemeberGraph(this.bodyId);
      } else {
        this.spinner.hide();
        // this.toastrService.error("Member is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../../../500'], { relativeTo: this.route });
      }
    })
  }

  addEditMember(data: any, flag: any) {
    this.userPostBodyId = data.userpostbodyId
    this.bodyMember.controls['currentDesignation'].setValue(data.DesignationName);
    this.bodyMember.controls['prevMember'].setValue(data.MemberName);
    this.bodyMember.controls['BodyName'].setValue(data.BodyOrgCellName);
    this.addMemberFlag = flag;
    if (data.UserId == "" || data.UserId == "") {
      this.toastrService.error("Please select member and try again");
    }
    else {
      this.dataAddEditMember = data;
      this.addEditMemberModal('open');
    }
  }

  // -------------------- Modal for Add/Update/Delete Member for any Designation start here   -------------------- //

  defaultBodyMemForm(selCommitteeName:any) {
    this.bodyMember = this.fb.group({
      PostfromDate: [''],
      BodyName: [selCommitteeName, Validators.required],
      mobileNo: ['', Validators.required],
      prevMember: [''],
      currentDesignation: [''],
    })
  }

  get f() { return this.bodyMember.controls };
  get fg(){return this.bodyMember.controls} // by using get() one can get controls of forms

  getAllBodyMemberDetail() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Mob_GetMemberDetails_With_MobileNo_1_0?MobileNo=' + this.searchFilter1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.bodyMemberDetails = res.data1[0];
        this.UserIdForRegMobileNo = this.bodyMemberDetails?.UserId;
        this.hideMemberDetailsField = true;
      } else {
        this.spinner.hide();
        this.bodyMemberDetails = [];
        this.hideMemberDetailsField = true;
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../../500'], { relativeTo: this.route });
      }
    })
  }

  filterByMember() {
    this.subject1.next();
  }

  searchFilterMember() {
    this.subject1
      .pipe(debounceTime(700))
      .subscribe(() => {
         if(this.bodyMember.value.mobileNo.length == 10 && !this.bodyMember.invalid){
          this.searchFilter1 = this.bodyMember.value.mobileNo;
          this.getAllBodyMemberDetail();
         }else{
            this.bodyMemberDetails = [];
         }
      });
  }

  closeModelAddEditMember(){
    this.defaultBodyMemForm(this.committeeNameBOMember);
    this.bodyMemberDetails = [];
    this.hideMemberDetailsField = false;
    this.submitted = false;
  }

  acceptedOnlyNumbers(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }


  addNewMember(flag: any, id: any,mobileNo:any) {
    this.mobileNoValue = mobileNo;
    if(this.mobileNoValue){
      const isNumeric:any = (val: string) : boolean => { return !isNaN(Number(val))}

      if(this.mobileNoValue.length != 10 || (isNumeric(this.mobileNoValue) != true)){
        this.toastrService.error('Invalid Mobile No.');
        this.mobileNoValue = '';
        return
      }
      sessionStorage.setItem('memberValue', JSON.stringify(this.mobileNoValue));
    }
   
    this.addEditMemberModal('close');
    let obj = { "formStatus": flag, 'Id': id, 'CommitteeName': this.dataAddEditMember.BodyId, 'Designation': this.dataAddEditMember.DesignationId, 'userpostbodyId': this.userPostBodyId };
    const dialogRef = this.dialog.open(AddMemberComponent, {
      width: '1024px',
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.getCurrentDesignatedMembers(this.dataAddEditMember.BodyId);
        this.committeeNameByOrganizationMember(this.dataAddEditMember.BodyId, this.selCommitteeName); 
      }
      // this.addEditMemberModal('open');
    });
  }

  getCurrentDesignatedMembers(id: any) {
    this.spinner.show();
    id == undefined || id == "" || id == null ? id = 0 : id = id;
    this.callAPIService.setHttp('get', 'Web_GetCurrentDesignatedMembers_1_0?BodyId=' + id, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allDesignatedMembers = res.data1;
        this.TotalWorkAndIosCount = res.data2[0];
        this.DesignationNameBYBodyId = res.data3;
        // this.getPreDesMembersArray = [];
        // this.DesignationNameBYBodyId.forEach((ele: any) => {
        //   this.getPreviousDesignatedMembers(this.bodyId, ele.DesignationId,ele.DesignationName);
        // });
        this.getPreviousDesignatedMembers(this.bodyId)
        // this.DesignationNameBYBodyId1 = res.data3;
      } else {
        this.allDesignatedMembers = [];
        this.TotalWorkAndIosCount = [];
        this.DesignationNameBYBodyId = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }
  getPreviousDesignatedMembers(bodyId: any) {
    throw new Error('Method not implemented.');
  }

  addEditMemberModal(flag: any) {
    if (flag == 'close') {
      let closeAddMemModal: HTMLElement = this.closeAddMemberModal.nativeElement;
      closeAddMemModal.click();
    } else if (flag == 'open') {
      let openMemberModal: HTMLElement = this.addMemberModal.nativeElement;
      openMemberModal.click();
    }
  }

  onSubmit(){
      let postFromDate: any = this.datepipe.transform(new Date(), 'dd/MM/YYYY');
      this.submitted = true;
      if (this.bodyMember.invalid) {
        this.spinner.hide();
        return;
      } else if(this.bodyMemberDetails?.MobileNo !=  this.bodyMember.value.mobileNo){
        this.toastrService.error("Please Add Member......!!!");
        return;
      }
      else {

        let UserPostBodyId: any;
        this.addMemberFlag == 'Add' ? UserPostBodyId = 0 : UserPostBodyId = this.dataAddEditMember.userpostbodyId;
        let fromData = new FormData();
        fromData.append('UserPostBodyId', UserPostBodyId);
        fromData.append('BodyId', this.dataAddEditMember.BodyId);
        fromData.append('DesignationId', this.dataAddEditMember.DesignationId);
        fromData.append('UserId', this.UserIdForRegMobileNo);
        fromData.append('IsMultiple', this.dataAddEditMember.IsMultiple);
        fromData.append('CreatedBy', this.commonService.loggedInUserId());
        fromData.append('PostfromDate', postFromDate);
        this.spinner.show();
        this.callAPIService.setHttp('Post', 'Web_Insert_AssignMember_1_0', false, fromData, false, 'electionServiceForWeb');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.data == 0) {
           
            this.getCurrentDesignatedMembers(this.bodyId);
            this.committeeNameByOrganizationMember(this.dataAddEditMember.BodyId, this.bodyMember.value.BodyName)
            this.submitted = false;
            this.spinner.hide();
            let closeAddMemModal: HTMLElement = this.closeAddMemberModal.nativeElement;
            closeAddMemModal.click();
            this.resultBodyMemActDetails = res.data1[0];
            this.toastrService.success(this.resultBodyMemActDetails.Msg);
            this.bodyMember.reset({ BodyName: this.subCommitteeName });
            this.getBodyMemeberGraph(this.bodyId);
            this.addMemberFlag = null;
            this.getOrganizationByDistrictId(this.selectedDistrictId ? this.selectedDistrictId: 0);
          } else {
            // this.toastrService.error("Member is not available");
          }
        }, (error: any) => {
          if (error.status == 500) {
            this.spinner.hide();
            this.router.navigate(['../../../500'], { relativeTo: this.route });
          }
        })
      }
  }
  getBodyMemeberGraph(bodyId: any) {
    //throw new Error('Method not implemented.');
  }

  // -------------------- Modal for Add/Update/Delete Member for any Designation end here   -------------------- //

  svgMapClick(){
    $(document).on('click', '#mapsvg1  path', (e: any) => {
      console.log(e, e.currentTarget.id);
      var filteredDistrict = this.allDistrict.filter((x: any) => x.DistrictId == e.currentTarget.id)
      var path = 'assets/mapSvg/' + filteredDistrict[0]?.DistrictName + '.svg';
      console.log(path, filteredDistrict)
      this.showTalukaSvgMap(this.commonService.mapRegions(), path);
    })
  }

  showTalukaSvgMap(regions_m: any, svgPath: any) {
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
}

