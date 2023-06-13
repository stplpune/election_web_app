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
  selector: 'app-party-master',
  templateUrl: './party-master.component.html',
  styleUrls: ['./party-master.component.css'],
})
export class PartyMasterComponent implements OnInit
{

  partyMasterForm!: FormGroup;
  submitted = false;
  partyMasterArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  selectedFile: any;
  ImgUrl: any;
  @ViewChild('fileInputPartyIcon') fileInputPartyIcon!: ElementRef;
  @ViewChild('focusButton') focusButton!: ElementRef;

  btnText = 'Submit';
  highlightRow: any;
  searchText = new FormControl('');
  subject: Subject<any> = new Subject();
  responseUploadFiles: any;





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

  ngOnInit(): void
  {
    this.defaultMainForm();
    this.getPartyMasterData();
    this.searchPartyData();
  }

  get f() { return this.partyMasterForm.controls };

  defaultMainForm()
  {
    this.partyMasterForm = this.fb.group({
      id: [0],
      partyName: ['', [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
      partyShortCode: ['', [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]],
      partyIconImage: [''],
    })
  }

  onSubmitForm()
  {
    this.submitted = true;
    if (this.partyMasterForm.invalid)
    {
      return;
    } else if (!this.selectedFile && !this.ImgUrl)
    {
      this.toastrService.error('Please upload Party Icon');
      return;
    } else
    {
      //(this.ImgUrl && this.selectedFile) ? this.uploadThePartyImaageAndSaveData() : this.submitFormData();
      this.submitFormData();
    }
  }

  submitFormData()
  {
    this.spinner.show();
    let formData = this.partyMasterForm.value;

    let obj = {
      'id': formData.id,
      'partyName': formData.partyName,
      'partyShortCode': formData.partyShortCode.toUpperCase(),
      'partyIconImage': this.responseUploadFiles?.filePath ? this.responseUploadFiles.filePath : this.ImgUrl,
      'sortOrder': formData.sortOrder,
    };

    let type = formData.id == 0 ? 'post' : 'put';
    let urlType = formData.id == 0 ? 'PartyMaster/SavePartyMasterDetails' : 'PartyMaster/UpdatePartyMasterDetails';
    this.callAPIService.setHttp(type, urlType, false, obj, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        // this.toastrService.success(res.responseData.msg);
        this.btnText = "Submit";
        this.getPartyMasterData();
        this.clearForm();
        this.submitted = false;
      }
      else if (res.responseData != null && res.statusCode == "409")
      {
        this.toastrService.error(res.statusMessage);
      }
      else
      {
        this.spinner.hide();
        this.toastrService.error(res.statusMessage);
      }

    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  uploadThePartyImaageAndSaveData()
  {
    const formData = new FormData();
    formData.append('files', this.selectedFile, this.selectedFile.name);
    this.callAPIService.setHttp('post', 'PartyMaster/UploadPartyMasterIcon', true, formData, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe(
      (res: any) =>
      {
        if (res.responseData != null)
        {
          this.responseUploadFiles = res.responseData;
          //this.submitFormData();
        }
      },
      (error: any) =>
      {
        this.spinner.hide();
        if (error.status == 500)
        {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      }
    );
  }

  editPartyMasterData(obj: any)
  {
    this.highlightRow = obj.id;
    this.btnText = "Update";
    this.ImgUrl = obj?.partyIconImage;
    this.partyMasterForm.patchValue({
      id: obj?.id,
      partyName: obj?.partyName,
      partyShortCode: obj?.partyShortCode,
    })
  }

  clearForm()
  {
    this.submitted = false;
    this.btnText = 'Submit';
    this.selectedFile = "";
    this.ImgUrl = '';
    this.defaultMainForm();
  }

  getPartyMasterData()
  {
    this.spinner.show();
    let obj = this.paginationNo + '&pageSize=' + this.pageSize + '&searchValue=' + this.searchText.value;
    this.callAPIService.setHttp('get', 'PartyMaster/GetPartyMaster?pageNo=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        this.spinner.hide();
        this.partyMasterArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalCount;
      } else
      {
        this.partyMasterArray = [];
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintion(pageNo: any)
  {
    this.paginationNo = pageNo;
    this.getPartyMasterData();
  }

  onKeyUpSearchData()
  {
    this.subject.next();
  }

  searchPartyData()
  {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() =>
      {
        this.searchText.value
        this.paginationNo = 1;
        this.getPartyMasterData();
      }
      );
  }

  clearFilter()
  {
    this.searchText.setValue('');
    this.getPartyMasterData();
    this.paginationNo = 1;
  }

  //.......................................  Delete Party Master Code End Here .................................//

  deleteConfirmModel(partMasterId: any)
  {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result =>
    {
      if (result == 'Yes')
      {
        this.deletePartyMaster(partMasterId);
      }
    });
  }

  deletePartyMaster(partMasterId: any)
  {
    this.callAPIService.setHttp('DELETE', 'PartyMaster/DeletePartyMasterDetails?partMasterId=' + partMasterId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == "200")
      {
        // this.toastrService.success(res.responseData.msg);
        this.toastrService.success(res.statusMessage);
        this.clearForm();
        this.getPartyMasterData();
      } else
      {
        this.toastrService.error(res.statusMessage);
      }
    }, (error: any) =>
    {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  //.......................................  Delete Party Master Code End Here .................................//

  uploadImage(event: any)
  {
    let selResult = event.target.value.split('.');
    let getImgExt: any;
    getImgExt = selResult.pop();
    const docExtLowerCase = getImgExt.toLowerCase();
    if (docExtLowerCase)
    {
      if (docExtLowerCase == "png" || docExtLowerCase == "jpg" || docExtLowerCase == "jpeg")
      {
        this.selectedFile = <File> event.target.files[0];
        if (event.target.files && event.target.files[0])
        {
          var reader = new FileReader();
          reader.onload = (event: any) =>
          {
            this.ImgUrl = event.target.result;
          }
          reader.readAsDataURL(event.target.files[0]);
          this.uploadThePartyImaageAndSaveData();
          this.focusButton.nativeElement.focus();
        }
      }
      else
      {
        this.toastrService.error("Image in only JPG,JPEG or PNG format is allowed");
      }
    }
  }

  removeImage()
  {
    this.selectedFile = "";
    this.fileInputPartyIcon.nativeElement.value = '';
    this.ImgUrl = '';
  }

}
