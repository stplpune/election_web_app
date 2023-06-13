import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-local-area',
  templateUrl: './add-local-area.component.html',
  styleUrls: ['./add-local-area.component.css']
})
export class AddLocalAreaComponent implements OnInit {

  filterForm!: FormGroup;
  clientNameArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  localAreawithVillageArray: any;


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
    this.defaultMainForm();
    this.defaultFilterForm();
    this.getClientName();
    this.searchLocalArea();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      village: [0],
      searchText: [''],
    })
  }

  getClientName() {
    this.nullishFilterForm();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.clientNameArray = res.responseData;
        // this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }),this.dataNotFound = true, this.getElectionName()) : this.getLocalAreawithVillageList();
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.dataNotFound = true, this.getElectionName(), this.getLocalAreawithVillageList()) : '';
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
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.dataNotFound = true, this.getConstituencyName()) :  this.clientNameArray.length != 1 ? this.getLocalAreawithVillageList() : '';
        // this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.dataNotFound = true,this.getConstituencyName(),this.getLocalAreawithVillageList()) : '';
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
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData(), this.getLocalAreawithVillageList()) : '';
        // this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData(),this.getLocalAreawithVillageList()) : '';
      } else {
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData() {
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


  getLocalAreawithVillageList() {  // Main Api For Table
    this.nullishFilterForm();
    this.spinner.show();
    let obj = this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village + '&Search=' + this.filterForm.value.searchText?.trim() + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize
    this.callAPIService.setHttp('get', 'ClientMasterWebApi/localAreaDetails/GetLocalAreawithVillageList?clientId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.localAreawithVillageArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
      } else {
        this.spinner.hide();
        this.localAreawithVillageArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any,clearFlag?:any) { 
    this.paginationNo = 1;
    if (flag == 'clientId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['searchText'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      clearFlag == 'eleClrFlag' ? this.getLocalAreawithVillageList() : '';
      this.dataNotFound = true;
    } else if (flag == 'constituencyId') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.getLocalAreawithVillageList();
      this.dataNotFound = true;
    } else if (flag == 'search') {
      this.dataNotFound = true;
      this.filterForm.controls['searchText'].setValue('');
      this.getLocalAreawithVillageList();
    }
  }

  nullishFilterForm() { //Check all value null || undefind || empty 
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.searchText ?? this.filterForm.controls['searchText'].setValue('');
  }


  localAreaForm!: FormGroup;
  submitted = false;
  btnText = 'Add Area';
  subject: Subject<any> = new Subject();
  villageId: any;
  @ViewChild('addLocalAreaModel') addLocalAreaModel: any;

  get f() { return this.localAreaForm.controls };

  defaultMainForm() {
    this.localAreaForm = this.fb.group({
      id: [0],
      areaName: ['', Validators.required],
    })
  }

  onSubmitForm() {
    this.submitted = true;
    if (this.localAreaForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      this.spinner.show();
      let formData = this.localAreaForm.value;
      let obj = {
        "id": formData.id,
        "clientId": parseInt(this.filterForm.value.ClientId),
        "localAreaName": formData.areaName,
        "isDeleted": false,
        "createdBy": this.commonService.loggedInUserId(),
        "modifiedBy": this.commonService.loggedInUserId(),
        "villageId": this.villageId
      }

      let urlName = formData.id == 0 ? 'ClientMasterWebApi/localAreaDetails/save-localArea-Details' : 'ClientMasterWebApi/localAreaDetails/update-localArea-Details'

      this.callAPIService.setHttp(formData.id == 0 ? 'POST' : 'PUT', urlName, false, obj, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.getLocalAreawithVillageList();
          this.addLocalAreaModel.nativeElement.click();
          this.clearForm();
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

  clearForm() {
    this.defaultMainForm();
    this.btnText = "Add Area";
    this.submitted = false;
  }

  editLocalAreaData(obj: any, villageId: any) {
    this.villageId = villageId;
    this.btnText = "Update Area";
    this.localAreaForm.patchValue({
      id: obj?.localAreaId,
      areaName: obj?.localAreaName,
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getLocalAreawithVillageList();
    this.clearForm();
  }

  onKeyUpSearchData() {
    this.subject.next();
  }

  searchLocalArea() {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.filterForm.value.searchText
        this.paginationNo = 1;
        this.getLocalAreawithVillageList();
      }
      );
  }

  //.......................................  Delete Supervisor Code End Here .................................//

  //   deleteConfirmModel(obj: any,) {
  //     const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
  //     dialogRef.afterClosed().subscribe(result => {
  //       if (result == 'Yes') {
  //         this.deleteLocalArea(obj);
  //       }
  //     });
  //   }

  // deleteLocalArea(data: any) {
  //   let obj = {
  //     "id": data.id,
  //     "clientId": parseInt(this.filterForm.value.ClientId),
  //     "localAreaName": data.localAreaName,
  //     "isDeleted": true,
  //     "createdBy": this.commonService.loggedInUserId(),
  //     "modifiedBy": this.commonService.loggedInUserId(),
  //     "villageId": this.villageId
  //   }

  //   this.callAPIService.setHttp('DELETE', 'ClientMasterWebApi/localAreaDetails/delete-localArea-Details', false, obj, false, 'electionMicroSerApp');
  //   this.callAPIService.getHttp().subscribe((res: any) => {
  //     if (res.statusCode == "200") {  
  //       this.toastrService.success(res.statusMessage);
  //       this.clearForm();
  //       this.getLocalAreawithVillageList();
  //     } else {
  //     }
  //   }, (error: any) => {
  //     this.router.navigate(['../500'], { relativeTo: this.route });
  //   })
  // }

  //.......................................  Delete Supervisor Code End Here .................................//

}
