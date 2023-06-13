import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { ExcelService } from '../../../services/excel.service';

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.css']
})
export class CrmComponent implements OnInit
{

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;

  searchVoters = new FormControl('');
  BoothAnalyticsObj = {
    ClientId: 0, ElectionId: 0, ConstituencyId: 0,
    VillageId: 0, BoothId: 0, flag: 0
  }
  IsSubElectionApplicable: any;
  cardData: any;
  topClientName: any;
  topElectionName: any;
  topConstituencyName: any;
  topBoothName: any;
  boothWiseSummaryCountArray: any;

  boothVoterListArray: any;
  votersPaginationNo: any = 1;
  votersPageSize: number = 10;
  votersTotal: any;

  fillDataId = 0;
  VoterListDownloadExcel: any;

  // Voters Variable Declreation

  globalFilterForm!: FormGroup;
  voterAreaArray: any;
  politicalPartyArray: any;
  religionListArray: any;
  VoterCastListArray: any;
  favourofListArray: any;
  opposeOfListArray: any;
  professionArray = [{ id: 1, name: 'Dairy Farm' }, { id: 2, name: 'Goat/Sheep Herd	' }, { id: 3, name: 'Sugarcane Cutter/Worker ' }, { id: 4, name: 'Farmer' }, { id: 5, name: 'Business' },]
  genderArray = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }, { id: 3, name: 'Other' }];
  mobileNoAvailableArray = [{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }];
  bussinessArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  ratingStarArray = [{ id: 1.0, name: '1 Star' }, { id: 2.0, name: '2 Star' }, { id: 3.0, name: '3 Star' }, { id: 4.0, name: '4 Star' }, { id: 5.0, name: '5 Star' },];
  yuvakArray = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];
  ageArray = [{ id: 1, name: '18-40' }, { id: 2, name: '41-60' }, { id: 3, name: '61-80' }, { id: 4, name: '81 and Above' }];
  familySizeArray = [{ id: 1, name: '1-5' }, { id: 2, name: '5-10' }, { id: 3, name: '10 and Above' }];
  filteredValueNameArray: any = [];
  checkedDataflag: boolean = true;
  indexNo: any;
  globalAssemblyId: any;
  filterSidebarFlag = 'VotersFlag';
  prominentleaderArray: any;
  ShowFlagType = 0;


  boothAgentListArray: any;
  searchAgent = new FormControl('');
  boothFamilyDetailsArray: any;

  // crm tab var start
  followupStatusDropDownData = [{ id: 1, name: 'Todays Followups', class: 'text-main' }, { id: 2, name: 'Upcoming Followups', class: 'text-success' }, { id: 3, name: 'Missed Followups', class: 'text-dark' }, { id: 4, name: 'Not To Call', class: 'text-danger' }, { id: 5, name: 'New', class: 'text-info' }]

  crmFilterForm!: FormGroup;
  getCrmTableListrTotal: any;
  getCrmTableList: any;
  crmPaginationNo: number = 1;
  crmPageSize: number = 10;

  crmHistoryFilterForm!: FormGroup;
  getCrmHistoryTableListrTotal: any;
  getCrmHistoryTableList: any;
  crmHistoryPaginationNo: number = 1;
  crmHistoryPageSize: number = 10;
  feedbackTypeArray = [{ id: 1, name: 'Positive' }, { id: 2, name: 'Negative' }, { id: 3, name: 'Neutral' }];

  offCanvasSidebarCheck: boolean = false;
  filteredValueNameArray1: any = [];
  rowTotalCountVoter: any;
  rowTotalCountCRM: any;
  rowTotalCountCRMHistory: any;
  familyClientId: any;
  isVerifiedContact = new FormControl(false);

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    public dateTimeAdapter: DateTimeAdapter<any>,
    public excelService: ExcelService,
  )
  {
    dateTimeAdapter.setLocale('en-IN');
    let getUrlData: any = this.route.snapshot.params.id;
    if (getUrlData)
    {
      getUrlData = getUrlData.split('.');
      this.BoothAnalyticsObj = {
        'ClientId': +getUrlData[0], 'ElectionId': +getUrlData[1], 'ConstituencyId': +getUrlData[2]
        , 'VillageId': +getUrlData[3], 'BoothId': +getUrlData[4], 'flag': +getUrlData[5]
      }
    }
  }

  ngOnInit(): void
  {
    this.defaultMainFilterForm();
    this.deafultCrmFilterForm();
    this.deafultCrmHistoryFilterForm();
    this.getClientName();

    this.globalFilterDataForm();
    this.SideBarOutsideClick();
  }

  defaultMainFilterForm()
  {
    this.filterForm = this.fb.group({
      ClientId: [this.BoothAnalyticsObj.ClientId || 0],
      ElectionId: [this.BoothAnalyticsObj.ElectionId || 0],
      ConstituencyId: [this.BoothAnalyticsObj.ConstituencyId || 0],
      village: [this.BoothAnalyticsObj.VillageId || 0],
      getBoothId: [this.BoothAnalyticsObj.BoothId || 0],
    })
  }

  getClientName()
  {
    this.nullishFilterForm(); //Check all value null || undefind || empty
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
      } else
      {
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName()
  {
    this.nullishFilterForm(); //Check all value null || undefind || empty
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.IsSubElectionApplicable = this.electionNameArray[0].isSubElectionApplicable, this.getConstituencyName()) : '';

        if (this.electionNameArray.length > 1 && this.BoothAnalyticsObj.flag == 1)
        {
          this.getConstituencyName();
        }
      } else
      {
        this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName()
  {
    this.nullishFilterForm(); //Check all value null || undefind || empty
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        // this.dataNotFound = true;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData(), this.clearBoothVotersFilterForm()) : '';
      } else
      {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData()
  {
    this.boothSummary(); // when Select ConstituencyName then Call
    this.boothWiseSummaryCount(); // when Select ConstituencyName then Call
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.villageDropdown = res.responseData;
        //  this.ClientWiseBoothList();
      } else
      {
        this.villageDropdown = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList()
  {
    this.nullishFilterForm(); //Check all value null || undefind || empty
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
      } else
      {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  boothSummary()
  { // Get Voter Top Client Summary Count
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'VoterSummary/GetClientVoterSummary?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.cardData = res.responseData[0];
        this.ClientWiseBoothList();
      } else
      {
        this.cardData = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  nullishFilterForm()
  {
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0);
  }

  clearTopFilter(flag: any)
  {
    if (flag == 'clientId')
    {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: 0,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      });
      this.dataNotFound = false;
      this.topBoothName = '';
    } else if (flag == 'electionId')
    {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: 0,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      });
      this.dataNotFound = false;
      this.topBoothName = '';
    } else if (flag == 'constituencyId')
    {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: 0,
        village: 0,
        getBoothId: 0
      });
      this.dataNotFound = false;
      this.topBoothName = '';
      this.clearBoothVotersFilterForm();
    } else if (flag == 'village')
    {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
        village: 0,
        getBoothId: 0
      });
      this.ClientWiseBoothList();
      this.boothWiseSummaryCount();
      this.clearBoothVotersFilterForm();
    } else if (flag == 'boothId')
    {
      this.filterForm.patchValue({
        ClientId: this.filterForm.value.ClientId,
        ElectionId: this.filterForm.value.ElectionId,
        ConstituencyId: this.filterForm.value.ConstituencyId,
        // village: 0,
      });
      this.boothWiseSummaryCount();
      this.clearBoothVotersFilterForm();
    }
  }

  onSelectionObj(event: any, flag: any)
  { // Top Filter selection Value Name Get
    if (flag == 'client')
    {
      this.topClientName = event[0]?.data.clientName;
    } else if (flag == 'election')
    {
      this.topElectionName = event[0]?.data.electionName;
    } else if (flag == 'constituency')
    {
      this.topConstituencyName = event[0]?.data.constituencyName;
    } else if (flag == 'boothname')
    {
      this.topBoothName = event[0]?.data.boothNickName;
    }
  }

  // ------------------------------------------ BoothWise Count Api Start ------------------------------ -------------------- //


  boothWiseSummaryCount()
  { // Get Voter BoothWise Summary Count
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village + '&BoothId=' + this.filterForm.value.getBoothId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'VoterSummary/GetVoterBoothWiseSummary?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.boothWiseSummaryCountArray = res.responseData[0];
        this.defaultShowVoterList();
      } else
      {
        this.boothWiseSummaryCountArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  // ------------------------------------------ BoothWise Count Api End ------------------------------ -------------------- //


  // ------------------------------------------ Global Main filter start here  ------------------------------------------//

  globalFilterDataForm()
  {
    this.globalFilterForm = this.fb.group({
      // ClientId: [0],
      // ElectionId: [0],
      // ConstituencyId: [0],
      // VillageId: [0],
      // AssemblyId: [0],
      // BoothId: [0],
      // Search: [''],
      AreaId: [0],
      Gender: [''],
      HaveMobileNo: [0],
      HaveBussiness: [2],
      PartyId: [0],
      LeadeImp: [0],
      IsYuvak: [2],
      InFavourofId: [0],
      InOpposeOfId: [0],
      AgegroupId: [0],
      FamilySize: [0],
      ReligionId: [0],
      CastId: [0],
      ProfessionId: [0],
      LocalLeaderId: [0]
    })
  }

  globalFilterOnInitData()
  {
    if (this.filteredValueNameArray1.length != 0)
    {
      let FormArray: any = Object.keys(this.globalFilterForm.value); //Filter Dropdown all FormControl Name Get
      let checkArray: any = []; // Filter Dropdown selected Value get
      FormArray.filter((ele: any) =>
      {
        this.filteredValueNameArray1.forEach((element: any) =>
        {
          if (element.flag == ele)
          {
            checkArray.push(ele);
            this.globalFilterForm.controls[ele].setValue(element.id);
          }
        })
      })

      let FindLastKey = FormArray.filter(function (val: any)
      {  // Filter Dropdown Non selected Value get
        return checkArray.indexOf(val) == -1;
      });

      FindLastKey.forEach((ele: any) =>
      {   // Set Non selected Value
        if (ele == 'IsYuvak')
        {
          this.globalFilterForm.controls[ele].setValue(2)
        } else if (ele == 'HaveBussiness')
        {
          this.globalFilterForm.controls[ele].setValue(2)
        } else if (ele == 'Gender')
        {
          this.globalFilterForm.controls[ele].setValue('')
        } else
        {
          this.globalFilterForm.controls[ele].setValue(0)
        }
      })
    }

    this.getVoterAreaList();
    this.getPoliticalPartyList();
    this.getReligionList();
    // this.getVoterCastList();
    this.getInFavourofList();
    this.getInOpposeOfList();
    this.getProminentleader();
  }

  clearBoothVotersFilterForm() {
    this.globalFilterDataForm();
    this.nullishGlobalFilterForm();
    this.filteredValueNameArray1 = [];
    this.filteredValueNameArray = [];
  }

  globalFilterCallApiByConditn(){
     if (this.filterSidebarFlag == 'VotersFlag') {
      this.boothVoterList();
    }
    else if (this.filterSidebarFlag == 'CRMFlag') {
      this.getCrmTableData();
    } else if (this.filterSidebarFlag == 'CRMHistoryFlag') {
      this.getCrmHistoryTableData();
    }
  }

  nullishDefaultFilterForm()
  {
    let fromData = this.filterForm.value;
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0);
  }

  //.......... get Voter Area List ...............//
  getVoterAreaList()
  {
    this.callAPIService.setHttp('get', 'Filter/GetAreaDetails?ClientId=' + this.filterForm.value.ClientId + '&ElectionId='
      + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId + '&BoothId=' + this.filterForm.value.getBoothId,
      + '&VillageId=' + this.filterForm.value.village, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.voterAreaArray = res.responseData;
      } else
      {
        this.voterAreaArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Political Party List ...............//
  getPoliticalPartyList()
  {
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Filter/GetPartyDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.politicalPartyArray = res.responseData;
      } else
      {
        this.politicalPartyArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Religion List ...............//
  getReligionList()
  {
    this.callAPIService.setHttp('get', 'Filter/GetReligionDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.religionListArray = res.responseData;
      } else
      {
        this.religionListArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter Cast List ...............//
  getVoterCastList()
  {
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Filter/GetCastDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId() + '&ReligionId=' + formData.ReligionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.VoterCastListArray = res.responseData;
      } else
      {
        this.VoterCastListArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get Voter Prominentleader List ...............//
  getProminentleader()
  {
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Filter/GetProminentleaderDetails?ClientId=' + this.filterForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.prominentleaderArray = res.responseData;
      } else
      {
        this.prominentleaderArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get InFavourof Supporter List ...............//

  getInFavourofList()
  {
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Filter/GetSupporter?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId()
      + '&InfavourOfFlag=' + 1 + '&BoothId=' + this.filterForm.value.getBoothId + '&VillageId=' + this.filterForm.value.village, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.favourofListArray = res.responseData;
      } else
      {
        this.favourofListArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......... get InOpposeOf List ...............//

  getInOpposeOfList()
  {
    let formData = this.globalFilterForm.value;
    this.callAPIService.setHttp('get', 'Filter/GetSupporter?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId()
      + '&InfavourOfFlag=' + 4 + '&BoothId=' + this.filterForm.value.getBoothId + '&VillageId=' + this.filterForm.value.village, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.opposeOfListArray = res.responseData;
      } else
      {
        this.opposeOfListArray = [];
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  SideBarOutsideClick()
  { // SideBar Outside Click then Call Function
    var myOffcanvas: any = document.getElementById('offcanvasRight')
    myOffcanvas.addEventListener('hidden.bs.offcanvas', () =>
    {
      if (this.offCanvasSidebarCheck == false)
      {
        this.filteredValueNameArray1.length == 0 ? (this.globalFilterDataForm(), this.filteredValueNameArray = []) : '';
        this.filteredValueNameArray = [...this.filteredValueNameArray1];
      } else
      {
        this.offCanvasSidebarCheck = false;
      }
    })
  }


  insertUpdateFilterData(obj: any, flagName: any)
  {
    this.checkedDataflag = true;
    if (this.filteredValueNameArray.length == 0)
    {
      this.filteredValueNameArray.push(obj);
      this.checkedDataflag = false;
    } else
    {
      this.filteredValueNameArray.map((ele: any, index: any) =>
      {
        if (ele.flag == flagName)
        {
          this.filteredValueNameArray[index] = obj;
          this.checkedDataflag = false;
        }
      })
    }
    if (this.checkedDataflag && this.filteredValueNameArray.length >= 1)
    {
      this.filteredValueNameArray.push(obj);
    }

  }

  changedFilterData(event: any, flagName: any)
  {
    if (event.length != 0)
    {
      let obj: any = event[0].data;
      if (flagName == 'AreaId')
      {
        let obj1 = { id: obj.areaId, name: obj.areaName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      } else if (flagName == 'ReligionId')
      {
        let obj1 = { id: obj.reliogionId, name: obj.religionName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      } else if (flagName == 'CastId')
      {
        let obj1 = { id: obj.castId, name: obj.castName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      } else if (flagName == 'PartyId')
      {
        let obj1 = { id: obj.partyId, name: obj.partyName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      } else if (flagName == 'InFavourofId')
      {
        let obj1 = { id: obj.supporterOfId, name: obj.supporterName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      } else if (flagName == 'InOpposeOfId')
      {
        let obj1 = { id: obj.supporterOfId, name: obj.supporterName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      } else if (flagName == 'LocalLeaderId')
      {
        let obj1 = { id: obj.prominentleaderId, name: obj.leaderName, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
      }
      else
      {
        let obj1 = { id: obj.id, name: obj.name, flag: flagName }
        this.insertUpdateFilterData(obj1, flagName);
        // this.votersPaginationNo = 1
      }
      this.votersPaginationNo = 1;
    }
  }

  clearGlobalFilterForm(index: any, obj: any, checkFlag: any)
  {
    if (obj.flag == 'AreaId')
    {
      this.globalFilterForm.controls['AreaId'].setValue(0);
    } else if (obj.flag == 'Gender')
    {
      this.globalFilterForm.controls['Gender'].setValue('');
    } else if (obj.flag == 'HaveMobileNo')
    {
      this.globalFilterForm.controls['HaveMobileNo'].setValue(0);
    } else if (obj.flag == 'HaveBussiness')
    {
      this.globalFilterForm.controls['HaveBussiness'].setValue(2);
    } else if (obj.flag == 'ProfessionId')
    {
      this.globalFilterForm.controls['ProfessionId'].setValue(0);
    } else if (obj.flag == 'PartyId')
    {
      this.globalFilterForm.controls['PartyId'].setValue(0);
    } else if (obj.flag == 'LeadeImp')
    {
      this.globalFilterForm.controls['LeadeImp'].setValue(0);
    } else if (obj.flag == 'IsYuvak')
    {
      this.globalFilterForm.controls['IsYuvak'].setValue(2);
    } else if (obj.flag == 'AgegroupId')
    {
      this.globalFilterForm.controls['AgegroupId'].setValue(0);
    } else if (obj.flag == 'FamilySize')
    {
      this.globalFilterForm.controls['FamilySize'].setValue(0);
    } else if (obj.flag == 'ReligionId')
    {
      this.globalFilterForm.controls['ReligionId'].setValue(0);
      this.globalFilterForm.controls['CastId'].setValue(0);
      this.filteredValueNameArray.splice(this.filteredValueNameArray.findIndex((ele: any) => ele?.flag === 'CastId'), 1);
      checkFlag == 'chipFlag' ? this.filteredValueNameArray1.splice(this.filteredValueNameArray.findIndex((ele: any) => ele?.flag === 'CastId'), 1) : '';
    } else if (obj.flag == 'CastId')
    {
      this.globalFilterForm.controls['CastId'].setValue(0);
    } else if (obj.flag == 'InFavourofId')
    {
      this.globalFilterForm.controls['InFavourofId'].setValue(0);
    } else if (obj.flag == 'InOpposeOfId')
    {
      this.globalFilterForm.controls['InOpposeOfId'].setValue(0);
    } else if (obj.flag == 'LocalLeaderId')
    {
      this.globalFilterForm.controls['LocalLeaderId'].setValue(0);
    }
   
    this.filteredValueNameArray.splice(index, 1);
    
    if (checkFlag == 'chipFlag')
    { // when Chip is Remove then Call
      if (this.filterSidebarFlag == 'VotersFlag')
      {
        this.votersPaginationNo = 1
        this.boothVoterList();
      }
      else if (this.filterSidebarFlag == 'CRMFlag')
      {
        this.crmPaginationNo = 1;
        this.getCrmTableData();
      } else if (this.filterSidebarFlag == 'CRMHistoryFlag')
      {
        this.crmHistoryPaginationNo = 1;
        this.getCrmHistoryTableData();
      }
      this.filteredValueNameArray1.splice(index, 1);
    }
  }

  FiltereDataRemove(flagName: any)
  { //Form Remove  formFlag Using
    this.filteredValueNameArray.map((ele: any, index: any) =>
    {
      if (ele.flag == flagName)
      {
        this.indexNo = index;
      }
    })
    let obj = { flag: flagName }
    this.clearGlobalFilterForm(this.indexNo, obj, 'formFlag');
  }

  globalFilterSubmitData()
  {  //Submit filter fun
    this.filteredValueNameArray1 = [];
    this.filteredValueNameArray1 = [...this.filteredValueNameArray];
    if (this.filterSidebarFlag == 'VotersFlag')
    {
      this.boothVoterList();
    }
    else if (this.filterSidebarFlag == 'CRMFlag')
    {
      this.getCrmTableData();
    } else if (this.filterSidebarFlag == 'CRMHistoryFlag')
    {
      this.getCrmHistoryTableData();
    }
  }

  nullishGlobalFilterForm()
  {
    let fromData = this.globalFilterForm.value;
    // fromData.ClientId ?? this.globalFilterForm.controls['ClientId'].setValue(0);
    // fromData.ElectionId ?? this.globalFilterForm.controls['ElectionId'].setValue(0);
    // fromData.ConstituencyId ?? this.globalFilterForm.controls['ConstituencyId'].setValue(0);
    // fromData.VillageId ?? this.globalFilterForm.controls['VillageId'].setValue(0);
    // fromData.AssemblyId ?? this.globalFilterForm.controls['AssemblyId'].setValue(0);
    // fromData.BoothId ?? this.globalFilterForm.controls['BoothId'].setValue(0);
    // fromData.Search ?? this.globalFilterForm.controls['Search'].setValue('');

    fromData.AreaId ?? this.globalFilterForm.controls['AreaId'].setValue(0);
    fromData.Gender ?? this.globalFilterForm.controls['Gender'].setValue('');
    fromData.HaveMobileNo ?? this.globalFilterForm.controls['HaveMobileNo'].setValue(0);
    fromData.HaveBussiness ?? this.globalFilterForm.controls['HaveBussiness'].setValue(2);
    fromData.PartyId ?? this.globalFilterForm.controls['PartyId'].setValue(0);

    fromData.LeadeImp ?? this.globalFilterForm.controls['LeadeImp'].setValue(0);
    fromData.IsYuvak ?? this.globalFilterForm.controls['IsYuvak'].setValue(2);
    fromData.InFavourofId ?? this.globalFilterForm.controls['InFavourofId'].setValue(0);
    fromData.InOpposeOfId ?? this.globalFilterForm.controls['InOpposeOfId'].setValue(0);
    fromData.AgegroupId ?? this.globalFilterForm.controls['AgegroupId'].setValue(0);

    fromData.FamilySize ?? this.globalFilterForm.controls['FamilySize'].setValue(0);
    fromData.ReligionId ?? this.globalFilterForm.controls['ReligionId'].setValue(0);
    fromData.CastId ?? this.globalFilterForm.controls['CastId'].setValue(0);
    fromData.ProfessionId ?? this.globalFilterForm.controls['ProfessionId'].setValue(0);

    fromData.LocalLeaderId ?? this.globalFilterForm.controls['LocalLeaderId'].setValue(0);
  }



  // ------------------------------------------ Global Main filter End here  ------------------------------------------//


  // ------------------------------------------ vooter list with filter start here  ------------------------------------------//

  boothVoterList(){
    this.spinner.show();
    this.nullishFilterForm();
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let genderData = votersData.Gender == 1 ? 'M' : votersData.Gender == 2 ? 'F' : votersData.Gender == 3 ? 'T' : '';

    let obj = {
      "agentId": this.commonService.loggedInUserId(),
      "clientId": Number(topFilterFormData.ClientId),
      "electionId": topFilterFormData.ElectionId,
      "constituencyId": topFilterFormData.ConstituencyId,
      "villageId": topFilterFormData.village,
      "boothId": topFilterFormData.getBoothId,
      "areaId": votersData.AreaId,
      "search": this.searchVoters.value?.trim(),
      "gender": genderData,
      "haveMobileNo": votersData.HaveMobileNo,
      "haveBussiness": votersData.HaveBussiness,
      "professionId": votersData.ProfessionId,
      "partyId": votersData.PartyId,
      "localLeaderId": votersData.LocalLeaderId,
      "leadeImp": votersData.LeadeImp,
      "isYuvak": votersData.IsYuvak,
      "inFavourofId": votersData.InFavourofId,
      "inOpposeOfId": votersData.InOpposeOfId,
      "agegroupId": votersData.AgegroupId,
      "familySize": votersData.FamilySize,
      "religionId": votersData.ReligionId,
      "castId": votersData.CastId,
      "isFilled": this.fillDataId,
      "pageno": this.votersPaginationNo,
      "pagesize": this.votersPageSize,
      "showFlag": this.ShowFlagType,
      "isverifiedContacts": this.isVerifiedContact.value == true ? 1 : 0
    }

    this.callAPIService.setHttp('post', 'VoterList/GetVoterList', false, obj, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.boothVoterListArray = res.responseData.responseData1;
        this.votersTotal = res.responseData.responseData2.totalPages * this.votersPageSize;
        this.rowTotalCountVoter = res.responseData.responseData2.totalCount;
      } else
      {
        this.boothVoterListArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionVoters(pageNo: any)
  {
    this.votersPaginationNo = pageNo;
    this.boothVoterList();
  }

  // ------------------------------------------  vooter list with filter end here ------------------------------------------//


  // ------------------------------------------  Family Details Start here ------------------------------------------//

  familyDetails(ParentVoterId: any, AgentId: any, clientid: any)
  {
    this.familyClientId = clientid; // use for expanded Family Details pass openDialogVoterCallEntries()
    let obj = 'ParentVoterId=' + ParentVoterId + '&ClientId=' + this.filterForm.value.ClientId + '&AgentId=' + AgentId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'VoterList/GetFamilyMember?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.boothFamilyDetailsArray = res.responseData;
      } else
      {
        this.boothFamilyDetailsArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }
  // ------------------------------------------  Family Details end here ------------------------------------------//


  // ------------------------------------------  Agent  list with filter start here  ------------------------------------------//

  boothAgentList()
  {
    let topFilterFormData = this.filterForm.value;
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId
      + '&ElectionId=' + topFilterFormData.ElectionId + '&ConstituencyId='
      + topFilterFormData.ConstituencyId + '&BoothId=' + topFilterFormData.getBoothId +
      '&VillageId=' + topFilterFormData.village + '&Search=' + this.searchAgent.value;

    this.spinner.show();
    this.callAPIService.setHttp('get', 'VoterList/GetAgentWiseBoothSummary?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.boothAgentListArray = res.responseData;
        //this.pendingTotal  = res.data2[0].TotalCount;
      } else
      {
        this.boothAgentListArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  // ------------------------------------------  Agent  list with filter End here  ------------------------------------------//

  // ------------------------------------------  CRM with filter start here  ------------------------------------------//

  deafultCrmFilterForm()
  {
    this.crmFilterForm = this.fb.group({
      Followupstatusid: [0],
      SearchText: [''],
    })
  }

  clearCrmFilter(flag: any) {
    if (flag == 'Followupstatus') {
      this.crmFilterForm.controls["Followupstatusid"].setValue(0);
    }
    // this.crmPaginationNo = 1;
    // this.getCrmTableData();
  }

  onClickPagintionCrm(pageNo: any)
  {
    this.crmPaginationNo = pageNo;
    this.getCrmTableData();
  }

  getCrmTableData()
  {
    this.spinner.show();
    this.nullishFilterForm();
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let genderData = votersData.Gender == 1 ? 'M' : votersData.Gender == 2 ? 'F' : votersData.Gender == 3 ? 'T' : '';
    let followupStatusIdCheckNull = this.crmFilterForm.value.Followupstatusid == null ? 0 : this.crmFilterForm.value.Followupstatusid;

    let obj = {
      "agentId": this.commonService.loggedInUserId(),
      "clientId": Number(topFilterFormData.ClientId),
      "electionId": topFilterFormData.ElectionId,
      "constituencyId": topFilterFormData.ConstituencyId,
      "villageId": topFilterFormData.village,
      "boothId": topFilterFormData.getBoothId,
      "areaId": votersData.AreaId,
      "search": this.crmFilterForm.value.SearchText?.trim(),
      "gender": genderData,
      "haveMobileNo": votersData.HaveMobileNo,
      "haveBussiness": votersData.HaveBussiness,
      "professionId": votersData.ProfessionId,
      "partyId": votersData.PartyId,
      "localLeaderId": votersData.LocalLeaderId,
      "leadeImp": votersData.LeadeImp,
      "isYuvak": votersData.IsYuvak,
      "inFavourofId": votersData.InFavourofId,
      "inOpposeOfId": votersData.InOpposeOfId,
      "agegroupId": votersData.AgegroupId,
      "familySize": votersData.FamilySize,
      "religionId": votersData.ReligionId,
      "castId": votersData.CastId,
      "isFilled": this.fillDataId,
      "pageno": this.crmPaginationNo,
      "pagesize": this.votersPageSize,
      "followupStatusId": followupStatusIdCheckNull,
      "isverifiedContacts": this.isVerifiedContact.value == true ? 1 : 0
    }

    this.callAPIService.setHttp('post', 'VoterList/GetVoterListCRM', false, obj, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.getCrmTableList = res.responseData.responseData1;
        this.getCrmTableListrTotal = res.responseData.responseData2.totalPages * this.crmPageSize;
        this.rowTotalCountCRM = res.responseData.responseData2.totalCount;
      } else
      {
        this.getCrmTableList = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  crmAndCrmHistorySearchClear(flag: any)
  {
    if (flag == 'crm')
    {
      this.crmFilterForm.controls["Followupstatusid"].setValue(0);
      this.crmFilterForm.controls["SearchText"].setValue('');
    } else if (flag == 'crmHistory')
    {
      this.crmHistoryFilterForm.controls["SearchText"].setValue('');
    } else if (flag == 'crm1')
    {
      this.crmFilterForm.controls["SearchText"].setValue('');
      // this.getCrmTableData();
    } else if (flag == 'crmHistory1')
    {
      this.crmHistoryFilterForm.controls["SearchText"].setValue('');
      // this.getCrmHistoryTableData();
    }
  }

  // ------------------------------------------  CRM with filter End here  ------------------------------------------//

  // ------------------------------------------  CRM History with filter start here  ------------------------------------------//

  deafultCrmHistoryFilterForm()
  {
    this.crmHistoryFilterForm = this.fb.group({
      Followupstatusid: [0],
      SearchText: [''],
      feedbackstatus: [0],
      date: ['']
    })
  }

  clearCrmHistoryFilter(flag: any)
  {
    if (flag == 'Followupstatus')
    {
      this.crmHistoryFilterForm.controls["Followupstatusid"].setValue(0);
    } else if (flag == 'feedbackstatus')
    {
      this.crmHistoryFilterForm.controls["feedbackstatus"].setValue(0);
    } else if (flag == 'dateRangePIcker')
    {
      this.crmHistoryFilterForm.controls["date"].setValue('');
    }
    // this.crmHistoryPaginationNo = 1;
    // this.getCrmHistoryTableData();
  }

  onClickPagintionCrmHistory(pageNo: any)
  {
    this.crmHistoryPaginationNo = pageNo;
    this.getCrmHistoryTableData();
  }

  getCrmHistoryTableData()
  {
    this.spinner.show();
    this.nullishFilterForm();
    this.nullishGlobalFilterForm();
    let crmHistoryFilterData = this.crmHistoryFilterForm.value;
    crmHistoryFilterData.date = crmHistoryFilterData.date ? this.datePipe.transform(crmHistoryFilterData.date, 'yyyy/MM/dd') : '';
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let genderData = votersData.Gender == 1 ? 'M' : votersData.Gender == 2 ? 'F' : votersData.Gender == 3 ? 'T' : '';
    let followupStatusIdCheckNull = crmHistoryFilterData.Followupstatusid == null ? 0 : crmHistoryFilterData.Followupstatusid;
    let feedbackStatusIdCheckNull = crmHistoryFilterData.feedbackstatus == null ? 0 : crmHistoryFilterData.feedbackstatus;

    let obj = {
      "agentId": this.commonService.loggedInUserId(),
      "clientId": Number(topFilterFormData.ClientId),
      "electionId": topFilterFormData.ElectionId,
      "constituencyId": topFilterFormData.ConstituencyId,
      "villageId": topFilterFormData.village,
      "boothId": topFilterFormData.getBoothId,
      "areaId": votersData.AreaId,
      "search": crmHistoryFilterData.SearchText?.trim(),
      "gender": genderData,
      "haveMobileNo": votersData.HaveMobileNo,
      "haveBussiness": votersData.HaveBussiness,
      "professionId": votersData.ProfessionId,
      "partyId": votersData.PartyId,
      "localLeaderId": votersData.LocalLeaderId,
      "leadeImp": votersData.LeadeImp,
      "isYuvak": votersData.IsYuvak,
      "inFavourofId": votersData.InFavourofId,
      "inOpposeOfId": votersData.InOpposeOfId,
      "agegroupId": votersData.AgegroupId,
      "familySize": votersData.FamilySize,
      "religionId": votersData.ReligionId,
      "castId": votersData.CastId,
      "isFilled": this.fillDataId,
      "pageno": this.crmHistoryPaginationNo,
      "pagesize": this.crmHistoryPageSize,
      "followupStatusId": followupStatusIdCheckNull,
      "feedbackStatusId": feedbackStatusIdCheckNull,
      "follwupdate": crmHistoryFilterData.date,
      "isverifiedContacts": this.isVerifiedContact.value == true ? 1 : 0
    }
    this.callAPIService.setHttp('post', 'VoterList/GetVoterListCRMHistory', false, obj, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.getCrmHistoryTableList = res.responseData.responseData1;
        this.getCrmHistoryTableListrTotal = res.responseData.responseData2.totalPages * this.crmHistoryPageSize;
        this.rowTotalCountCRMHistory = res.responseData.responseData2.totalCount;
      } else
      {
        this.getCrmHistoryTableList = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }


  // ------------------------------------------  CRM History with filter End here  ------------------------------------------//





  // ------------------------------------------  global uses start here   ------------------------------------------//
  clearFiltersBooth(flag: any)
  {
    if (flag == 'clearSearchVoters')
    {
      this.searchVoters.setValue('');
      // this.boothVoterList();
    } else if (flag == 'clearFiltersAgent')
    {
      this.searchAgent.setValue('');
      // this.boothAgentList();
    }
  }

  defaultShowVoterList()
  { // defualt click voters tab
    let clickOnVoterTab: any = document.getElementById('pills-voters-tab');
    clickOnVoterTab.click();
  }
  // ------------------------------------------  global uses end here   ------------------------------------------//

  redirectToBoothAgentDetails(agentList: any) { //Redirect agents-activity Page
    window.open('../agents-activity/' + agentList.clientId + '.' + agentList.boothAgentId + '.' + agentList.addedby + '.' + agentList.subUserTypeId);
  }
  redirectToAreaAgentDetails(agentList: any) { //Redirect agents-activity Page
    window.open('../agents-activity/' + agentList.clientId + '.' + agentList.addedby + '.' + agentList.boothAgentId + '.' + agentList.subUserTypeId);
  }

  redirectToVoterPrfile(obj: any)
  { //Redirect Voter Profile Page
    window.open('../voters-profile/' + obj.agentId + '.' + obj.clientId + '.' + obj.voterId);
  }

  //....................................  Voter Call Entries Start Here...........................................//

  openDialogVoterCallEntries(obj: any)
  {
    let formData = this.filterForm.value;
    obj.hasOwnProperty('clientId') ? '' : obj['clientId'] = this.familyClientId;
    // let Obj1 = { 'VoterId': obj.voterId, 'ClientId': obj.clientId, 'AgentId': obj.agentId }
    // const dialogRef = this.dialog.open(VoterCallEntriesComponent, {
    //   data: Obj1,
    //   panelClass: 'fullscreen-dialog',
    //   height: '96vh',
    //   width: '99%'
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
    window.open('crm-history/' + obj.agentId + '.' + obj.clientId + '.' + obj.voterId + '.' + formData.ElectionId + '.' + formData.ConstituencyId);

  }

  //....................................  Voter Call Entries End Here...........................................//

  // ..................................   Download Excel VoterList Code Start Here  ...........................//

  getVoterListDownloadExcel()
  {
    this.spinner.show();
    this.nullishFilterForm();
    this.nullishGlobalFilterForm();
    let votersData = this.globalFilterForm.value;
    let topFilterFormData = this.filterForm.value;
    let genderData = votersData.Gender == 1 ? 'M' : votersData.Gender == 2 ? 'F' : votersData.Gender == 3 ? 'T' : '';

    let obj = {
      "agentId": this.commonService.loggedInUserId(),
      "clientId": Number(topFilterFormData.ClientId),
      "electionId": topFilterFormData.ElectionId,
      "constituencyId": topFilterFormData.ConstituencyId,
      "villageId": topFilterFormData.village,
      "boothId": topFilterFormData.getBoothId,
      "areaId": votersData.AreaId,
      "search": this.searchVoters.value?.trim(),
      "gender": genderData,
      "haveMobileNo": votersData.HaveMobileNo,
      "haveBussiness": votersData.HaveBussiness,
      "partyId": votersData.PartyId,
      "localLeaderId": votersData.LocalLeaderId,
      "leadeImp": votersData.LeadeImp,
      "isYuvak": votersData.IsYuvak,
      "inFavourofId": votersData.InFavourofId,
      "inOpposeOfId": votersData.InOpposeOfId,
      "agegroupId": votersData.AgegroupId,
      "familySize": votersData.FamilySize,
      "religionId": votersData.ReligionId,
      "castId": votersData.CastId,
      "isFilled": this.fillDataId,
      "pageno": this.votersPaginationNo,
      "pagesize": this.votersPageSize,
      "showFlag": this.ShowFlagType
    }

    this.callAPIService.setHttp('post', 'VoterList/GetVoterListDownload', false, obj, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.responseData.length != 0)
      {
        this.spinner.hide();
        this.VoterListDownloadExcel = res.responseData;
        this.downloadExcel();
      } else
      {
        this.toastrService.error("No Data Found");
        this.VoterListDownloadExcel = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  keyData:any;
  ValueData:any;

  downloadExcel(flag?:any){
    this.keyData = []; this.ValueData = [];
    if (flag == 'agentFlag') {
      let keyValue = this.boothAgentListArray.map((value: any) => Object.keys(value));
      this.keyData = keyValue[0]; // key Name

      this.ValueData = this.boothAgentListArray.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)],
        []
      );// Value Name
    } else {
      let keyValue = this.VoterListDownloadExcel.map((value: any) => Object.keys(value));
      this.keyData = keyValue[0]; // key Name

      this.ValueData = this.VoterListDownloadExcel.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)],
        []
      );// Value Name
    }

    let TopHeadingData = {
      ElectionName: this.topElectionName,
      ConstituencyName: this.topConstituencyName, BoothName: (this.topBoothName ? this.topBoothName : '-'),
      PageName: 'VoterList'
    }

    this.excelService.generateExcel(this.keyData, this.ValueData, TopHeadingData);
  }

  // ..................................  Download Excel VoterList Code End Here  ...........................//

}
