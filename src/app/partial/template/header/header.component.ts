import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  editProfileForm!: FormGroup;
  categoryArray = [{ id: 1, name: "Rural" }, { id: 0, name: "Urban" }];
  GenderArray = [{ id: 1, name: "Male" }, { id: 2, name: "Female" }, { id: 3, name: "Other" }];
  selGender: any;
  getImgExt: any;
  imgName: any;
  ImgUrl: any;
  isShowMenu: boolean = false;
  @Output() onShowMenu: EventEmitter<any> = new EventEmitter();
  editFlag: boolean = true;
  userName = this.commonService.loggedInUserName();
  submitted = false;
  resultVillageOrCity: any;
  allDistrict: any;
  getTalkaByDistrict: any;
  profilePhotoChange: any;
  @ViewChild('closeModal') closeModal: any;
  @ViewChild('closeChangePasswordModal') closeChangePasswordModal: any;
  @ViewChild('myInput') myInputVariable!: ElementRef;
  selectedFile!: File;
  resProfileData: any;
  showingUserName: any;
  showingMobileNo: any;
  villageCityLabel: any;
  setVillOrCityId: any;
  setVillOrcityName: any;
  globalVillageOrCityId: any;
  disabledEditForm :boolean = true;
  defaultModalHIde:boolean = false;
  defaultModalHIdeCP:boolean = false;
  changePasswordForm: any;
  submittedChangePassword = false;
  show_button: Boolean = false;
  show_eye: Boolean = false;
  show_button1: Boolean = false;
  show_eye1: Boolean = false;
  show_button2: Boolean = false;
  show_eye2: Boolean = false;
  committeename:any;
  fullName:any;
  nameImgObj:any;
  pic:any;
  // fullname:any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private callAPIService: CallAPIService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private commonService: CommonService,
    private fb: FormBuilder,
  ) { }

  get f() { return this.editProfileForm.controls };

  ngOnInit(): void {
    this.nameImgObj = this.commonService.getFullName();
    this.committeename = this.commonService.getCommiteeInfo();
    //console.log(this.committeename);
    this.pic = this.nameImgObj.ProfilePhoto;
    this.commonService.imageChange.subscribe((imagePath:any) => {
     if (!!imagePath) {
       this.pic = imagePath;
     } else {
       this.pic = this.nameImgObj.ProfilePhoto;
     }
   });

    this.commonService.getNameOnChange.subscribe(message => {
      if (message) {
        let name = message.split(' ')
        this.fullName = name[0] + " " + name[2]
      } else {
        this.fullName = this.nameImgObj.FName + " " + this.nameImgObj.LName
      }
    });
    
  }

  ngAfterViewInit(){
    
  }

  getProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetUserprofile_1_0?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
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

  getDistrict() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allDistrict = res.data1;
        if (this.editFlag) {
          this.getTaluka(this.editProfileForm.value.DistrictId)
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

  getTaluka(districtId: any) {
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getTalkaByDistrict = res.data1;
        if (this.editFlag) {
          this.editProfileForm.patchValue({
            TalukaId: this.editProfileForm.value.TalukaId,
          });
          let selValueCityOrVillage: any = "";
          this.editProfileForm.value.IsRural == 1 ? (selValueCityOrVillage = "Village") : (selValueCityOrVillage = "City");
          this.getVillageOrCity(this.editProfileForm.value.TalukaId, selValueCityOrVillage)
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

  profileFormPathValue(data: any) {
    this.selGender = data.Gender;
    data.IsRural == 1 ? (this.setVillOrcityName = "VillageName", this.setVillOrCityId = "VillageId", this.villageCityLabel = "Village") : (this.setVillOrcityName = "CityName", this.setVillOrCityId = "Id", this.villageCityLabel = "City");
    this.getDistrict();
    this.ImgUrl = data.ProfilePhoto;
    this.showingMobileNo = data.MobileNo;
    this.showingUserName = this.commonService.loggedInUserName();

    this.editProfileForm.patchValue({
      FName: data.FName,
      MName: data.MName,
      LName: data.LName,
      IsRural: data.IsRural,
      Gender: data.Gender,
      EmailId: data.Emailid,
      Address: data.Address,
      DistrictId: data.DistrictId,
      TalukaId: data.TalukaId,
      VillageId: data.VillageId,
    });
  }

  myProfileForm() {
    this.editProfileForm = this.fb.group({
      UserId: [this.commonService.loggedInUserId()],
      StateId: [1],
      DistrictId: ['', [Validators.required]],
      TalukaId: ['', [Validators.required]],
      VillageId: ['', [Validators.required]],
      FName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      MName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      LName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      IsRural: [],
      ConstituencyNo: [''],
      Gender: [''],
      EmailId: ['', [Validators.required, Validators.email]],
      Address: [''],
    })
  }


  showMenu() {
    this.isShowMenu = !this.isShowMenu;
    this.onShowMenu.emit(this.isShowMenu);

  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/login'], { relativeTo: this.route })
  }

  updateProfile() {
    this.submitted = true;
    if (this.editProfileForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.editProfileForm.value['Name'] = this.editProfileForm.value.FName + " " + this.editProfileForm.value.MName + " " + this.editProfileForm.value.LName
      let fromData = new FormData();
      Object.keys(this.editProfileForm.value).forEach((cr: any, ind: any) => {
        let value: any = Object.values(this.editProfileForm.value)[ind] != null ? Object.values(this.editProfileForm.value)[ind] : 0;
        fromData.append(cr, value)
      });
      fromData.append('ProfilePhoto', this.selectedFile == undefined ? '' : this.selectedFile);
      if (this.profilePhotoChange != 2) {
        this.selectedFile ? this.profilePhotoChange = 1 : this.profilePhotoChange = 0;
      }
      fromData.append('IsPhotoChange', this.profilePhotoChange);

      this.callAPIService.setHttp('Post', 'Web_Update_UserProfile_1_0', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.profilePhotoChange = null;
          this.submitted = false;
          this.resetFile();
          let modalClosed = this.closeModal.nativeElement;
          modalClosed.click();
          this.spinner.hide();
          let result = res.data1[0];
          this.toastrService.success(result.Msg);
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

  resetFile() {
    this.myInputVariable.nativeElement.value = '';
  }

  onRadioChangeCategory(category: any) {
    if (category == "Rural") {
      this.villageCityLabel = "Village", this.setVillOrCityId = "VillageId", this.setVillOrcityName = "VillageName"
      this.getTaluka(this.editProfileForm.value.DistrictId);
      this.editProfileForm.controls['VillageId'].setValue(this.globalVillageOrCityId);
    } else {
      this.globalVillageOrCityId = this.editProfileForm.value.VillageId;
      this.villageCityLabel = "City", this.setVillOrcityName = "CityName", this.setVillOrCityId = "Id";
      this.editProfileForm.controls['VillageId'].setValue(null);
    }
    this.getDistrict()
  }

  districtClear(text: any) {
    if (text == 'district') {
      this.editProfileForm.controls['DistrictId'].setValue(null), this.editProfileForm.controls['TalukaId'].setValue(null), this.editProfileForm.controls['VillageId'].setValue(null);

    } else if (text == 'taluka') {
      this.editProfileForm.controls['TalukaId'].setValue(null), this.editProfileForm.controls['VillageId'].setValue(null);

    } else if (text == 'village') {
      this.editProfileForm.controls['VillageId'].setValue(null);
    }
  }

  choosePhoto() {
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
    this.profilePhotoChange = 2;
    this.ImgUrl = null;
  }


  //change password 
  customFormChangePassword() {
    this.changePasswordForm = this.fb.group({
      userName: [this.commonService.loggedInUserName(), [Validators.required,]],
      oldPassword: ['', [Validators.required,]],
      newPassword: ['', [Validators.required, this.passwordValid]],
      ConfirmPassword: ['',[Validators.required, this.passwordValid]],
    })
  }

  get cp() { return this.changePasswordForm.controls };

  onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      if (this.changePasswordForm.value.newPassword == this.changePasswordForm.value.ConfirmPassword) {
        if(this.changePasswordForm.value.oldPassword == this.changePasswordForm.value.newPassword){
          this.toastrService.error('Old password and new password should not  be same')
          this.spinner.hide();
          return
        }
        let obj= 'UserId=' + this.commonService.loggedInUserId() + '&OldPassword=' + this.changePasswordForm.value.oldPassword + '&NewPassword=' + this.changePasswordForm.value.newPassword
        this.callAPIService.setHttp('get','Web_Update_Password?' + obj, false, false, false, 'electionServiceForWeb');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.data1[0].Id!== 0) {
           this.toastrService.success(res.data1[0].Msg)
            this.spinner.hide();
            this.clearForm();
            let changePasswordModalClosed = this.closeChangePasswordModal.nativeElement;
            changePasswordModalClosed.click();
          }
          else {
            this.spinner.hide();
           this.toastrService.error(res.data1[0].Msg)
          }
        })
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.toastrService.error("New password and Confirm password should be same")
      }

    }

  
  }

  showPassword(data: any) {
    if (data == 'old') {
      this.show_button = !this.show_button;
      this.show_eye = !this.show_eye;
    } else if (data == 'new') {
      this.show_button1 = !this.show_button1;
      this.show_eye1 = !this.show_eye1;
    } else {
      this.show_button2 = !this.show_button2;
      this.show_eye2 = !this.show_eye2;
    }

  }

  clearForm() {
    this.submitted = false;
    this.changePasswordForm.reset({
      userName: this.commonService.loggedInUserName(),
      oldPassword: '',
      newPassword: '',
      ConfirmPassword: ''
    });
  }

  passwordValid(controls:any) {
    const regExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{8,}$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return { passwordValid: true }
    }
  }

  DisabledAllForm(){//Disabled hole Form When Click model Close Button
    this.disabledEditForm = true;
  }

  redirectOrgDetails(bodyId: any, BodyOrgCellName: any) {
    let obj = { bodyId: bodyId, BodyOrgCellName: BodyOrgCellName }
    localStorage.setItem('bodyId', JSON.stringify(obj))
    this.router.navigate(['../committee/details'], { relativeTo: this.route })
    //}
  }
}
