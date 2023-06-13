import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-prominent-leader',
  templateUrl: './prominent-leader.component.html',
  styleUrls: ['./prominent-leader.component.css']
})
export class ProminentLeaderComponent implements OnInit {

  prominentLeaderForm!: FormGroup;
  constituencyNameArray: any;
  electionNameArray: any;
  submitted: boolean = false;
  btnText = 'Submit';
  prominentLeaderArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  HighlightRow: any;
  // ProminentLeaderObj: any;
  clientNameArray: any;
  ClientIdTop = new FormControl(0);
  Search = new FormControl('');
  subject: Subject<any> = new Subject();
  searchFilter = "";
  politicalPartyArray: any;
  deleteObj: any;
  ProminentLeaderObj: any;
  globalClientId: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.globalClientId = this.commonService.getlocalStorageData().ClientId;
    this.defaultProminentLeaderForm();
    this.getClientName();
    this.getPoliticalPartyList();
    this.searchFilters('false');
  }

  defaultProminentLeaderForm() {
    this.prominentLeaderForm = this.fb.group({
      Id: [0],
      LeaderName: ['', [Validators.required,Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'\/\\]\\]{}][a-zA-Z\\s]+$')]],
      MobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      PartyId: ['', Validators.required],
      ClientId: ['', Validators.required],
      ElectionId: ['', Validators.required],
      ConstituencyId: ['', [Validators.required]],
    })
  }

  get f() { return this.prominentLeaderForm.controls };

  clearForm() {
    this.submitted = false;
    this.btnText = 'Submit'
    this.defaultProminentLeaderForm();
    if (this.clientNameArray.length == 1) {
    this.prominentLeaderForm.patchValue({ ClientId: this.clientNameArray[0].id });
    }
  }

  getClientName() {
    // this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.spinner.hide();
        this.clientNameArray = res.data1;

        if (this.clientNameArray.length == 1) {
          this.prominentLeaderForm.patchValue({ ClientId: this.clientNameArray[0].id });
          this.getElection();
          this.ClientIdTop.setValue(this.clientNameArray[0].id);
        }
        if (this.btnText == 'Update' && this.clientNameArray.length != 1) {
          this.getElection();
        }
        this.getProminentLeader();
      } else {
        // this.spinner.hide();
      }
    }, (error: any) => {
      // this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  //.......... get Political Party List ...............//
  getPoliticalPartyList() {
    // this.spinner.show();
    this.prominentLeaderForm.value.ClientId == '' ? this.prominentLeaderForm.value.ClientId = 0 : this.prominentLeaderForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Web_Get_VoterList_Filter_PoliticalParty_ddl?ClientId=' + this.prominentLeaderForm.value.ClientId + '&UserId='
      + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.spinner.hide();
        this.politicalPartyArray = res.data1;
      } else {
        // this.spinner.hide();
        this.politicalPartyArray = [];
      }
    }, (error: any) => {
      // this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElection() {
    // this.spinner.show();
    this.prominentLeaderForm.value.ClientId == '' ? this.prominentLeaderForm.value.ClientId = 0 : this.prominentLeaderForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.prominentLeaderForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.spinner.hide();
        this.electionNameArray = res.data1;
        if (this.electionNameArray.length == 1) {
          this.prominentLeaderForm.patchValue({ ElectionId: this.electionNameArray[0].ElectionId })
          this.getConstituency();
        }
        if (this.btnText == 'Update' && this.electionNameArray.length != 1) {
          this.prominentLeaderForm.controls['ElectionId'].setValue(this.ProminentLeaderObj.ElectionId);
          this.getConstituency();
        }

      } else {
        // this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) => {
      // this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getConstituency() {
    // this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId()
      + '&ElectionId=' + this.prominentLeaderForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.spinner.hide();
        this.constituencyNameArray = res.data1;
        if (this.constituencyNameArray.length == 1) {
          this.prominentLeaderForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].id })
        }
        if (this.btnText == 'Update' && this.constituencyNameArray.length != 1) {
          this.prominentLeaderForm.controls['ConstituencyId'].setValue(this.ProminentLeaderObj.ConstituencyId);
        }
      } else {
        // this.spinner.hide();
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      // this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  acceptedOnlyNumbers(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // .............. Get prominent Leader Api.....................//

  getProminentLeader() {
    this.spinner.show();
    let obj = '&ClientId=' + this.ClientIdTop.value + '&nopage=' + this.paginationNo + '&Search=' + this.Search.value;
    this.callAPIService.setHttp('get', 'Web_Get_tblprominentleader?UserId=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.prominentLeaderArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.prominentLeaderArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (this.prominentLeaderForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.prominentLeaderForm.value.ClientId == '' ? this.prominentLeaderForm.value.ClientId = 0 : this.prominentLeaderForm.value.ClientId;
      let formData = this.prominentLeaderForm.value;
      let id;
      formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
      let obj = id + '&LeaderName=' + formData.LeaderName + '&MobileNo=' + formData.MobileNo + '&PartyId=' + formData.PartyId +
        '&ElectionId=' + formData.ElectionId + '&ConstituencyId=' + formData.ConstituencyId
        + '&ClientId=' + formData.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId();
      this.callAPIService.setHttp('get', 'Web_Insert_tblprominentleader?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.spinner.hide();
          this.submitted = false;
          this.btnText = 'Submit';
          this.getProminentLeader();
          this.clearForm();
        } else {
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  patchProminentLeaderData(obj: any) {
    this.HighlightRow = obj.SrNo;
    this.btnText = 'Update';
    this.ProminentLeaderObj = obj;
    this.prominentLeaderForm.patchValue({
      Id: obj.ProminentleaderId,
      LeaderName: obj.LeaderName,
      MobileNo: obj.MobileNo,
      PartyId: obj.PartyId,
      // ElectionId: obj.ElectionId,
      // ConstituencyId:obj.ConstituencyId,
      ClientId: obj.ClientId,
      CreatedBy: obj.CreatedBy
    })
    this.getClientName();
    // this.getElection();
    //this.getConstituency();
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getProminentLeader();
  }

  clearFormData(flag: any) {
    if (flag == 'client') {
      this.prominentLeaderForm.controls['ClientId'].setValue('');
      this.prominentLeaderForm.controls['ElectionId'].setValue('');
      this.prominentLeaderForm.controls['ConstituencyId'].setValue('');
    } else if (flag == 'election') {
      this.prominentLeaderForm.controls['ElectionId'].setValue('');
      this.prominentLeaderForm.controls['ConstituencyId'].setValue('');
    } else if (flag == 'constituency') {
      this.prominentLeaderForm.controls['ConstituencyId'].setValue('');
    }
  }

  clearTopFilter(flag: any) {
    if (flag == 'search') {
      this.Search.setValue('');
      this.clearForm();
    } else
      if (flag == 'clientId') {
        this.ClientIdTop.setValue(0);
        this.clearForm();
      }
    this.getProminentLeader();
  }

  onKeyUpFilter() {
    this.subject.next();
    this.clearForm();
  }

  searchFilters(flag: any) {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.Search.value;
         this.paginationNo = 1;
        this.getProminentLeader();
      }
      );
  }

  delConfirmation(obj: any) { //Election Master data remove
    this.deleteObj = obj;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteProminentLeader();
      }
    });
  }

  deleteProminentLeader() {
    this.callAPIService.setHttp('get', 'Web_Delete_ProminentLeader?ProminentLeaderId=' + this.deleteObj.ProminentleaderId
      + '&ClientId=' + this.deleteObj.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getProminentLeader();
        this.clearForm();
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

}
