import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-family-head-report',
  templateUrl: './family-head-report.component.html',
  styleUrls: ['./family-head-report.component.css']
})
export class FamilyHeadReportComponent implements OnInit {

 
  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  surNamewiseFamilyHeadCountArray: any;
  surNamewiseFamilyHeadVoterListArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  subject: Subject<any> = new Subject();
  searchSurName = new FormControl('');
  surName: any;
  hideFullNameDiv:boolean = false;
  highLightRow: any;
  HighlightRowFirst: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.defaultMainFilterForm();
    this.getClientName();
    this.searchSurNameData('false');
  }

  defaultMainFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      village: [0],
      getBoothId: [''],
    })
  }

  getClientName() {
    this.nullishFilterForm(); 
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
      } else {
        this.clientNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName() {
    this.nullishFilterForm();     
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName()) : '';
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {
    this.nullishFilterForm();      
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData()) : '';
      } else {
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData() {
    this.filterForm.controls['village'].setValue(0);
    this.filterForm.controls['getBoothId'].setValue('');
    this.getFamilyHeadCounts(); 
    this.ClientWiseBoothList();
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.villageDropdown = res.responseData;
      } else {
        this.villageDropdown = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList() {
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.clientWiseBoothListArray = res.responseData;
      } else {
        this.clientWiseBoothListArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'constituencyId') {
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue('');
      this.dataNotFound = false;
      this.ClientWiseBoothList();
    } else if (flag == 'village') {
      this.filterForm.controls['getBoothId'].setValue('');
      this.ClientWiseBoothList();
      this.getFamilyHeadCounts();
    }
  }

  nullishFilterForm() { //Check all value null || undefind || empty 
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue('');
  }

  getFamilyHeadCounts() {
    this.nullishFilterForm(); 
    this.hideFullNameDiv = false;
    this.spinner.show(); 
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId 
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetSurNamewiseFamilyHeadCounts?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.surNamewiseFamilyHeadCountArray = res.responseData;
       } else {
        this.spinner.hide();
        this.surNamewiseFamilyHeadCountArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getSurNamewiseFamilyHeadVoterList(surname:any) {
    this.surName = surname;
    this.hideFullNameDiv = true;
    this.nullishFilterForm(); 
    this.spinner.show(); 
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId + '&SurName=' + this.surName + '&pageno=' + this.paginationNo
    + '&pagesize=' + this.pageSize + '&Search=' + this.searchSurName.value.trim()
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetSurNamewiseFamilyHeadVoterList?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.surNamewiseFamilyHeadVoterListArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
       } else {
        this.spinner.hide();
        this.surNamewiseFamilyHeadVoterListArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionSurName(pageNo: number) {
    this.paginationNo = pageNo;
    this.getSurNamewiseFamilyHeadVoterList(this.surName);
  }

  onKeyUpSurNameSearchData() {
    this.subject.next();
  }
  
  searchSurNameData(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchSurName.value;
        this.paginationNo = 1;
        this.getSurNamewiseFamilyHeadVoterList(this.surName);
      }
      );
  }

  clearSearchSurName(){
    this.searchSurName.setValue('');
    this.paginationNo = 1;
    this.getSurNamewiseFamilyHeadVoterList(this.surName);
  }

  redirectToVoterPrfile(obj: any) { //Redirect Voter Profile Page
    this.highLightRow = obj.voterId;
    window.open('../voters-profile/' + obj.agentId + '.' + this.filterForm.value.ClientId + '.' + obj.voterId);
  }

}
