import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-create-regional-leader',
  templateUrl: './create-regional-leader.component.html',
  styleUrls: ['./create-regional-leader.component.css']
})
export class CreateRegionalLeaderComponent implements OnInit {

  addClientForm!: FormGroup;
  submitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Add Leader';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  resultVillage: any;
  allDistrict: any;
  getTalkaByDistrict: any;
  villageDisabled!: boolean;
  editFlag: boolean = true;
  clientId: any;
  GenderArray = [{ id: 0, name: "Male" }, { id: 1, name: "Female" },{ id: 2, name: "Other" }];
  clientDataArray: any;
  modelObjectData: any;
  globalEditData: any;
  webBannerFlag: any;
  appBannerFlag: any;
  francisizeArray: any;
  franchiseCheckdDiv:boolean = false;
  franchiseValue = new FormControl('');

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
    this.defaultAddClientForm();
    this.defaultFilterForm();
    this.getDistrict();
    this.searchFilters('false');
    this.getClientData();
    this.getFrancisize();
  }

  defaultAddClientForm() {
    this.addClientForm = this.fb.group({
      Id: [0],
      Name: [''],
      FName: ['',Validators.compose([Validators.required ,Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')])],
      MName: ['',Validators.pattern(/^[A-Za-z]+$/)],
      LName: ['',Validators.compose([Validators.required ,Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')])],
      Address: ['', [Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      Gender: ['', Validators.required],
      // MobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      MobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      ContactNo2: ['', [Validators.pattern('[0-9]\\d{9,10}')]],
      EmailId: ['', [Validators.required, Validators.email]],
      // emailID: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      DistrictId: ['', Validators.required],
      TalukaId: ['', Validators.required],
      VillageId: ['', Validators.required],

      IsChangeAppBanner: [''],
      AppBanner: [''],
      IsChangeWebBanner: [''],
      WebBanner: [''],
      FranchiseId:['']
    })
  }

  onBlur(){
    let formData = this.addClientForm.value;
    let subject:any = /^0+$/; 
    if(formData.ContactNo2.match(subject)){
      this.addClientForm.controls['ContactNo2'].setValue('');
    }else if(formData?.ContactNo2.charAt(0) == 0 && formData.ContactNo2?.length == 10){
      this.toastrService.error('Enter a valid 11-digit Contact No.');
      this.addClientForm.controls['ContactNo2'].setValue('');
    }else if(formData?.ContactNo2.charAt(0) != 0 && formData?.ContactNo2.charAt(0) < 6){
      this.toastrService.error('Enter a valid Contact No.');
      this.addClientForm.controls['ContactNo2'].setValue('');
    }else if(formData?.ContactNo2.charAt(0) > 5 && formData.ContactNo2?.length == 11){
      this.toastrService.error('Enter a valid 10-digit Contact No.');
      this.addClientForm.controls['ContactNo2'].setValue('');
    }
  }

  get f() { return this.addClientForm.controls };

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      DistrictId: [0],
      Search: [''],
    })
  }

                     // Accept Only Integer Value Not Charector Accept

  Vali_AcceptOnlyNumber(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
        event.preventDefault();
    }
}

  getDistrict() {
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        if (this.btnText == 'Update Leader') {
          this.getTaluka(this.addClientForm.value.DistrictId,false);
        }
        this.allDistrict = res.data1;
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getTaluka(districtId: any,flag:any) {
    if(districtId == ''){return}
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.getTalkaByDistrict = res.data1;
        if(flag == 'select'){
          this.addClientForm.controls['VillageId'].setValue('');
        }
        if (this.btnText == 'Update Leader' && flag != 'select') {
           this.addClientForm.controls['TalukaId'].setValue(this.globalEditData.TalukaId);
          this.getVillage(this.globalEditData.TalukaId)
        }
        
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getVillage(talukaID: any) {
    this.villageDisabled = false;
    this.callAPIService.setHttp('get', 'Web_GetVillage_1_0?talukaid=' + talukaID, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resultVillage = res.data1;
        if (this.btnText == 'Update Leader') {
          this.addClientForm.controls['VillageId'].setValue(this.globalEditData.VillageId);
        }
      } else {}
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getFrancisize() { 
    this.callAPIService.setHttp('get', 'Web_Client_francisize_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.francisizeArray = res.data1;
      } else { this.francisizeArray = [] ;}
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  districtClear(text: any) {
    if (text == 'district') {
      this.addClientForm.controls['DistrictId'].setValue(''), this.addClientForm.controls['TalukaId'].setValue(''), this.addClientForm.controls['VillageId'].setValue('');
      this.villageDisabled = true;
    } else if (text == 'taluka') {
      this.addClientForm.controls['TalukaId'].setValue(''), this.addClientForm.controls['VillageId'].setValue('');

    } else if (text == 'village') {
      this.addClientForm.controls['VillageId'].setValue('');
    }
  }

  getClientData() {//get TableRecord
    this.spinner.show();
    this.clearForm();
    let formData = this.filterForm.value;
    let obj = '&DistrictId=' + formData.DistrictId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + formData.Search +
      '&nopage=' + this.paginationNo;
    this.callAPIService.setHttp('get', 'Web_get_Client?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientDataArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.clientDataArray = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onSubmitAddClient() {
    this.submitted = true;
    if (this.addClientForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if(this.addClientForm.value.MobileNo == this.addClientForm.value.ContactNo2){ 
      this.spinner.hide();
      this.toastrService.error("Please enter different Number");
    }
    else {
      this.spinner.show();
      let data = this.addClientForm.value;
      data.Name = data.FName + " " + data.MName + " " + data.LName; 
      data.FranchiseId = this.commonService.checkDataType(data.FranchiseId) == true ? data.FranchiseId: 0 ;

      data.WebBanner = this.commonService.checkDataType(this.selectedFileWebBanner) == true ? this.selectedFileWebBanner: '';
      data.AppBanner = this.commonService.checkDataType(this.selectedFileAppBanner) == true ? this.selectedFileAppBanner: '';
      data.IsChangeWebBanner = (this.webBannerFlag == 2 || this.commonService.checkDataType(this.selectedFileWebBanner) == true) ? 1 : 0 ;
      data.IsChangeAppBanner = (this.appBannerFlag == 2 || this.commonService.checkDataType(this.selectedFileAppBanner) == true) ? 1 : 0 ;
    
      let fromData: any = new FormData();
      Object.keys(data).forEach((cr: any, ind: any) => {
        let value = Object.values(data)[ind] != null ? Object.values(data)[ind] : 0;
        fromData.append(cr, value)
      })

      this.callAPIService.setHttp('Post', 'Web_Insert_Client_1_0', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0 && res.data1[0].ClientId != 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.spinner.hide();
          this.ImgUrlWebBanner = ''; this.ImgUrlAppBanner = '';
          this.franchiseValue.setValue('');
          this.defaultAddClientForm();
          this.defaultFilterForm();
          this.getClientData();
          this.sendDetailsToclient(res.data1[0].ClientId);
          this.submitted = false;
          this.btnText = 'Add Leader';
          this.webBannerFlag = ''; this.appBannerFlag = '';
          this.franchiseCheckdDiv = false;
        } else {
          this.spinner.hide();
          this.toastrService.error(res.data1[0].Msg);
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  sendDetailsToclient(ClientId:any){
    this.callAPIService.setHttp('get', 'Web_Send_Client_Login_Credential?ClientId=' + ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        // this.toastrService.success(res.data1[0].Msg);
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getClientDetails(ClientId: any) {//Edit Api
    this.callAPIService.setHttp('get', 'Web_GetClientDetails?Id=' + ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        let ClientDetailsArray = res.data1[0];
        this.editPatchValue(ClientDetailsArray);
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editPatchValue(objData: any) {
    this.globalEditData = objData;   
    this.btnText = 'Update Leader';
    this.HighlightRow = objData.Id;
    this.ImgUrlWebBanner = objData.WebBannerImage;
    this.ImgUrlAppBanner = objData.AppBannerImage;

    this.addClientForm.patchValue({
      Id: objData.Id,
      FName: objData.FName,
      MName: objData.MName,
      LName: objData.LName,
      Address: objData.Address,
      EmailId: objData.EmailId,
      Gender: objData.Gender,
      MobileNo: objData.MobileNo,
      ContactNo2: objData.ContactNo,
      DistrictId: objData.DistrictId,
      FranchiseId : this.commonService.checkDataType(objData.FranchiseId) == true ? objData.FranchiseId : '',
      // TalukaId: objData.TalukaId,
      // VillageId : objData.VillageId,
    });
    this.getDistrict();
    this.franchiseCheckedData('edit',objData?.FranchiseId);
    objData?.FranchiseId > 0 ? this.franchiseCheckdDiv = true : (this.franchiseValue.setValue(''),this.franchiseCheckdDiv = false);

    this.addClientForm.controls['WebBanner'].setValue('');
    this.addClientForm.controls['AppBanner'].setValue('');
  }

  clearForm() {
    this.submitted = false;
    this.btnText = 'Add Leader';
    this.selectedFileWebBanner = ""; this.ImgUrlWebBanner = '';
    this.selectedFileAppBanner = ""; this.ImgUrlAppBanner = '';
    this.franchiseValue.setValue('');
    this.defaultAddClientForm();
    this.franchiseCheckdDiv = false;
  }

  delConfirmAssBothEle(clientId: any) {
    this.clientId = clientId;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteClientData();
      }
    });
  }

  deleteClientData() {
    this.callAPIService.setHttp('get', 'Web_DeleteClient?ClientId=' + this.clientId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getClientData();
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getClientData();
  }

  clearFilter(flag: any) {
    if (flag == 'DistrictFlag') {
      this.filterForm.controls['DistrictId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getClientData();
    this.clearForm();
  }

  filterData() {
    this.paginationNo = 1;
    this.getClientData();
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
        this.getClientData();
        this.clearForm();
      }
      );
  }

  selectedFileWebBanner:any;
  ImgUrlWebBanner:any;
  @ViewChild('fileInputwebBanner') fileInputwebBanner!: ElementRef;
  selectedFileAppBanner:any;
  ImgUrlAppBanner:any;
  @ViewChild('fileInputappBanner') fileInputappBanner!: ElementRef;

  uploadImage(event: any,flag:any) {
    let selResult = event.target.value.split('.');
    let getImgExt:any;
    getImgExt = selResult.pop();
    const docExtLowerCase = getImgExt.toLowerCase();
    if (docExtLowerCase == "png" || docExtLowerCase == "jpg" || docExtLowerCase == "jpeg") {
      flag == 'webBanner' ? this.selectedFileWebBanner = <File>event.target.files[0] : this.selectedFileAppBanner = <File>event.target.files[0];
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          flag == 'webBanner' ? this.ImgUrlWebBanner = event.target.result : this.ImgUrlAppBanner = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    }
    else {
      this.toastrService.error("Image in only JPG,JPEG or PNG format is allowed");
      flag == 'webBanner' ? this.addClientForm.controls['WebBanner'].setValue('') : this.addClientForm.controls['AppBanner'].setValue('');
    }
  }

  removeImage(flag:any) {
    if(flag == 'webBanner'){
    this.selectedFileWebBanner = "";
    this.fileInputwebBanner.nativeElement.value = '';
    this.webBannerFlag = 2 ;
    this.ImgUrlWebBanner = '';
    }else{
      this.selectedFileAppBanner = "";
      this.fileInputappBanner.nativeElement.value = '';
      this.appBannerFlag = 2 ;
      this.ImgUrlAppBanner = '';
    }
  }

  franchiseCheckedData(flag:any,value?:any){

    flag == 'add' ? (this.franchiseValue.value == true ? this.franchiseCheckdDiv = true : this.franchiseCheckdDiv = false) : '';
    
    if (this.franchiseValue.value == true || value > 0) {
      this.addClientForm.controls["FranchiseId"].setValidators([Validators.required]);
      this.addClientForm.controls["FranchiseId"].updateValueAndValidity();
    } else {
      this.addClientForm.controls['FranchiseId'].setValue('');
      this.addClientForm.controls['FranchiseId'].clearValidators();
      this.addClientForm.controls['FranchiseId'].updateValueAndValidity();
    }
  }

}
