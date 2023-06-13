import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

@Component({
  selector: 'app-cast-master',
  templateUrl: './cast-master.component.html',
  styleUrls: ['./cast-master.component.css']
})
export class CastMasterComponent implements OnInit {
  castMasterForm!: FormGroup;
  filterForm!: FormGroup;
  relisionresponseapi: any;
  religionfilterresp: any;
  editRelisionId: any;
  showrelisionTable: any;
  userData: any;
  editId: any;
  deleteId: any;
  deleteRelisionId: any;
  formData: any;
  addRelisionForm!: FormGroup;
  FormArray: any = [];
  showtableapi: any;
  submitted = false;
  submittedRel = false;
  iseditbtn = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  page: number = 1;
  count: any;
  tableSize: number = 10;
 
  constructor(
    private callAPIService: CallAPIService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.castMasterForm = new FormGroup({
      ReligionName: new FormControl('', Validators.required),
      CastName: ('', [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ()-]*$')])
    })

    this.addRelisionForm = this.fb.group({
      ReligionNameinput: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]],
    })

    this.defaultFilterForm();
    this.bindReligionName();
    this.bindCastMasterTable();
    this.showRelisionTable();
    this.filterReligion();
  }

  get f() { return this.castMasterForm.controls };
  get g() { return this.addRelisionForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ReligionNameId: [''],
    })
  }

  bindReligionName() {
    this.callAPIService.setHttp('get', 'CastMaster/GetReligionMasterListddl', false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((response: any) => {
      // console.log(response);
      
      if (response.statusCode == 200) {
        this.relisionresponseapi = response.responseData;
      } else {
        alert(response.statusMessage)
      }
    })
  }

  bindCastMasterTable() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.callAPIService.setHttp('get', 'CastMaster/GetCastMasterList?pageNo=' + this.paginationNo + '&pageSize=' + this.pageSize + '&searchValue=' + formData.ReligionNameId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((response: any) => {
      if (response.statusCode == 200) {
        this.showtableapi = response.responseData.responseData1;
        this.total = response.responseData.responseData2.totalCount;
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.toastrService.error(response.statusMessage);
      }
    })
  }

  getRelisionString() {
    let str = "";
    const formData = this.addRelisionForm.value;
    formData && formData.ReligionNameinput && (str += "?religionName=" + formData.ReligionNameinput)
    this.iseditbtn == true && (str += "&religionId=" + this.editRelisionId)
    return str;
  }

  AddRelision() {
    this.submittedRel = true;
    if (this.addRelisionForm.invalid) {
      return;
    }
    if (this.iseditbtn == false) {
        this.callAPIService.setHttp('POST', 'CastMaster/AddReligionMaster' + this.getRelisionString(), false, false, false, 'electionMicroServiceForWeb');
        this.callAPIService.getHttp().subscribe((response: any) => {
          if (response.statusCode == 200) {
            this.toastrService.success(response.statusMessage);
            this.bindCastMasterTable();
            this.showRelisionTable();
            this.bindReligionName();
            this.submittedRel = false;
            this.iseditbtn == false
            this.addRelisionForm.reset();
          } else {
            this.toastrService.error(response.statusMessage);
          }
        })
      } else {
        this.callAPIService.setHttp('PUT', 'CastMaster/UpdateRelgionMaster' + this.getRelisionString(), false, false, false, 'electionMicroServiceForWeb');
        this.callAPIService.getHttp().subscribe((response: any) => {
          if (response.statusCode == 200) {
            this.toastrService.success(response.statusMessage);
            this.showRelisionTable();
            this.iseditbtn = false;
            this.submittedRel = false;
            this.addRelisionForm.reset();
          } else {
            this.toastrService.error(response.statusMessage);
          }
        })
      }
   
  }

  filterReligion() {
    this.callAPIService.setHttp('get', 'CastMaster/GetReligionMasterFilter', false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((response: any) => {
      if (response.statusCode == 200) {
        this.religionfilterresp = response.responseData;
        this.bindCastMasterTable();
        // this.bindReligionName();
        this.onSubmitCast();
        this.submitted = false;
      } else {
        this.toastrService.error(response.statusMessage);
      }
    })

  }

  filterData() {
    this.paginationNo = 1;
    this.bindCastMasterTable();
    this.clearForm();
  }
  onClickPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.bindCastMasterTable();
    this.castMasterForm.reset();
    this.iseditbtn = false;
  }

  onClickPagintionReligion(pageNo: any) {
    this.page = pageNo;
    this.showRelisionTable();
    this.iseditbtn = false;
  }
  getQueryString() {
    let str = "";
    const formData = this.castMasterForm.value;
    // console.log(formData)
    formData && formData.ReligionName && (str += "?religionId=" + formData.ReligionName)
    formData && formData.CastName && (str += "&castName=" + formData.CastName)
    this.iseditbtn == true && (str += "&castId=" + this.editId)
    return str;
  }

  clearForm() {
    this.iseditbtn = false;
    this.submitted = false;
    this.castMasterForm.reset();
  }
  onSubmitCast() {
    this.submitted = true;
    if (this.castMasterForm.valid) {
      const reqVar = this.iseditbtn == false ? 'POST' : 'PUT'
      const urlName = this.iseditbtn == false ? 'CastMaster/AddCastMaster' : "CastMaster/UpdateCastMaster"
      if (this.iseditbtn == false) {
        this.callAPIService.setHttp(reqVar, urlName + this.getQueryString(), false, false, false, 'electionMicroServiceForWeb');
        this.callAPIService.getHttp().subscribe((response: any) => {
          if (response.statusCode == 200) {
            this.toastrService.success(response.statusMessage);
            this.bindCastMasterTable();
            this.filterReligion();
            this.submitted = false;
            this.iseditbtn == false
            this.castMasterForm.reset();
          } else {
            this.toastrService.error(response.statusMessage);
          }
        })
      } else {
        this.callAPIService.setHttp(reqVar, urlName + this.getQueryString(), false, false, false, 'electionMicroServiceForWeb');
        this.callAPIService.getHttp().subscribe((response: any) => {
          if (response.statusCode == 200) {
            this.toastrService.success(response.statusMessage);
            this.bindCastMasterTable();
            this.submitted = false;
            this.iseditbtn = false
            this.castMasterForm.reset();
          } else {
            this.toastrService.error(response.statusMessage);
          }
        })
      }
    } else {

    }
  }

  showRelisionTable() {
    this.callAPIService.setHttp('get', 'CastMaster/GetReligionMasterListTable?pageNo=' + this.page + '&pageSize=' + this.tableSize, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((response: any) => {
      // console.log(response)
      if (response.statusCode = 200) {
        this.showrelisionTable = response.responseData.responseData1;
        this.count = response.responseData.responseData2.totalCount;
      } else {
      }
    })

  }

  editCastMasterData(row: any) {
    this.editId = row.id
    this.iseditbtn = true;
    this.castMasterForm.patchValue({
      CastName: row.castName,
      ReligionName: row.religionId
    })
    this.spinner.hide();
  }

  editRelisionData(row: any) {
    this.editRelisionId = row.id
    this.iseditbtn = true;
    this.addRelisionForm.patchValue({
      ReligionNameinput: row.religionName
    })
  }

  clearFilter(flag: any) {
    if (flag == 'religionName') {
      this.filterForm.controls['ReligionNameId'].setValue('');
    }
    this.paginationNo = 1;
    this.bindCastMasterTable();
    this.clearForm();
  }

  deleteConfirmModel(flag: any, id: any) {
    const dialogRef = this.dialog.open(DeleteComponent,{
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        if (flag == 'castId') {
          this.DeleteCastMasterData();
        } else {
          this.DeleteRelisionData();
        }
      }
    });
  }

  delConfirmEleMaster(event: any, relision: any) { //Election Master data remove
    this.deleteId = event.id
    this.deleteRelisionId = event.id;
    this.deleteConfirmModel(relision, this.deleteRelisionId);
  }

  DeleteCastMasterData() {
    this.callAPIService.setHttp('DELETE', 'CastMaster/DeleteCastMaster?castId=' + this.deleteId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.statusCode == 200) {
        this.toastrService.success('Data deleted Successfully..');
        this.bindCastMasterTable();
      } else {
        this.toastrService.error(res.statusMessage);
      }
    })
  }
  DeleteRelisionData() {
    this.callAPIService.setHttp('DELETE', 'CastMaster/DeleteReligionMaster?religionId=' + this.deleteRelisionId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.statusCode == 200) {
        this.toastrService.success('Data deleted Successfully..');
        this.showRelisionTable()
        this.bindCastMasterTable();
      } else {
        this.toastrService.error(res.statusMessage);
      }
    })
  }

  resetModel() {
    this.iseditbtn = false;
    this.submittedRel = false;
    this.addRelisionForm.reset();
  }
}
