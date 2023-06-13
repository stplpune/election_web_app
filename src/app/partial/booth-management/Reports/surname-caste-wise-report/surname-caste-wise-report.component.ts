import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { DeleteComponent } from '../../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-surname-caste-wise-report',
  templateUrl: './surname-caste-wise-report.component.html',
  styleUrls: ['./surname-caste-wise-report.component.css']
})
export class SurnameCasteWiseReportComponent implements OnInit {

  assignCastForm!: FormGroup;
  submitted: boolean = false;

  surnameUpForm!: FormGroup;
  submittedSur: boolean = false;
  submittedMultipleSur: boolean = false;

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  religionListArray: any;
  VoterCastListArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  hideFullNameDiv: boolean = false;
  surNamewiseCountArray: any;

  surNamewiseVoterListArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  subject: Subject<any> = new Subject();
  searchSurName = new FormControl('');
  surName: any;
  highLightRow: any;
  HighlightRowFirst: any;
  assignVoterCastListArray: any;
  surnameCheckedArray: any[] = [];
  copySurnameCheckedArray: any[] = [];

  isCasteWiseChart: boolean = false;
  castWiseVoterCountData: any;
  religionWiseVoterCountData: any;
  isReligionWiseChart: boolean = false;

  @ViewChild('updateSurnameModel') updateSurnameModel: any;
  @ViewChild('multipleUpdateSurnameModel') multipleUpdateSurnameModel: any;
  @ViewChild('assignCastModel') assignCastModel: any;

  multipleSurname = new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^\S*$/)])); //Marathi Surname
  newEnglishSurname = new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^\S*$/)])); //English Surname 


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.defaultCastForm();
    this.defaultMainFilterForm();
    this.getClientName();
    this.getReligionList();
    this.searchSurNameData();
    this.surnameUpdateForm();
  }

  get f() { return this.assignCastForm.controls }

  defaultCastForm() {
    this.assignCastForm = this.fb.group({
      religionId: ['', Validators.required],
      castId: ['', Validators.required]
    })
  }

  defaultMainFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      village: [0],
      getBoothId: [''],
      religionId: [0],
      castId: [0]
    })
  }

  get s() { return this.surnameUpForm.controls }

  surnameUpdateForm() {
    this.surnameUpForm = this.fb.group({
      OldSurName: [''],
      NewSurName: ['', Validators.compose([Validators.required, Validators.pattern(/^\S*$/)])],
    })
  }

  getClientName() {
    this.nullishFilterForm();
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
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
    this.nullishFilterForm();
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName()) : '';
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
    this.nullishFilterForm();
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData() {
    this.filterForm.controls['village'].setValue(0);
    this.filterForm.controls['getBoothId'].setValue('');
    this.filterForm.controls['religionId'].setValue(0);
    this.filterForm.controls['castId'].setValue(0);
    this.getSurNamewiseCounts();
    this.ClientWiseBoothList();
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.villageDropdown = res.responseData;
      } else {
        this.villageDropdown = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Religion List ...............//
  getReligionList() {
    this.callAPIService.setHttp('get', 'Filter/GetReligionDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.religionListArray = res.responseData;
      } else {
        this.religionListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  // clearReligion() {
  //   this.voterProfileForm.controls['castId'].setValue('');
  //   this.voterProfileForm.controls['castId'].clearValidators();
  //   this.voterProfileForm.controls['castId'].updateValueAndValidity();
  // }

  //.......... get Voter Cast List ...............//
  getVoterCastList(religionId: any) {
    this.callAPIService.setHttp('get', 'Filter/GetCastDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&ReligionId=' + religionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.VoterCastListArray = res.responseData;
      } else {
        this.VoterCastListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter Cast List ...............//
  getVoterCastListAssignCast(religionId: any) {
    this.callAPIService.setHttp('get', 'Filter/GetCastDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&ReligionId=' + religionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.assignVoterCastListArray = res.responseData;
      } else {
        this.assignVoterCastListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../../500'], { relativeTo: this.route });
    })
  }


  ClientWiseBoothList() {
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue('');
      this.filterForm.controls['religionId'].setValue(0);
      this.filterForm.controls['castId'].setValue(0);
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue('');
      this.filterForm.controls['religionId'].setValue(0);
      this.filterForm.controls['castId'].setValue(0);
      this.dataNotFound = false;
    } else if (flag == 'constituencyId') {
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue('');
      this.filterForm.controls['religionId'].setValue(0);
      this.filterForm.controls['castId'].setValue(0);
      this.dataNotFound = false;
      this.ClientWiseBoothList();
    } else if (flag == 'village') {
      this.filterForm.controls['getBoothId'].setValue('');
      this.ClientWiseBoothList();
      this.getSurNamewiseCounts();
    } else if (flag == 'religion') {
      this.filterForm.controls['castId'].setValue(0);
      this.getSurNamewiseCounts();
    }
    this.surnameCheckedArray = [];
  }

  nullishFilterForm() { //Check all value null || undefind || empty 
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue('');
    fromData.religionId ?? this.filterForm.controls['religionId'].setValue(0);
    fromData.castId ?? this.filterForm.controls['castId'].setValue(0);
  }

  getSurNamewiseCounts() {
    this.nullishFilterForm();
    this.getCastWiseVoterCount();
    this.getReligionWiseVoterCount();
    this.hideFullNameDiv = false;
    this.spinner.show();
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId + '&ReligionId=' + this.filterForm.value.religionId + '&CastId=' + this.filterForm.value.castId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/CastVoterAssignment/GetDashbord-GetSurNamewiseCounts?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.surNamewiseCountArray = res.responseData;
      } else {
        this.spinner.hide();
        this.surNamewiseCountArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getSurNamewiseVoterList(surname: any) {
    this.surName = surname;
    this.hideFullNameDiv = true;
    this.nullishFilterForm();
    this.spinner.show();
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId + '&SurName=' + this.surName + '&pageno=' + this.paginationNo
      + '&pagesize=' + this.pageSize + '&Search=' + this.searchSurName.value.trim() + '&ReligionId=' + this.filterForm.value.religionId + '&CastId=' + this.filterForm.value.castId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/CastVoterAssignment/GetSurNamewiseVoterListWithCast?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.surNamewiseVoterListArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
      } else {
        this.spinner.hide();
        this.surNamewiseVoterListArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionSurName(pageNo: number) {
    this.paginationNo = pageNo;
    this.getSurNamewiseVoterList(this.surName);
  }

  onKeyUpSurNameSearchData() {
    this.subject.next();
  }

  searchSurNameData() {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchSurName.value;
        this.paginationNo = 1;
        this.getSurNamewiseVoterList(this.surName);
      }
      );
  }

  clearSearchSurName() {
    this.searchSurName.setValue('');
    this.paginationNo = 1;
    this.getSurNamewiseVoterList(this.surName);
  }

  redirectToVoterPrfile(obj: any) { //Redirect Voter Profile Page
    this.highLightRow = obj.voterId;
    window.open('../voters-profile/' + obj.agentId + '.' + this.filterForm.value.ClientId + '.' + obj.voterId);
  }

  onSubmit() {  //Assign Cast Submit Code
    this.submitted = true;
    if (this.assignCastForm.invalid) {
      this.spinner.hide();
      return;
    } else if(!this.copySurnameCheckedArray?.length){
      this.toastrService.error('At least One old Surname Select');
      return;
    }else{
      this.spinner.show();
      let filterFormData = this.filterForm.value;
      let formData = this.assignCastForm.value;

      let obj = {
        "electionId": filterFormData.ElectionId,
        "userId": this.commonService.loggedInUserId(),
        "clientId": parseInt(filterFormData.ClientId),
        "constituencyId": filterFormData.ConstituencyId,
        "villageId": filterFormData.village,
        "boothId": filterFormData.getBoothId.toString(),
        "religionId": formData.religionId,
        "castId": formData.castId,
        "sureNamedata": this.copySurnameCheckedArray
      }

      this.callAPIService.setHttp('POST', 'ClientMasterWebApi/CastVoterAssignment/LoadCastVoterAssignemnt', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.defaultCastForm();
          this.surnameCheckedArray = [];
          this.assignCastModel.nativeElement.click();
          this.getSurNamewiseCounts();
          this.surnameCheckedArray = [];
          this.submitted = false;
        } else {
          this.spinner.hide();
          this.toastrService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  multipleAssignCastModelClear() {
    this.copySurnameCheckedArray = JSON.parse(JSON.stringify(this.surnameCheckedArray));
    this.defaultCastForm();
    this.submitted = false;
  }

  OnSubmitSurname() {
    this.submittedSur = true;
    if (this.surnameUpForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      this.spinner.show();
      let filterFormData = this.filterForm.value;
      let formData = this.surnameUpForm.value;
      let obj = this.commonService.loggedInUserId() + '&ClientId=' + filterFormData.ClientId + '&ElectionId=' + filterFormData.ElectionId + '&ConstituencyId=' + filterFormData.ConstituencyId
        + '&VillageId=' + filterFormData.village + '&BoothId=' + filterFormData.getBoothId.toString() + '&OldSurName=' + formData.OldSurName + '&NewSurName=' + formData.NewSurName
      this.callAPIService.setHttp('PUT', 'ClientMasterWebApi/CastVoterAssignment/UpdateMisSpelledSurname?UserId=' + obj, false, false, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.surnameCheckedArray = [];
          this.updateSurnameModel.nativeElement.click();
          this.getSurNamewiseCounts();
          this.submittedSur = false;
        } else {
          this.spinner.hide();
          this.toastrService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  getCastWiseVoterCount() {
    this.nullishFilterForm();
    let filterFormData = this.filterForm.value;
    let obj = 'ClientId=' + filterFormData.ClientId + '&ElectionId=' + filterFormData.ElectionId + '&ConstituencyId=' + filterFormData.ConstituencyId
      + '&BoothId=' + filterFormData.getBoothId.toString() + '&VillageId=' + filterFormData.village +
      '&ReligionId=' + filterFormData.religionId + '&CastId=' + filterFormData.castId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/CastVoterAssignment/GetCastWiseVoterCountCastSurNamereport?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.castWiseVoterCountData = res.responseData;
        this.isCasteWiseChart = true;
        this.casteWiseChart(this.castWiseVoterCountData);
      } else {
        this.isCasteWiseChart = false;
        this.castWiseVoterCountData = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
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

  getReligionWiseVoterCount() {
    this.nullishFilterForm();
    let filterFormData = this.filterForm.value;
    let obj = 'ClientId=' + filterFormData.ClientId + '&ElectionId=' + filterFormData.ElectionId + '&ConstituencyId=' + filterFormData.ConstituencyId
      + '&BoothId=' + filterFormData.getBoothId.toString() + '&VillageId=' + filterFormData.village +
      '&ReligionId=' + filterFormData.religionId + '&CastId=' + filterFormData.castId
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/CastVoterAssignment/GetReligionWiseVoterCountCastSurNamereport?' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != 0 && res.responseData != null && res.statusCode == "200") {
        this.religionWiseVoterCountData = res.responseData;
        this.isReligionWiseChart = true;
        this.religionWiseChart(this.religionWiseVoterCountData);
      } else {
        this.isReligionWiseChart = false;
        this.religionWiseVoterCountData = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  religionWiseChart(obj: any) {
    var chart = am4core.create("religionwisediv", am4charts.XYChart);
    chart.data = obj;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "religionName";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "totalVoters";
    series.dataFields.categoryX = "religionName";
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

  //.......................................  Delete Booth Committee member code Start Here .................................//

  deleteConfirmModel(surname: any) {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        let filterFormData = this.filterForm.value;
        let obj = {
          "electionId": filterFormData.ElectionId,
          "userId": this.commonService.loggedInUserId(),
          "clientId": filterFormData.ClientId,
          "constituencyId": filterFormData.ConstituencyId,
          "villageId": filterFormData.village,
          "boothId": filterFormData.getBoothId.toString(),
          "religionId": filterFormData.religionId,
          "castId": filterFormData.castId,
          "sureNamedata": [
            {
              "surname": surname
            }
          ]
        }
        this.deleteBoothComityMember(obj);
      }
    });
  }

  deleteBoothComityMember(eleObj: any) {
    this.callAPIService.setHttp('POST', 'ClientMasterWebApi/CastVoterAssignment/DeleteCastVoterAssignment', false, eleObj, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.toastrService.success(res.statusMessage);
        this.getSurNamewiseCounts();
        this.surnameCheckedArray = [];
      } else {
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......................................  Delete Booth Committee member code End Here .................................//

  //.......................................  Update Multiple Surname code Start Here .................................//

  updateMultipleSurname() {
    this.submittedMultipleSur = true;
    if (this.multipleSurname.invalid || this.newEnglishSurname.invalid) {
      this.spinner.hide()
      return;
    } else if(!this.copySurnameCheckedArray?.length){
      this.toastrService.error('At least One old Surname Select');
      return;
    }else{
      let filterFormData = this.filterForm.value;

      let obj = {
        "userId": this.commonService.loggedInUserId(),
        "electionId": filterFormData.ElectionId,
        "clientId": parseInt(filterFormData.ClientId),
        "constituencyId": filterFormData.ConstituencyId,
        "villageId": filterFormData.village,
        "boothId": filterFormData.getBoothId.toString(),
        "newSurname": this.multipleSurname.value,
        "newEnglishSurname": this.newEnglishSurname.value,
        "surNamedata": this.copySurnameCheckedArray
      }

      this.spinner.show();
      this.callAPIService.setHttp('PUT', 'ClientMasterWebApi/CastVoterAssignment/UpdateMisSpelledSurnameMultiple', false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.surnameCheckedArray = [];
          this.multipleUpdateSurnameModel.nativeElement.click();
          this.getSurNamewiseCounts();
          this.submittedMultipleSur = false;
        } else {
          this.spinner.hide();
          this.toastrService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  //.......................................  Update Multiple Surname code End Here .................................//

  addCheckedData(event: any, obj: any) {
    if (event.target.checked == true) {
      let surNameObj = { "surname": obj?.surname }
      this.surnameCheckedArray.push(surNameObj);
    } else {
      let index = this.surnameCheckedArray.map((x: any) => { return x.surname; }).indexOf(obj?.surname);
      this.surnameCheckedArray.splice(index, 1);
    }
    this.copySurnameCheckedArray = JSON.parse(JSON.stringify(this.surnameCheckedArray));
  }

  deleteSurname(index: any) {
    this.copySurnameCheckedArray.splice(index, 1);
  }

  multipleSurnameModelClear() {
    this.copySurnameCheckedArray = JSON.parse(JSON.stringify(this.surnameCheckedArray));
    this.newEnglishSurname.setValue('');
    this.multipleSurname.setValue('');
    this.submittedMultipleSur = false;
  }

}
