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
  selector: 'app-surname-wise-report',
  templateUrl: './surname-wise-report.component.html',
  styleUrls: ['./surname-wise-report.component.css']
})
export class SurnameWiseReportComponent implements OnInit {

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  surNamewiseCountArray: any;
  surNamewiseVoterListArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  subject: Subject<any> = new Subject();
  searchSurName = new FormControl('');
  surName: any;
  hideFullNameDiv:boolean = false;
  highLightRow: any;
  HighlightRowFirst: any;
  religionListArray: any;
  VoterCastListArray: any;

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
    this.getReligionList();
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
    this.hideFullNameDiv = false;
    this.spinner.show(); 
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId + '&ReligionId=' + this.filterForm.value.religionId + '&CastId=' + this.filterForm.value.castId
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetSurNamewiseCounts_1_0?UserId=' + obj, false, false, false, 'electionMicroSerApp');
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

  getSurNamewiseVoterList(surname:any) {
    this.surName = surname;
    this.hideFullNameDiv = true;
    this.nullishFilterForm(); 
    this.spinner.show(); 
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
    + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId + '&SurName=' + this.surName + '&pageno=' + this.paginationNo
    + '&pagesize=' + this.pageSize + '&Search=' + this.searchSurName.value.trim() + '&ReligionId=' + this.filterForm.value.religionId + '&CastId=' + this.filterForm.value.castId
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetSurNamewiseVoterList_1_0?UserId=' + obj, false, false, false, 'electionMicroSerApp');
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
  
  searchSurNameData(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchSurName.value;
        this.paginationNo = 1;
        this.getSurNamewiseVoterList(this.surName);
      }
      );
  }

  clearSearchSurName(){
    this.searchSurName.setValue('');
    this.paginationNo = 1;
    this.getSurNamewiseVoterList(this.surName);
  }

  redirectToVoterPrfile(obj: any) { //Redirect Voter Profile Page
    this.highLightRow = obj.voterId;
    window.open('../voters-profile/' + obj.agentId + '.' + this.filterForm.value.ClientId + '.' + obj.voterId);
  }

}
