import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute,Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-create-elections',
  templateUrl: './create-elections.component.html',
  styleUrls: ['./create-elections.component.css']
})
export class CreateElectionsComponent implements OnInit {

  createElectionForm!: FormGroup;
  submitted = false;
  boothListTypeArray = [{ id: 0, name: "Assembly Booth List" }, { id: 1, name: "User Defined Booth List" }];
  subElectionAppArray = [{ id: 1, name: "Yes" }, { id: 0, name: "No" }];
  electionTypeArray: any;
  subElectionDivHide: boolean = false;
  subElecTableHide: boolean = false;
  addSubElectionArray: any = [];
  index: any;
  electionMasterArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  electionDropArray: any;
  electionDetailsArray: any;
  subElectionDisableBtn: boolean = true;
  ElectionId: any;
  btnText = 'Create Election';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  SubElectionDisabled = true;
  HighlightRow: any;
   subEleArray:any
  prevArrayData: any;


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
    this.defaultProgramForm();
    this.defaultFilterForm();
    this.getElectionType();
     this.getElectionMaster();
     this.getsubElection();
     this.searchFilters('false');
  }

  defaultProgramForm() {
    this.createElectionForm = this.fb.group({
      Id: [0],
      ElectionName: ['', [Validators.required,Validators.pattern('^[^\\s0-9\\[\\[`&-._@#%*!+"\'\/\\]\\]{}][a-zA-Z0-9&-._@#%\\s]+$')]],
      ElectionTypeId: ['', Validators.required],
      IsAsemblyBoothListApplicable: [0],
      IsSubElectionApplicable: [0],
      SubElectionId: [''],
    })
  }

  get f() { return this.createElectionForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ElectionTypeId: [0],
      Search: [''],
    })
  }

  subElectionRadiobtn(subEleId: any) {
    if (subEleId == 1) {
      this.subElectionDivHide = true;
      this.subElecTableHide = true;
      this.prevArrayData?.length != 0 ? this.addSubElectionArray = this.prevArrayData : this.addSubElectionArray = [];
    } else {
      this.createElectionForm.controls.SubElectionId.reset();
      this.prevArrayData = this.addSubElectionArray;
      this.subElectionDivHide = false;
      this.addSubElectionArray = [];
      this.subElecTableHide = false;
    }
    this.createElectionForm.value.Id == 0 ? this.addSubElectionArray = [] : this.addSubElectionArray ;
    (this.createElectionForm.value.Id != 0 && this.electionDetailsArray.IsSubElectionApplicable == 0 ) ? this.addSubElectionArray = [] : this.addSubElectionArray;
    
  }

  addBtndisabledEnabled() {// when dropdown value select
    this.SubElectionDisabled = false; // add btn enabled
  }

  addSubElection() {
    this.SubElectionDisabled = true; // add btn disabled
    this.subElecTableHide = true;
    let Id;
    let subElectionName;
    if (this.createElectionForm.value.ElectionName != this.createElectionForm.value.SubElectionId) {

      this.electionDropArray.filter((ele: any) => { // filter Id
        if (ele.ElectionName == this.createElectionForm.value.SubElectionId) {
          Id = ele.Id;
        }
      })

      this.addSubElectionArray.filter((ele: any) => { // filter Sub ElectionName
        if (ele.ElectionName == this.createElectionForm.value.SubElectionId) {
          subElectionName = ele.ElectionName;
        }
      })

      if (!subElectionName) {
        this.addSubElectionArray.push({ 'SubElectionId': Id, 'ElectionName': this.createElectionForm.value.SubElectionId });
        this.createElectionForm.controls.SubElectionId.reset();
      } else {
        this.createElectionForm.controls.SubElectionId.reset();
        this.toastrService.error("Election Name is already selected");
      }
    } else {
      this.toastrService.error("Election Name & Sub Election Name should be Different");
    }
  }

  onSubmitElection() {
    this.validationSubElection();
    this.submitted = true;
    let formData = this.createElectionForm.value;
    if (this.createElectionForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if (formData.ElectionName.trim() == '' || formData.ElectionName ==  null || formData.ElectionName == undefined) {
      this.toastrService.error("Election  Name can not contain space only");
      return;
    }
    else if (formData.IsSubElectionApplicable == 1 && this.addSubElectionArray?.length == 0) {
      this.toastrService.error("Please Add Sub-Election");
    }
    else {
      this.spinner.show();
      if (formData.IsSubElectionApplicable == 1) {
        this.addSubElectionArray.map((ele: any) => {
          delete ele['Id'];
          return ele;
        })
        this.subEleArray = JSON.stringify(this.addSubElectionArray);
      } else {
        this.subEleArray = "";
      }

      let id;
      formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
      let obj = id + '&ElectionName=' + escape(formData.ElectionName) + '&ElectionTypeId=' + formData.ElectionTypeId + '&IsSubElectionApplicable=' + formData.IsSubElectionApplicable +
        '&IsAsemblyBoothListApplicable=' + formData.IsAsemblyBoothListApplicable + '&CreatedBy=' + this.commonService.loggedInUserId() + '&StrSubElectionId=' + this.subEleArray;
      this.callAPIService.setHttp('get', 'Web_Insert_ElectionMaster?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.addSubElectionArray = [];
          this.toastrService.success(res.data1[0].Msg);
          this.getElectionMaster();
          this.spinner.hide();
          this.defaultProgramForm();
          this.getsubElection() 
          this.submitted = false;
          this.subElectionDivHide = false;
          this.btnText = 'Create Election';
        } else {
          //  //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  validationSubElection() {
    if (!this.subElectionDivHide || this.addSubElectionArray?.length >= 1) {
      this.createElectionForm.controls["SubElectionId"].clearValidators();
      this.createElectionForm.controls["SubElectionId"].updateValueAndValidity();
    }
    else {
      this.createElectionForm.controls["SubElectionId"].setValidators(Validators.required);
      this.createElectionForm.controls["SubElectionId"].updateValueAndValidity();
      this.createElectionForm.controls["SubElectionId"].clearValidators();
    }
  }

  getElectionType() {
    this.callAPIService.setHttp('get', 'Web_GetElectionType?', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.electionTypeArray = res.data1;
      } else {
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getsubElection() { // subElection Dropdown
    this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.electionDropArray = res.data1;
      } else {}
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElectionMaster() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj = '&ElectionTypeId=' + formData.ElectionTypeId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + formData.Search +
      '&nopage=' + this.paginationNo;
    this.callAPIService.setHttp('get', 'Web_GetElectionMaster?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionMasterArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.electionMasterArray = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElectionDetails(masterId: any) {//Edit api
    this.HighlightRow = masterId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_ElectionDetails?ElectionId=' + masterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionDetailsArray = res.data1[0];
        res.data2 == "" || res.data2 == null || res.data2 == undefined ? this.addSubElectionArray = [] : this.addSubElectionArray = res.data2;
        // this.addSubElectionArray = res.data2; // same array name add and edit record
        this.patchElectionRecord();
      } else {
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  patchElectionRecord() {
    this.btnText = 'Update Election';
    if (this.electionDetailsArray.IsSubElectionApplicable == 1) {
      this.subElecTableHide = true;
      this.subElectionDivHide = true;
      this.createElectionForm.controls.SubElectionId.reset();
    } else {
      this.subElecTableHide = false;
      this.subElectionDivHide = false;
    }
    this.createElectionForm.patchValue({
      Id: this.electionDetailsArray.Id,
      ElectionName: this.electionDetailsArray.ElectionName,
      ElectionTypeId: this.electionDetailsArray.ElectionTypeId,
      IsAsemblyBoothListApplicable: this.electionDetailsArray.IsAsemblyBoothListApplicable,
      IsSubElectionApplicable: this.electionDetailsArray.IsSubElectionApplicable,
    })
  }

  redToCreateConstituency(eleId:any){
    localStorage.setItem('ElectionId', JSON.stringify(eleId));
    this.router.navigate(['../create-constituency'], { relativeTo: this.route })
  }

  clearForm() {
    this.submitted = false;
    this.btnText = 'Create Election';
    this.defaultProgramForm();
    this.subElectionDivHide = true;
    this.subElectionDivHide = false;
    this.subElecTableHide = false;
    this.addSubElectionArray = [];
  }

  delConfirmation(index: any) { //subElection data remove
    this.index = index;
    this.deleteConfirmModel('subElectionDelFlag');
  }

  deleteConfirmModel(flag: any) {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        if (flag == 'electionMasterDelFlag') {
          this.deleteElectionMasterData();
        } else {
          this.addSubElectionArray.splice(this.index, 1);
        }
      }
    });
  }

  delConfirmEleMaster(event: any) { //Election Master data remove
    this.ElectionId = event;
    this.deleteConfirmModel('electionMasterDelFlag');
  }

  deleteElectionMasterData() {
    this.callAPIService.setHttp('get', 'Delete_Election?ElectionId=' + this.ElectionId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.defaultProgramForm();
        this.getElectionMaster();
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getElectionMaster();
  }

  clearFilter(flag: any) {
    if (flag == 'electionType') {
      this.filterForm.controls['ElectionTypeId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getElectionMaster();
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
    this.getElectionMaster();
    this.clearForm();
  }

  onKeyUpFilter() {
    this.subject.next();
    this.clearForm();
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
        this.getElectionMaster();
      }
      );
  }
}
