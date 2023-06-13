import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-assign-elections-to-regional-leader',
  templateUrl: './assign-elections-to-regional-leader.component.html',
  styleUrls: ['./assign-elections-to-regional-leader.component.css']
})
export class AssignElectionsToRegionalLeaderComponent implements OnInit {

  getClientName: any;
  assignElectionForm!: FormGroup;
  submitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Assign';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  assElectionId: any;
  electionNameArray: any;
  constituencyNameArray: any;
  ConstituencyId: any;
  highlightedRow: any;
  subConsArray: any;
  addSubConstituencyArray: any = [];
  index: any;
  subConstituencyTableDiv: boolean = false;
  resAssignedConstituencytoClient: any;
  HeaderId: any
  clientDetailsArray: any;


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
    this.getClient();
    this.defaultAssElectionForm();
    this.defaultFilterForm();
    this.getElection();
    this.getAssignedConstituencytoClient();
    this.searchFilters('false');
  }

  defaultAssElectionForm() {
    this.assignElectionForm = this.fb.group({
      Id: [0],
      ClientId: ['', Validators.required],
      strConstituency: [''],
      ElectionId: [''],
      Createdby: [this.commonService.loggedInUserId()],
    })
  }

  get f() { return this.assignElectionForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0, Validators.required],
      Search: [''],
    })
  }

  onSubmitAssElection() {
    this.validationSubElectionForm();
    let formData: any = this.assignElectionForm.value;
    this.submitted = true;
    if (this.assignElectionForm.invalid) {
      this.spinner.hide();
      return;
    } 
     else if (this.addSubConstituencyArray.length == 0 && this.assignElectionForm.valid) {
      this.validationSubElectionForm();
      this.toastrService.error("Plese Add Election & Constituency");
      return;
    }

    this.addSubConstituencyArray.map((ele: any) => {
      delete ele['ElectionName'];
      delete ele['ConstituencyName'];
      ele['SrNo'] ? delete ele['SrNo'] : ''; // if sr no is assign del sr no 
      ele['HeaderId'] ? delete ele['HeaderId'] : ''; // if HeaderId no is assign del sr no 
    })
    this.subConsArray = JSON.stringify(this.addSubConstituencyArray);
    this.spinner.show();
    let id;
    let NoofMembers;
    formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
    formData.Members == 0 ? NoofMembers = 1 : NoofMembers = formData.NoofMembers;
    let obj = id + '&ClientId=' + formData.ClientId + '&strConstituency=' + this.subConsArray + '&CreatedBy=' + this.commonService.loggedInUserId();
    this.callAPIService.setHttp('get', 'Web_Insert_Assign_Constituency_to_Client?Id=' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.addSubConstituencyArray = [];
        this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg);
        this.btnText = "Assign";
        this.getAssignedConstituencytoClient();
        this.resetAssignElectionForm();
      } else {
        this.spinner.hide();
        //  //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    });
  }

  resetAssignElectionForm() {
    this.defaultAssElectionForm();
    this.addSubConstituencyArray = [];
    this.submitted = false;
  }


  getElection() {
    this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.electionNameArray = res.data1;
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getClient() {
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.getClientName = res.data1;
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAssignedConstituencytoClient() {
    let filterData = this.filterForm.value;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedConstituencytoClient?ClientId=' + filterData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + filterData.Search + '&nopage=' + this.paginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resAssignedConstituencytoClient = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.resAssignedConstituencytoClient = [];
        // this.toastrService.error("Constituency Name is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  GetConstituencyName(ElectionId: any) {
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.assignElectionForm.controls['strConstituency'].setValue(this.ConstituencyId);
        this.constituencyNameArray = res.data1;
      } else {
        this.constituencyNameArray = [];
        this.toastrService.error("Constituency is not added for the Election");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editConstituency(headerId: any) {//Edit api
    this.resetAssignElectionForm();
    this.callAPIService.setHttp('get', 'Web_Get_ClientConstituencyDetails?HeaderId=' + headerId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.clientDetailsArray = res.data1[0];
        this.addSubConstituencyArray = res.data2;
        this.patchCreateConstituency(this.clientDetailsArray);
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  patchCreateConstituency(data: any) {
    this.btnText = "Update";
    this.highlightedRow = data.HeaderId;
    this.assignElectionForm.patchValue({
      Id: data.HeaderId,
      ClientId: data.Clientid,
    });
  }

  validationNoofMembers() {
    if (this.assignElectionForm.value.Members == 1) {
      this.assignElectionForm.controls["NoofMembers"].setValidators(Validators.required);
      this.assignElectionForm.controls["NoofMembers"].updateValueAndValidity();
      this.assignElectionForm.controls["NoofMembers"].clearValidators();
    }
    else {
      this.assignElectionForm.controls["NoofMembers"].clearValidators();
      this.assignElectionForm.controls["NoofMembers"].updateValueAndValidity();
    }
  }

  validationSubElectionForm() {
    if (this.addSubConstituencyArray.length == 0) {
      this.assignElectionForm.controls["strConstituency"].setValidators(Validators.required);
      this.assignElectionForm.controls["ElectionId"].setValidators(Validators.required);
      this.assignElectionForm.controls["strConstituency"].updateValueAndValidity();
      this.assignElectionForm.controls["ElectionId"].updateValueAndValidity();
      this.assignElectionForm.controls["strConstituency"].clearValidators();
      this.assignElectionForm.controls["ElectionId"].clearValidators();
    }
    else {
      this.assignElectionForm.controls["strConstituency"].clearValidators();
      this.assignElectionForm.controls["strConstituency"].updateValueAndValidity();
      this.assignElectionForm.controls["ElectionId"].clearValidators();
      this.assignElectionForm.controls["ElectionId"].updateValueAndValidity();
    }
  }

  clearForm() {
    this.submitted = false;
    this.btnText = 'Assign'
    this.defaultAssElectionForm();
    this.addSubConstituencyArray = [];
  }

  delConfirmAssElection(ClientId: any, HeaderId: any) {
    this.assElectionId = ClientId;
    this.HeaderId = HeaderId;
    this.deleteConfirmModel('clientDelete');
    this.getAssignedConstituencytoClient();
  }

  delConfirmAssEle(index: any) {
    this.index = index;
    this.deleteConfirmModel('subElectionDelFlag');
  }

  deleteConfirmModel(flag: any) {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        if (flag == 'subElectionDelFlag') {
          this.addSubConstituencyArray.splice(this.index, 1);
          this.subConsTableHideShowOnArray();
        } else {
          this.deleteClientData();
        }
      }
    });
  }

  subConsTableHideShowOnArray() {
    this.addSubConstituencyArray.length != 0 ? this.subConstituencyTableDiv = true : this.subConstituencyTableDiv = false; // hide div on array
  }

  deleteClientData() {
    this.callAPIService.setHttp('get', 'Web_Election_Delete_ClientConstituency?ClientId=' + this.assElectionId + '&HeaderId=' + this.HeaderId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getAssignedConstituencytoClient();
        this. clearForm();
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getAssignedConstituencytoClient();
  }


  clearFilter(flag: any) {
    if (flag == 'ClientId') {
      this.filterForm.controls['ClientId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getAssignedConstituencytoClient();
    this.resetAssignElectionForm();
  }

  filterData() {
    this.paginationNo = 1;
    this.getAssignedConstituencytoClient();
    this.resetAssignElectionForm();
  }

  onKeyUpFilter() {
    this.subject.next();
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.Search == "" || this.filterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.filterForm.value.Search;
        this.paginationNo = 1;
        this.getAssignedConstituencytoClient();
      }
      );
  }

  addSubConstituency() {
    let eleName: any;
    let subElectionNameBySubEleId: any;
    this.electionNameArray.find((ele: any) => { // find election name by ele id
      if (this.assignElectionForm.value.ElectionId == ele.Id) {
        eleName = ele.ElectionName;
      }
    });

    this.constituencyNameArray.find((ele: any) => { // find sub election name by sub ele id
      if (this.assignElectionForm.value.strConstituency == ele.id) {
        subElectionNameBySubEleId = ele.ConstituencyName;
      }
    });

    let arrayOfObj = this.subConstArrayCheck(this.assignElectionForm.value.ElectionId, this.assignElectionForm.value.strConstituency);
    if (arrayOfObj == false) {
      this.addSubConstituencyArray.push({ 'ElectionName': eleName, 'ConstituencyName': subElectionNameBySubEleId, 'ElectionId': this.assignElectionForm.value.ElectionId, 'ConstituencyId': this.assignElectionForm.value.strConstituency });
    } else {
      this.toastrService.error("Election Name and Constituency Name already exists");
    }
    this.assignElectionForm.controls.ElectionId.reset();
    this.assignElectionForm.controls.strConstituency.reset();
    this.subConsTableHideShowOnArray();
  }

  subConstArrayCheck(eleName: any, subEleCostName: any) {
    return this.addSubConstituencyArray.some((el: any) => {
      return el.ElectionId === eleName && el.ConstituencyId === subEleCostName;
    });
  }

}
