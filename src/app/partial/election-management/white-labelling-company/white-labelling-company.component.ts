import { string } from '@amcharts/amcharts4/core';
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
@Component({ selector: 'app-white-labelling-company', templateUrl: './white-labelling-company.component.html', styleUrls: ['./white-labelling-company.component.css'] })
export class WhiteLabellingCompanyComponent implements OnInit
{ // Initialize the Property
  modelObjectData: any;
  formFrancisize !: FormGroup;
  isSubmitted: boolean = false;
  btnText: string = 'Submit';
  imageUrl: string = '';
  selectedFile: any;
  postImageUrl: string = '';
  @ViewChild('fileInputFrancisizeIcon') fileInputFrancisizeIcon !: ElementRef;
  uploadedTrue: boolean = false;
  userId: number = 0;
  responseGetData: {
    id: number;
    fullName: string;
    mobileNo1: string;
    mobileNo2: string;
    companyEmailid: string;
    companyUrl: null;
    address: string;
    stateId: number;
    districtId: number;
    talukaId: number;
    villageId: number;
    isRural: number;
    contactPersonName: string;
    contactPersonNo: string;
    contactPersonEmailId: string;
    francisizeLogo: string;
  }[] = [];
  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  highlightRow: any;
  deletedFrancisizeId: number = 0;

  constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private spinner: NgxSpinnerService, private fb: FormBuilder, private callAPIService: CallAPIService, private toastrService: ToastrService, public commonService: CommonService) { }

  ngOnInit(): void
  {
    this.defaultForm();
    this.getFrancisizeDetails();
  }

  // Load default form
  defaultForm()
  {
    this.formFrancisize = this.fb.group({
      id: [0],
      fullName: ['', [Validators.required, Validators.pattern("^[.@&]?[a-zA-Z0-9]+[ !.@&()]?[ a-zA-Z0-9!()]+")]],
      mobileNo1: ['', [Validators.required, Validators.pattern('^[6-9]{1}[0-9]{9}$')]],
      mobileNo2: ['', [Validators.pattern('^[06789]{1}[0-9]{9,}$')]],
      companyEmailid: ['', [Validators.email]],
      companyUrl: [''],
      address: [''],
      stateId: [0],
      districtId: [0],
      talukaId: [0],
      villageId: [0],
      isRural: [0],
      contactPersonName: ['', Validators.pattern('^[^[ ]+|[ ][gm]+$')],
      contactPersonNo: ['', [Validators.pattern('^[06789]{1}[0-9]{9,}$')]],
      contactPersonEmailId: ['', [Validators.email]],
      francisizeLogo: ['']
    }, { validators: this.phoneNumberCheck });
  }

  // To save the Data
  SubmitOrUpdate()
  {
    this.isSubmitted = true;
    if (this.formFrancisize.invalid)
    {
      return;
    } else
    {
      if (this.imageUrl && this.uploadedTrue)
      {
        this.PostImage();
      } else
      {
        this.SaveOrUpdateFormData();
      }
    }
  }

  // get form controls data
  get f()
  {
    return this.formFrancisize.controls;
  }

  // Clear Form Normal Reintialize the form
  ClearForm()
  {
    this.isSubmitted = false;
    this.btnText = 'Submit';
    this.imageUrl = '';
    this.postImageUrl = '';
    this.defaultForm();
  }

  // Set File Content Data In Variable
  uploadImage(event: any)
  {
    this.selectedFile = <File> event.target.files[0];
    let extension = this.selectedFile.name.substring(this.selectedFile.name.lastIndexOf('.') + 1, this.selectedFile.name.length).toString();
    if (event.target.files && event.target.files[0] && (extension.toUpperCase() == 'JPG' || extension.toUpperCase() == 'JPEG' || extension.toUpperCase() == 'PNG'))
    {
      var reader = new FileReader();
      this.uploadedTrue = true;
      reader.onload = (event: any) =>
      {
        this.imageUrl = event.target.result;
        this.uploadedTrue = true;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
    else
      this.toastrService.error('Image in only JPG,JPEG or PNG format is allowed');
  }

  // remove Icon
  removeImage()
  {
    this.selectedFile = '';
    this.fileInputFrancisizeIcon.nativeElement.value = '';
    this.imageUrl = '';
    this.postImageUrl = '';
    this.uploadedTrue = false;
  }

  // Post Image URL
  PostImage()
  {
    this.spinner.show();
    const formData = new FormData();
    formData.append('files', this.selectedFile, this.selectedFile.name);
    this.callAPIService.setHttp('post', 'Francisize/UploadFrancisizeIcon', true, formData, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      this.spinner.hide();
      if (res.responseData != null)
      {
        this.postImageUrl = res.responseData.filePath;
        this.SaveOrUpdateFormData();
        console.log(this.postImageUrl);
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      if (error.status == 500)
      {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    });
  }

  // Post Form Data
  SaveOrUpdateFormData()
  {
    this.spinner.show();
    let formData = this.formFrancisize.value;
    this.userId = this.commonService.loggedInUserId();
    let obj = {
      id: formData.id,
      fullName: formData.fullName,
      mobileNo1: formData.mobileNo1,
      mobileNo2: formData.mobileNo2,
      companyEmailid: formData.companyEmailid,
      companyUrl: formData.companyUrl,
      address: formData.address,
      stateId: formData.stateId,
      districtId: formData.districtId,
      talukaId: formData.talukaId,
      villageId: formData.villageId,
      isRural: formData.isRural,
      contactPersonName: formData.contactPersonName,
      contactPersonNo: formData.contactPersonNo,
      contactPersonEmailId: formData.contactPersonEmailId,
      francisizeLogo: this.postImageUrl
    };
    let type = formData.id == 0 ? 'post' : 'put';
    let urlType = formData.id == 0 ? 'Francisize/AddFrancisizeDetails?userId=' + this.userId : 'Francisize/UpdateFrancisizeDetails?userId=' + this.userId;
    this.callAPIService.setHttp(type, urlType, false, obj, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == '200')
      {
        this.spinner.hide();
        if (res.responseData == 1)
        {
          if (type == 'post')
            this.toastrService.success('Company registered successfully');
          else
            this.toastrService.success('Company details updated successfully');
        }
        if (res.responseData == -1)
          this.toastrService.error('Company name is already registered');
        this.btnText = 'Submit';
        this.isSubmitted = false;
        this.ClearForm();
        this.getFrancisizeDetails();
      } else
      {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    });
  }

  // Get Francisize Details
  getFrancisizeDetails()
  {
    this.spinner.show();
    let obj = 'pageNo=' + this.pageNo + '&pageSize=' + this.pageSize;
    this.callAPIService.setHttp('get', 'Francisize/GetFrancisizeDetails?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == '200')
      {
        this.spinner.hide();
        this.responseGetData = res.responseData.responseData1;
        this.totalCount = res.responseData.responseData2.totalPages * this.pageSize;
        console.log(res);
      } else
      {
        this.responseGetData = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    });
  }

  // OnClick Pagination Page
  onClickPagintion(pageNo: any)
  {
    this.pageNo = pageNo;
    this.getFrancisizeDetails();
  }
  UpdateFrancisizeDetails(data: any)
  {
    this.formFrancisize.patchValue({
      id: data.id,
      fullName: data.fullName,
      mobileNo1: data.mobileNo1,
      mobileNo2: data.mobileNo2,
      companyEmailid: data.companyEmailid,
      companyUrl: data.companyUrl,
      address: data.address,
      stateId: 0,
      districtId: 0,
      talukaId: 0,
      villageId: 0,
      isRural: 0,
      contactPersonName: data.contactPersonName,
      contactPersonNo: data.contactPersonNo,
      contactPersonEmailId: data.contactPersonEmailId,
      francisizeLogo: ''
    });
    this.postImageUrl = data.francisizeLogo;
    this.imageUrl = data.francisizeLogo;
    this.btnText = 'Update';
  }

  // Delete Francisize Data
  delConfirmation(francisizeId: number)
  {
    this.deletedFrancisizeId = francisizeId;
    this.deleteConfirmModel();
  }

  deleteConfirmModel()
  {
    const dialogRef = this.dialog.open(DeleteComponent, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) =>
    {
      if (result == 'Yes')
      {
        this.deleteFrancisizeData();
      }
    });
  }
  deleteFrancisizeData()
  {
    this.spinner.show();
    this.userId = this.commonService.loggedInUserId();

    this.callAPIService.setHttp('delete', 'Francisize/DeleteFrancisizeDetails?francisizeId=' + this.deletedFrancisizeId + '&modifiedBy=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == '200')
      {
        this.spinner.hide();
        if (res.responseData == 1)
          this.toastrService.success('Company details deleted successfully');
        if (res.responseData == -1)
          this.toastrService.error('Company details can not be deleted');
        this.getFrancisizeDetails();
      } else
      {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }

    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    });
  }

  //Phone Number Check Validation Control
  phoneNumberCheck: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  {
    const mobileNo1 = control.get('mobileNo1');
    const mobileNo2 = control.get('mobileNo2');
    return mobileNo1 && mobileNo2 && (mobileNo1.value === mobileNo2.value && (mobileNo1.value != '' && mobileNo1.value != '')) ? { samePhoneNumber: true } : null;
  };
}
