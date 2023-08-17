import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { debug, log } from 'console';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { AddDesignationComponent } from '../add-designation/add-designation.component';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.css']
})
export class AddMemberComponent implements OnInit, OnDestroy {
  memberValue: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private callAPIService: CallAPIService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AddMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      let getsessionStorageData: any = sessionStorage.getItem('memberValue');
      this.memberValue = JSON.parse(getsessionStorageData);
    }

  editProfileForm!: FormGroup;
  categoryArray = [{ id: 1, name: "Rural" }, { id: 0, name: "Urban" }];
  GenderArray = [{ id: 1, name: "Male" }, { id: 0, name: "Female" }, { id: 2, name: "Other" }];
  selGender: any;
  getImgExt: any;
  imgName: any;
  ImgUrl: any;
  isShowMenu: boolean = false;
  @Output() onShowMenu: EventEmitter<any> = new EventEmitter();
  editFlag: boolean = false;
  userName = this.commonService.loggedInUserName();
  submitted = false;
  resultVillageOrCity: any;
  allDistrict: any;
  getTalkaByDistrict: any;
  profilePhotoChange: any;
  @ViewChild('myInput') myInputVariable!: ElementRef;
  selectedFile: any;
  resProfileData: any;
  showingUserName: any;
  showingMobileNo: any;
  villageCityLabel = "Village";
  setVillOrCityId: any;
  setVillOrcityName: any;
  globalVillageOrCityId: any;
  disabledEditForm: boolean = true;
  defaultModalHIde: boolean = false;
  defaultModalHIdeCP: boolean = false;
  changePasswordForm: any;
  submittedChangePassword = false;
  show_button: Boolean = false;
  show_eye: Boolean = false;
  show_button1: Boolean = false;
  show_eye1: Boolean = false;
  show_button2: Boolean = false;
  show_eye2: Boolean = false;
  villOrcityDisabled: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  villageDisabled: boolean = true;
  filterForm!: FormGroup;
  paginationNo: number = 1;
  pageSize: number = 10;
  defaultCloseBtn: boolean = false;
  resAllUsers: any;
  total: any;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  profileFlag = "Add";
  highlightedRow: any;
  getCommiteeName: any;
  allDesignatedMembers: any;
  maxDate: any = new Date();
  resCommittees: any;
  getConstituencyResult: any;
  memberID!: number;
  editMemObj: any;
  reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
  disableCommitee:boolean = false;

  ngOnInit(): void {
    this.data ? this.disableCommitee = true : this.disableCommitee = false ;
    // this.router.url.includes('mobile-login')
    this.profileFlag = this.data.formStatus;
    this.memberID = this.data.Id;
    this.getCommiteeName = this.commonService.getCommiteeInfo();
    this.myProfileForm();
    this.getCommitteeName();
    this.getConstituencylist();
    this.getDistrict();
    this.profileFlag == 'Update' && this.memberID != 0 ? this.getProfileData(this.memberID) : '';
  }

  myProfileForm() {
    this.editProfileForm = this.fb.group({
      Name: [''],
      UserId: [],
      StateId: [1],
      DistrictId: [0],
      TalukaId: [''],
      // MobileNo: ['' || this.memberValue, [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      MobileNo: [''|| this.memberValue, [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      VillageId: [''],
      //FName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
       FName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      // MName: ['', [Validators.pattern(/^\S*$/)]],
      MName: ['',Validators.compose([Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      // LName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      LName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      IsRural: [1],
      Gender: [''],
      EmailId: ['', [Validators.email, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9._-]+[a-zA-Z0-9]+@([a-zA-Z.]+[.])+[a-zA-Z]{2,5}$')]],
      CreatedBy: [this.commonService.loggedInUserId()],
      DesignationId: ['', Validators.required],
      PostfromDate: [new Date(), Validators.required],
      BodyId: ['', Validators.required],
      UserPostBodyId: [0],
      ConstituencyNo: [''],
      IsMultiple: [0],
      InstagramLink: ['', [Validators.pattern(this.reg)]],
      TwitterLink: ['' , [Validators.pattern(this.reg)]],
      FacebookLink: ['' , [Validators.pattern(this.reg)]],
      Address: [''],
    })
  }

  profileFormPathValue(data: any) {
    this.editFlag = true;
    this.editMemObj = data;
    this.profileFlag = 'Update';
    this.highlightedRow = data.Id
    this.selGender = data.Gender;
    data.IsRural == 1 ? (this.setVillOrcityName = "VillageName", this.setVillOrCityId = "VillageId", this.villageCityLabel = "Village") : (this.setVillOrcityName = "CityName", this.setVillOrCityId = "Id", this.villageCityLabel = "City");
    this.getCommitteeName();
    // this.getConstituencylist();
    this.ImgUrl = data.ProfilePhoto;
    this.editProfileForm.patchValue({
      UserId: data.Id,
      FName: data.FName,
      MName: data.MName,
      MobileNo: data.MobileNo,
      LName: data.LName,
      IsRural: data.IsRural,
      Gender: data.Gender,
      EmailId: data.EmailId,
      Address: data.Address,
      DistrictId: data.DistrictId,
      TalukaId: data.TalukaId,
      VillageId: data.VillageId,
      FacebookLink: data.FacebookLink,
      InstagramLink: data.InstagramLink,
      TwitterLink: data.TwitterLink,
      // ConstituencyNo:data.ConstituencyNo
    });
  }

  clearForm() {
    this.submitted = false;
    this.profileFlag = 'Add';
    this.paginationNo = 1;
    this.myProfileForm();
    this.removePhoto();
  }

  getDistrict() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
         this.spinner.hide();
        this.allDistrict = res.data1;
        if (this.editFlag && this.editProfileForm.value.IsRural == 0) {
          this.getVillageOrCity(this.editProfileForm.value.DistrictId, 'City')
        } else if (this.editFlag && this.editProfileForm.value.IsRural == 1) {
          this.getTaluka(this.editProfileForm.value.DistrictId, false);
        }
      } else {
        this.spinner.hide();
        if (res.data == 1) {
          this.toastrService.error("Data is not available 2");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  getTaluka(districtId: any, flag: any) {
    if (districtId == "") { return };
    if (this.editProfileForm.value.IsRural == 0) {
      this.getVillageOrCity(this.editProfileForm.value.DistrictId, 'City')
      return
    }
    //this.spinner.show();
    (districtId == null || districtId == "") ? districtId = 0 : districtId = districtId;
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.spinner.hide();
        this.getTalkaByDistrict = res.data1;
        if (this.editFlag) {
          this.editProfileForm.patchValue({
            TalukaId: this.editProfileForm.value.TalukaId,
          });
          if (flag == 'select') {
            this.editProfileForm.controls['VillageId'].setValue('');
          }
          let selValueCityOrVillage: any = "";
          this.editProfileForm.value.IsRural == 1 ? (selValueCityOrVillage = "Village") : (selValueCityOrVillage = "City");
          if (this.editProfileForm.value.TalukaId) {
            this.getVillageOrCity(this.editProfileForm.value.TalukaId, selValueCityOrVillage)
          }
        }
      } else {
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  getVillageOrCity(talukaID: any, selType: any) {
    if (talukaID == "" || talukaID == 0) { return };

    if (this.villageCityLabel == "Village") {
      this.villageCityLabel = "Village", this.setVillOrCityId = "VillageId", this.setVillOrcityName = "VillageName";
    } else {
      this.villageCityLabel = "City", this.setVillOrcityName = "CityName", this.setVillOrCityId = "Id";
    }
    this.villageDisabled = false;
    this.spinner.show();
    let appendString = "";
    selType == 'Village' ? appendString = 'Web_GetVillage_1_0?talukaid=' + talukaID : appendString = 'Web_GetCity_1_0?DistrictId=' + this.editProfileForm.value.DistrictId;
    this.callAPIService.setHttp('get', appendString, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resultVillageOrCity = res.data1;
      } else {
        this.spinner.hide();
        if (res.data == 1) {
          this.toastrService.error("Data is not available1");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  get f() { return this.editProfileForm.controls };

  updateProfile() {
    // this.addValiditonTaluka(this.editProfileForm.value.IsRural)
    this.submitted = true;
    
    if (this.editProfileForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.editProfileForm.value['Name'] = this.editProfileForm.value.FName + " " + this.editProfileForm.value.MName + " " + this.editProfileForm.value.LName
      if (this.editProfileForm.value.IsRural == 0) {
        this.editProfileForm.value.TalukaId = "";
      }
      let fromData = new FormData();
      let FullName = this.editProfileForm.value.FName + " " + this.editProfileForm.value.MName + " " + this.editProfileForm.value.LName;
      this.editProfileForm.value.Name = FullName;

      this.editProfileForm.value.PostfromDate = (this.editProfileForm.value.PostfromDate).toString()?.length > 10 ? this.datePipe.transform(this.editProfileForm.value.PostfromDate, 'dd/MM/YYYY') : this.editProfileForm.value.PostfromDate;
      this.data.userpostbodyId == "" ||  this.data.userpostbodyId == 0 || this.data.formStatus == 'Add' ? this.editProfileForm.value.UserPostBodyId = 0 : this.editProfileForm.value.UserPostBodyId =this.data.userpostbodyId;
      Object.keys(this.editProfileForm.value).forEach((cr: any, ind: any) => {
        let value: any = Object.values(this.editProfileForm.value)[ind] != null ? Object.values(this.editProfileForm.value)[ind] : 0;
        fromData.append(cr, value)
      });
      fromData.append('ProfilePhoto', this.selectedFile == undefined ? '' : this.selectedFile);
      if (this.profilePhotoChange != 2) {
        this.selectedFile ? this.profilePhotoChange = 1 : this.profilePhotoChange = 0;
      }

      fromData.append('IsPhotoChange', this.profilePhotoChange);
      fromData.append('ClientId', this.commonService.getlocalStorageData().ClientId);

      this.callAPIService.setHttp('Post', 'Web_Insert_User_1_0_Committee', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
           //set username in session storage
           if(this.editProfileForm.value.UserId == this.commonService.loggedInUserId()){
            this.commonService.sendFullName(this.editProfileForm.value.Name);
            let loginObj: any = sessionStorage.getItem('loggedInDetails');
            loginObj = JSON.parse(loginObj);
            loginObj.data1[0].FullName = this.editProfileForm.value.Name;
            sessionStorage.setItem('loggedInDetails', JSON.stringify(loginObj))
           }
          

          this.editFlag = false;
          this.disabledEditForm = true;
          this.profilePhotoChange = null;
          this.submitted = false;
          this.resetFile();
          this.spinner.hide();
          let result = res.data1[0];
          if (result.Msg == "Mobile No allready exists") {
            this.toastrService.error("Mobile no already exist");
          } else if (result.Msg == "Data Saved Successfully" || result.Msg == "Profile Updated Successfully") {
            this.myProfileForm();
            this.toastrService.success(result.Msg);
            this.onNoClick('Yes')
          }
          this.ImgUrl = "";
          this.highlightedRow = "";
        } else {
          this.spinner.hide();
          if (res.data == 1) {
          } else {
            this.toastrService.error("Please try again something went wrong");
          }
        }
      })
    }
  }

  getProfileData(id: any) {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetUserDetails?Id=' + id, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resProfileData = res.data1[0];
        this.profileFormPathValue(this.resProfileData);
      } else {
        this.spinner.hide();
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  resetFile() {
    this.profileFlag = "Add";
    this.myInputVariable.nativeElement.value = '';
  }

  onRadioChangeCategory(category: any) { 
    this.editProfileForm.controls['TalukaId'].setValue('');
    if (category == "Rural") {
      this.villageDisabled = true;
      this.villageCityLabel = "Village", this.setVillOrCityId = "VillageId", this.setVillOrcityName = "VillageName";
      this.getTaluka(this.editProfileForm.value.DistrictId, false);
      this.editProfileForm.controls['VillageId'].setValue(this.globalVillageOrCityId);
    } else {
      this.globalVillageOrCityId = this.editProfileForm.value.VillageId;
      this.villageCityLabel = "City", this.setVillOrcityName = "CityName", this.setVillOrCityId = "Id";
      this.getVillageOrCity(this.editProfileForm.value.DistrictId, 'City',);
      this.editProfileForm.controls['VillageId'].setValue(null);
    }
  }

  districtClear(text: any) {
    if (text == 'district') {
      this.editProfileForm.controls['DistrictId'].setValue(''), this.editProfileForm.controls['TalukaId'].setValue(''), this.editProfileForm.controls['VillageId'].setValue('');
      this.villageDisabled = true;
    } else if (text == 'taluka') {
      this.editProfileForm.controls['TalukaId'].setValue(''), this.editProfileForm.controls['VillageId'].setValue('');

    } else if (text == 'village') {
      this.editProfileForm.controls['VillageId'].setValue('');
    }
  }

  choosePhoto() {
    this.profilePhotoChange = 1;
    let clickPhoto: any = document.getElementById('my_file')
    clickPhoto.click();
  }

  readUrl(event: any) {
    let selResult = event.target.value.split('.');
    this.getImgExt = selResult.pop();
    this.getImgExt.toLowerCase();
    if (this.getImgExt == "png" || this.getImgExt == "jpg" || this.getImgExt == "jpeg") {
      this.selectedFile = <File>event.target.files[0];
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.ImgUrl = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
        this.imgName = event.target.files[0].name;
      }
    }
    else {
      this.toastrService.error("Profile image allowed only jpg or png format");
    }
  }

  removePhoto() {
    this.selectedFile = "";
    this.fileInput.nativeElement.value = '';
    this.profilePhotoChange = 2;
    this.ImgUrl = null;
  }

  addValiditonTaluka(IsRural: any) {
    if (IsRural == 1) {
      this.editProfileForm.controls["TalukaId"].setValidators(Validators.required);
      this.editProfileForm.controls["TalukaId"].updateValueAndValidity();
      this.editProfileForm.controls['TalukaId'].clearValidators();
    } else {
      this.editProfileForm.controls["TalukaId"].clearValidators();
      this.editProfileForm.controls["TalukaId"].updateValueAndValidity();
    }
  }

  getCurrentDesignatedMembers(id: any) {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetCurrentDesignatedMembers_1_0?BodyId=' + id, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allDesignatedMembers = res.data1;
        if (this.editFlag) {
          this.editMemObj.DesignationId ? (this.editProfileForm.controls['DesignationId'].setValue(this.editMemObj.DesignationId)) : '';
          this.getConstituencylist();
        }
        this.data.Designation ? (this.editProfileForm.controls['DesignationId'].setValue(this.data.Designation)) : '';
      } else {
        this.allDesignatedMembers = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }

  getConstituencylist() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetConstituencydetails', false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getConstituencyResult = res.data1;
        if (this.editFlag) {
          this.editMemObj.ConstituencyNo ? (this.editProfileForm.controls['ConstituencyNo'].setValue(this.editMemObj.ConstituencyNo)) : '';
          this.getDistrict();
        }

      } else {
        this.allDesignatedMembers = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }


  getCommitteeName() {
    //this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetBodyOrgCellName_1_0_Committee?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb'); // old API Web_GetBodyOrgCellName_1_0
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.resCommittees = res.data1;
        if (this.editFlag) {
          this.editMemObj.BodyId ? (this.editProfileForm.controls['BodyId'].setValue(this.editMemObj.BodyId), this.getCurrentDesignatedMembers(this.editProfileForm.value.BodyId)) : '';
        }
        this.data.CommitteeName ? (this.editProfileForm.controls['BodyId'].setValue(this.data.CommitteeName), this.getCurrentDesignatedMembers(this.editProfileForm.value.BodyId)) : '';
      } else {
        this.resCommittees = [];
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../../500'], { relativeTo: this.route });
      }
    })
  }
  clearValueDatePicker() {
    this.editProfileForm.controls['fromTodate'].setValue(null)
  }

  clikedClose(flag: any) {
    if (flag == 'Committees') {
      this.editProfileForm.controls['DesignationId'].setValue('');
    }
  }

  onNoClick(text: any): void {
    this.dialogRef.close(text);
  }

  addDesignated(bodyId: any) {
    if (bodyId == "" || bodyId == null || bodyId == undefined) {
      this.toastrService.error('Please select committee Name');
      return
    }
    this.onNoClick('Yes')
    let dialogRefAddDesignated: any;
    this.resCommittees.map((ele: any) => {
      if (ele.Id == bodyId) {
        let bodyName = ele.BodyOrgCellName;
        dialogRefAddDesignated = this.dialog.open(AddDesignationComponent, {
          // width: '1024px',
          data: { committeeId: bodyId, committeeName: bodyName }
        });
      }
    });
    dialogRefAddDesignated.afterClosed().subscribe((result: any) => {
      let bodyId: any = sessionStorage.getItem('bodyId');
      let bId = JSON.parse(bodyId);
      let obj = { "formStatus": 'Add', 'Id': 0, 'CommitteeName': bId.bodyId, 'Designation': this.data.Designation };
      this.dialog.open(AddMemberComponent, {
        width: '1024px',
        data: obj
      });
      // dialogRefAddDesignated = null;
    //  this.ngOnInit();
    });
  }

  acceptedOnlyNumbers(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  ngOnDestroy(){
      sessionStorage.removeItem('memberValue');
  }
}
