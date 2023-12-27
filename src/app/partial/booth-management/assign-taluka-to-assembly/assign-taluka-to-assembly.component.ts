import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { log } from 'console';
@Component({
  selector: 'app-assign-taluka-to-assembly',
  templateUrl: './assign-taluka-to-assembly.component.html',
  styleUrls: ['./assign-taluka-to-assembly.component.css']
})
export class AssignTalukaToAssemblyComponent implements OnInit {
  assignTalukaForm!: FormGroup;
  districtArray: any;
  talukaArray = new Array();
  paginationNo: number = 1;
  tableData = new Array();
  filterDistrictId = new FormControl('');
  totalCount: number = 0;
  pageSize: number = 10;
  assemblyNamesArray = new Array();
  editFlag: boolean = false;
  editObj: any;
  searchTalukaList = '';
  talukaMergeArray = new Array();
  checkedTalukas = new Array();
  userId: number = this.commonService.loggedInUserId();

  get f() { return this.assignTalukaForm.controls }
  @ViewChild('closeModal') closeModal!: ElementRef;

  constructor(private fb: FormBuilder,
    private apiService: CallAPIService,
    private router: Router,
    private activatedRout: ActivatedRoute,
    private commonService: CommonService,
    public dialog: MatDialog,
    private tosterService: ToastrService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getFormControl();
    this.getDistrict();
    this.getAssemblyTable();
  }

  getFormControl() {
    this.assignTalukaForm = this.fb.group({
      assemblyId: ['', [Validators.required]],
      stateId: [1],
      districtId: ['', [Validators.required]],
      talukaId: ['', [Validators.required]]
    })
  }

  getDistrict() {
    this.apiService.setHttp('get', 'Filter/GetAllDistricts?UserId=' + this.commonService.loggedInUserId() + '&StateId=' + 1 + '&DivisionId=' + 0, false, false, false, 'electionMicroServiceForWeb');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.districtArray = res.responseData;
      } else {
        this.districtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getTaluka() {
    this.talukaArray = [];
    this.checkedTalukas = [];
    this.apiService.setHttp('get', `Filter/GetAllTaluka?DistrictId=${this.assignTalukaForm.getRawValue().districtId}&UserId=${this.userId}`, false, false, false, 'electionMicroServiceForWeb');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.talukaArray = res.responseData;
        this.talukaMergeArray = res.responseData;
        let checkedTalukas = this.talukaMergeArray.filter(ele => this.editObj.talukadetailsList.some((res: any) => res.talukaId === ele.talukaId ? ele.isChecked = true : ele.isChecked = false));
        this.checkedTalukas = checkedTalukas;
      } else {
        this.talukaArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } });
  }

  getAssemblyNames(aseblyid?: any) {
    this.apiService.setHttp('GET', 'api/BoothDetailsAsync/GetDistrictwiseAssembly?DistrictId=' + this.assignTalukaForm.getRawValue().districtId, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.assemblyNamesArray = res.responseData;
        aseblyid ? this.f['assemblyId'].setValue(aseblyid) : '';
      } else {
        this.assemblyNamesArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getAssemblyTable() {
    let strUrl = `api/AssignTalukatoAssembly/GetAll?${this.filterDistrictId.value ? 'DistrictId=' + this.filterDistrictId.value : ''}&pageNo=${this.paginationNo}&pageSize=10`;
    this.apiService.setHttp('get', strUrl, false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.tableData = res.responseData, this.totalCount = res.responseData1.totalCount) : this.tableData = [];
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getAssemblyTable();
  }

  getAssemblyDetails(data: any) {
    this.searchTalukaList = '';
    data?.talukadetailsList?.length ? this.editFlag = true : this.editFlag = false;
    this.editObj = JSON.parse(JSON.stringify(data))
    this.assignTalukaForm.patchValue({
      districtId: data.districtId,
    })
    this.getAssemblyNames(data.id);
    this.getTaluka();
  }

  onCheckTaluka(event: any, talId: any) {
    if (event.target.checked == true) {
      let obj = { talukaId: talId }
      this.checkedTalukas.push(obj);
    } else {
      let index = this.checkedTalukas.findIndex((ele: any) => ele.talukaId == talId);
      this.checkedTalukas.splice(index, 1);
    }
  }

  onSubmit() {
    let saveObj = []
    let formVal = this.assignTalukaForm.value;
    for (let i = 0; i < this.checkedTalukas.length; i++) {
      let obj = {
        "id": 0,
        "assemblyId": formVal.assemblyId,
        "districtId": formVal.districtId,
        "stateId": 1,
        "talukaId": this.checkedTalukas[i].talukaId,
        "createdBy": this.userId
      }
      saveObj.push(obj);
    }
    this.spinner.show();
    if (!this.checkedTalukas.length) {
      this.tosterService.error("Please select taluka");
      this.spinner.hide();
      return;
    }

    let apiType = this.editFlag == true ? 'PUT' : 'POST';
    let url = this.editFlag == true ? 'api/AssignTalukatoAssembly/Update' : 'api/AssignTalukatoAssembly/Create'
    this.apiService.setHttp(apiType, url, false, saveObj, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe((res: any) => {
      res.statusCode == 200 ? (this.tosterService.success(res.statusMessage), this.closeModal.nativeElement.click(), this.getAssemblyTable(), this.checkedTalukas = []) : this.tosterService.error(res.statusMessage);
      this.editFlag == false;
      this.spinner.hide();
    })
  }
}
