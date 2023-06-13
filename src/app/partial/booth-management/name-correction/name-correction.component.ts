import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NameCorrectionDialogComponent } from '../../dialogs/name-correction-dialog/name-correction-dialog.component';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-name-correction',
  templateUrl: './name-correction.component.html',
  styleUrls: ['./name-correction.component.css']
})
export class NameCorrectionComponent implements OnInit {

  filterForm!: FormGroup;
  // boothDataHide: boolean = false;
  clientIdFlag: boolean = true;
  electionFlag: boolean = true;
  constituencyFlag: boolean = true;
  villageFlag: boolean = true;
  boothFlag: boolean = true;
  agentFlag: boolean = true;
  nameChangeFlag: boolean = true;

  electionNameArray: any;
  constituencyNameArray: any;
  villageNameArray: any;
  clientWiseBoothListArray: any;
  IsSubElectionApplicable: any;
  clientNameArray: any;
  allAgentLists: any;
  subject: Subject<any> = new Subject();
  searchFilter: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  NameChangeTypeArray = [{ id: 2, name: "Requested" }, { id: 1, name: "Changed" }, { id: 3, name: "From Voter List" }];
  clientHaveSubEOrNonSubEArray: any;


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }


  ngOnInit(): void {
    this.defaultFilterForm();
    this.getClientName();
    this.searchFilters('false');
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      VillageId: [0],
      BoothId: [0],
      NameChangeType: [0],
      AgentId: [0],
      Search: [''],
    })
  }

  getClientName() {
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.clientNameArray = res.data1;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].id }), this.getElectionName(), this.clientIdFlag = false) : '';
      } else {
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElectionName() {
    this.getAllAgentList();
    this.nullishFilterForm();
    let fromData = this.filterForm.value;
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.electionNameArray = res.data1;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].ElectionId }), this.IsSubElectionApplicable = this.electionNameArray[0].IsSubElectionApplicable, this.getConstituencyName(), this.electionFlag = false) : '';
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getConstituencyName() {
    this.nullishFilterForm();
    let fromData = this.filterForm.value;
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + fromData.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.constituencyNameArray = res.data1;
        // this.IsSubElectionApplicable == undefined || this.IsSubElectionApplicable == null ? this.getIsSubEleAppId(this.filterForm.value.ElectionId) : '';
        this.getIsSubEleAppId(this.filterForm.value.ElectionId);
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].ConstituencyId }), this.constituencyFlag = false), this.getVillageName()) : '';
        this.getClientHaveSubEleOrNonSubEle();
      } else {
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  clearFiltersBooth(flag: any) {
    if (flag == 'village') {
      this.filterForm.value.VillageId.setValue(0);
      this.ClientWiseBoothList();
      // this.boothDataHide = false;
    }
  }

  getIsSubEleAppId(eleId: any) {
    this.electionNameArray.filter((item: any) => {
      if (item.ElectionId == eleId) {
        this.IsSubElectionApplicable = item.IsSubElectionApplicable;
      }
    })
  }

  getVillageName() {
    this.nullishFilterForm();
    let fromData = this.filterForm.value;

    let obj = 'ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + fromData.ElectionId + '&ConstituencyId=' + fromData.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable   
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothVillages?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {       
        this.villageNameArray = res.data1;
        this.villageNameArray.length == 1 ? ((this.filterForm.patchValue({ VillageId: this.villageNameArray[0].VillageId }), this.villageFlag = false), this.ClientWiseBoothList()) : '';
      } else {
        this.villageNameArray = [];       
      }
    }, (error: any) => {      
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ClientWiseBoothList() {
    this.nullishFilterForm();
    let fromData = this.filterForm.value;

    let obj = 'ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + fromData.ElectionId + '&ConstituencyId=' + fromData.ConstituencyId
      + '&AssemblyId=' + 0 + '&IsSubElectionApplicable=' + this.IsSubElectionApplicable + '&VillageId=' + fromData.VillageId   
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {       
        this.clientWiseBoothListArray = res.data1;
        this.clientWiseBoothListArray.length == 1 ? ((this.filterForm.patchValue({ BoothId: this.clientWiseBoothListArray[0].BoothId }), this.boothFlag = false)) : '';
      } else {
        this.clientWiseBoothListArray = [];        
        //this.clearForm();
      }
      this.getClientHaveSubEleOrNonSubEle();
    }, (error: any) => {     
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAllAgentList() {
    this.nullishFilterForm();
    let fromData = this.filterForm.value;

    this.callAPIService.setHttp('get', 'Web_Client_AllAgentList_ddl?ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {      
        this.allAgentLists = res.data1;
        //this.allAgentLists.length == 1 ?  (this.filterForm.controls['AgentId'].setValue(this.allAgentLists[0].AgentId),  this.agentFlag = false) : '';
      } else {
        this.allAgentLists = [];     
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //...........  Get ClientHavesubEle NameChangeVoterList & Get ClientHaveNosubEle NameChangeVoterList ........//

  getClientHaveSubEleOrNonSubEle() {
    this.spinner.show();
    this.nullishFilterForm();
    let fromData = this.filterForm.value;
    let obj = 'ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + fromData.ElectionId + '&ConstituencyId=' + fromData.ConstituencyId
      + '&AssemblyId=' + 0 + '&BoothId=' + fromData.BoothId + '&VillageId=' + fromData?.VillageId + '&NameChangeFlag=' + fromData.NameChangeType
      + '&AgentId=' + fromData.AgentId + '&Search=' + fromData.Search?.trim() + '&nopage=' + this.paginationNo
    let url: any;
    this.getIsSubElectionApplicable() == 1 ? url = 'Web_Get_ClientHaveSubEle_NameChangeVoterList?' : url = 'Web_Get_ClientHaveNosubEle_NameChangeVoterList?';
    this.callAPIService.setHttp('get', url + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientHaveSubEOrNonSubEArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.clientHaveSubEOrNonSubEArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getIsSubElectionApplicable() {
    let eleIsSubElectionApplicable: any;
    this.electionNameArray.filter((ele: any) => {
      if (ele.ElectionId == this.filterForm.value.ElectionId) {
        eleIsSubElectionApplicable = ele.IsSubElectionApplicable
      };
    })
    return eleIsSubElectionApplicable;
  }

  clearFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.reset();
      this.clientHaveSubEOrNonSubEArray = [];
    } else if (flag == 'electionId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId })
      this.clientHaveSubEOrNonSubEArray = [];
    } else if (flag == 'constituencyId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId });
      this.getClientHaveSubEleOrNonSubEle();
    } else if (flag == 'VillageId') {
      this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId })
      this.getClientHaveSubEleOrNonSubEle();
    } else if (flag == 'AgentId') {
      debugger;
      //this.filterForm.reset({ ClientId: this.filterForm.value.ClientId, ElectionId: this.filterForm.value.ElectionId, ConstituencyId: this.filterForm.value.ConstituencyId })
      this.filterForm.controls['AgentId'].setValue(0);
      this.getClientHaveSubEleOrNonSubEle();
    } else if (flag == 'NameChangeType') {
      this.filterForm.controls['NameChangeType'].setValue(0);
      this.getClientHaveSubEleOrNonSubEle();
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
      this.getClientHaveSubEleOrNonSubEle();
    } else if (flag == 'BoothId') {
      this.filterForm.controls['BoothId'].setValue(0);
      this.getClientHaveSubEleOrNonSubEle();
    }
  }

  nullishFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.VillageId ?? this.filterForm.controls['VillageId'].setValue(0);
    fromData.BoothId ?? this.filterForm.controls['BoothId'].setValue(0);
    fromData.NameChangeType ?? this.filterForm.controls['NameChangeType'].setValue(0);
    fromData.AgentId ?? this.filterForm.controls['AgentId'].setValue(0);
    fromData.Search ?? this.filterForm.controls['Search'].setValue('');
  }

  onKeyUpFilter() {
    this.subject.next();
    //this.resetConstituencyName();
  }

  searchFilters(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.filterForm.value.Search;
        this.paginationNo = 1;
        this.getClientHaveSubEleOrNonSubEle();
      }
      );
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getClientHaveSubEleOrNonSubEle();
  }

  openDialogNameCorrection(obj: any) {
    const dialogRef = this.dialog.open(NameCorrectionDialogComponent, {
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getClientHaveSubEleOrNonSubEle();
    });
  }

}