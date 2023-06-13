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
  selector: 'app-restricted-mobile',
  templateUrl: './restricted-mobile.component.html',
  styleUrls: ['./restricted-mobile.component.css']
})
export class RestrictedMobileComponent implements OnInit {

  restrictedMobileForm!: FormGroup;
  submitted: boolean = false;
  btnText = 'Submit';
  clientAlertNumberlistArray: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  HighlightRow: any;
  Search = new FormControl('');
  subject: Subject<any> = new Subject();
  searchFilter = "";
  deleteObj: any;

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
    this.defaultRestrictedMobileForm();
    this.getClientAlertNumberlist();
    this.searchFilters('false');
  }

  defaultRestrictedMobileForm() {
    this.restrictedMobileForm = this.fb.group({
      Id: [0],
      CallerName: ['', [Validators.required,Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+"\'\/\\]\\]{}][a-zA-Z\\s]+$')]],
      MobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
    })
  }

  get f() { return this.restrictedMobileForm.controls };

  clearForm() {
    this.submitted = false;
    this.btnText = 'Submit'
    this.defaultRestrictedMobileForm();
  }

  clearTopFilter(flag: any) {
    if (flag == 'search') {
      this.Search.setValue('');
      this.clearForm();
    }
    this.getClientAlertNumberlist();
  }

    // .............. Get Client Alert Numberlist Api.....................//

    getClientAlertNumberlist() {
      this.spinner.show();
      let obj = '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&nopage=' + this.paginationNo + '&Search=' + this.Search.value;
      this.callAPIService.setHttp('get', 'Web_Get_Client_Alert_Numberlist?CreatedBy=' + this.commonService.loggedInUserId() + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.spinner.hide();
          this.clientAlertNumberlistArray = res.data1;
          this.total = res.data2[0].TotalCount;
        } else {
          this.spinner.hide();
          this.clientAlertNumberlistArray = [];
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
      if (this.restrictedMobileForm.invalid) {
        this.spinner.hide();
        return;
      }
      else {
        let formData = this.restrictedMobileForm.value;
        let id;
        formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
        let obj = id + '&CallerName=' + formData.CallerName + '&MobileNo=' + formData.MobileNo 
          + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&CreatedBy=' + this.commonService.loggedInUserId();
        this.callAPIService.setHttp('get', 'Web_Insert_tblagentcallloggeralertcontacts?Id=' + obj, false, false, false, 'electionServiceForWeb');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.data == 0) {
            this.toastrService.success(res.data1[0].Msg);
            this.spinner.hide();
            this.submitted = false;
            this.btnText = 'Submit';
            this.getClientAlertNumberlist();
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
  
    patchClientAlertNumberlistData(obj: any) {
      this.HighlightRow = obj.SrNo;
      this.btnText = 'Update';
      this.restrictedMobileForm.patchValue({
        Id: obj.Id,
        CallerName: obj.ContactName,
        MobileNo: obj.MobileNo,
      })
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
          this.getClientAlertNumberlist();
        }
        );
    }

    onClickPagintion(pageNo: number) {
      this.paginationNo = pageNo;
      this.getClientAlertNumberlist();
    }

    delConfirmation(obj: any) { 
      this.deleteObj = obj;
      this.deleteConfirmModel();
    }
  
    deleteConfirmModel() {
      const dialogRef = this.dialog.open(DeleteComponent);
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'Yes') {
          this.deleteClientAlertNumberList();
        }
      });
    }
  
    deleteClientAlertNumberList() {
      this.callAPIService.setHttp('get', 'Web_Delete_tblagentcallloggeralertcontacts?Id=' + this.deleteObj.Id
        + '&ClientId=' + this.commonService.getlocalStorageData().ClientId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.getClientAlertNumberlist();
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

    acceptedOnlyNumbers(event: any) {
      const pattern = /[0-9]/;
      let inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }
    }
  

}
