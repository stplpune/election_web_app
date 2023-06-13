import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

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
  @ViewChild('myInput') myInputVariable!: ElementRef;
  selectedFile: any;
  resProfileData: any;
  showingUserName: any;
  showingMobileNo: any;
  villageCityLabel: any;
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
  villageDisabled!:boolean;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private callAPIService: CallAPIService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.myProfileForm();
    this.getProfileData();
    this.customFormChangePassword();
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

  myProfileForm() {
    this.editProfileForm = this.fb.group({
      UserId: [this.commonService.loggedInUserId()],
      StateId: [1],
      DistrictId: [0, [Validators.required]],
      TalukaId: [''],
      VillageId: ['', [Validators.required]],
      // FName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      FName: ['',Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')])],
      MName: ['',Validators.compose([Validators.required,Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)])],
      LName: ['',Validators.compose([Validators.required, Validators.maxLength(50), Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')])],
      IsRural: [],
      ConstituencyNo: [''],
      Gender: ['',[Validators.required]],
      EmailId: ['', [Validators.required, Validators.email]],
      Address: ['',[Validators.required,Validators.pattern('^[^[ ]+|[ ][gm]+$')]],
    })
  }

  profileFormPathValue(data: any) {
    // for img upload 
    let loginObj: any = localStorage.getItem('loggedInDetails');
    loginObj = JSON.parse(loginObj);
    loginObj.data1[0].ProfilePhoto = data.ProfilePhoto;
    localStorage.setItem('loggedInDetails', JSON.stringify(loginObj));
    this.commonService.pathchange(this.ImgUrl);
    localStorage.setItem('imgUrl', this.ImgUrl);


    this.selGender = data.Gender;
    data.IsRural == 1 ? (this.setVillOrcityName = "VillageName", this.setVillOrCityId = "VillageId", this.villageCityLabel = "Village") : (this.setVillOrcityName = "CityName", this.setVillOrCityId = "Id", this.villageCityLabel = "City");
    this.getDistrict();
    this.ImgUrl = data.ProfilePhoto;
    this.editProfileForm.patchValue({
      FName: data.FName,
      MName: data.MName,
      LName: data.LName,
      IsRural: data.IsRural,
      Gender: data.Gender,
      EmailId: data.Emailid,
      Address: data.Address,
      DistrictId: this.commonService.checkDataType(data.DistrictId) == true ? data.DistrictId : '',
      TalukaId: data.TalukaId,
      VillageId: this.commonService.checkDataType(data.VillageId) == true ? data.VillageId : '',
    });
  }

  addValiditonTaluka(IsRural:any){
    if(IsRural == 1){
      this.editProfileForm.controls["TalukaId"].setValidators(Validators.required);
      this.editProfileForm.controls["TalukaId"].updateValueAndValidity();
      this.editProfileForm.controls['TalukaId'].clearValidators();
    }else{
      this.editProfileForm.controls["TalukaId"].clearValidators();
      this.editProfileForm.controls["TalukaId"].updateValueAndValidity();
    }
  }

  getDistrict() {
    this.callAPIService.setHttp('get', 'Web_GetDistrict_1_0?StateId=' + 1, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.allDistrict = res.data1;
        if (this.editFlag && this.editProfileForm.value.IsRural == 0) {
          this.getVillageOrCity(this.editProfileForm.value.DistrictId, 'City')
        }else  if (this.editFlag && this.editProfileForm.value.IsRural == 1) {
          this.getTaluka(this.editProfileForm.value.DistrictId,false);
        }
      } else {
        if (res.data == 1) {
          this.toastrService.error("Data is not available 2");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  getTaluka(districtId: any,flag:any) {
    if(districtId ==""){return};
    if(this.editProfileForm.value.IsRural == 0){
      this.getVillageOrCity(this.editProfileForm.value.DistrictId, 'City')
      return
    }
    (districtId == null || districtId == "") ? districtId = 0 : districtId = districtId;
    this.callAPIService.setHttp('get', 'Web_GetTaluka_1_0?DistrictId=' + districtId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.getTalkaByDistrict = res.data1;
        if (this.editFlag) {
          this.editProfileForm.patchValue({
            TalukaId: this.editProfileForm.value.TalukaId,
          });
          if(flag == 'select'){
            this.editProfileForm.controls['VillageId'].setValue('');
          }
          let selValueCityOrVillage: any = "";
          this.editProfileForm.value.IsRural == 1 ? (selValueCityOrVillage = "Village") : (selValueCityOrVillage = "City");
          if (this.editProfileForm.value.TalukaId) {
            this.getVillageOrCity(this.editProfileForm.value.TalukaId, selValueCityOrVillage)
          }
        }
      } else {
        if (res.data == 1) {
          //this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  getVillageOrCity(talukaID: any, selType: any) {
   if(talukaID ==""){return};
    this.villageDisabled = false;
    let appendString = "";
    selType == 'Village' ? appendString = 'Web_GetVillage_1_0?talukaid=' + talukaID : appendString = 'Web_GetCity_1_0?DistrictId=' + this.editProfileForm.value.DistrictId;
    this.callAPIService.setHttp('get', appendString, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.resultVillageOrCity = res.data1;
      } else {
        if (res.data == 1) {
          this.toastrService.error("Data is not available");
        } else {
          this.toastrService.error("Please try again something went wrong");
        }
      }
    })
  }

  get f() { return this.editProfileForm.controls };

  updateProfile() {
    this.addValiditonTaluka(this.editProfileForm.value.IsRural)
    this.submitted = true;
    if (this.editProfileForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.editProfileForm.value['Name'] = this.editProfileForm.value.FName + " " + this.editProfileForm.value.MName + " " + this.editProfileForm.value.LName
      if(this.editProfileForm.value.IsRural == 0){
        this.editProfileForm.value.TalukaId = "";
      }
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
         //set username in session storage
          this.commonService.sendFullName(this.editProfileForm.value.Name);
          let loginObj: any = localStorage.getItem('loggedInDetails');
          loginObj = JSON.parse(loginObj);
          loginObj.data1[0].FullName = this.editProfileForm.value.Name;
          localStorage.setItem('loggedInDetails', JSON.stringify(loginObj))

          this.disabledEditForm = true;
          this.profilePhotoChange = null;
          this.submitted = false;
          this.resetFile();
          this.spinner.hide();
          let result = res.data1[0];
          this.toastrService.success(result.Msg);
          this.getProfileData();
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
      this.villageDisabled = true;
      this.villageCityLabel = "Village", this.setVillOrCityId = "VillageId", this.setVillOrcityName = "VillageName"
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
      this.toastrService.error("Profile image in only JPG,JPEG or PNG format is allowed");
    }
  }

  removePhoto() {
    this.selectedFile = "";
    this.fileInput.nativeElement.value = '';
    this.profilePhotoChange = 2;
    this.ImgUrl = null;
  }

  customFormChangePassword() {
    this.changePasswordForm = this.fb.group({
      userName: [this.commonService.loggedInUserName(), [Validators.required,]],
      oldPassword: ['', [Validators.required, this.passwordValid]],
      newPassword: ['', [Validators.required, this.passwordValid]],
      ConfirmPassword: ['', [Validators.required, this.passwordValid]],
    })
  }

  get cp() { return this.changePasswordForm.controls };

  onSubmit() {
    this.spinner.show();
    this.submittedChangePassword = true;
    if (this.changePasswordForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      if (this.changePasswordForm.value.newPassword == this.changePasswordForm.value.ConfirmPassword) {
        if (this.changePasswordForm.value.oldPassword == this.changePasswordForm.value.newPassword) {
          this.toastrService.error('Old Password and New Password should not be same')
          this.spinner.hide();
          return
        }
        let obj = 'UserId=' + this.commonService.loggedInUserId() + '&OldPassword=' + this.changePasswordForm.value.oldPassword + '&NewPassword=' + this.changePasswordForm.value.newPassword
        this.callAPIService.setHttp('get', 'Web_Update_Password?' + obj, false, false, false, 'electionServiceForWeb');
        this.callAPIService.getHttp().subscribe((res: any) => {
          if (res.data1[0].Id !== 0) {
            this.toastrService.success(res.data1[0].Msg);
            this.spinner.hide();
            this.clearForm();
            setTimeout(() => {
              this.logOut();
            }, 1500);
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
    this.submittedChangePassword = false;
    this.changePasswordForm.reset({
      userName: this.commonService.loggedInUserName(),
      oldPassword: '',
      newPassword: '',
      ConfirmPassword: ''
    });
  }

  passwordValid(controls: any) {
    const regExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{8,}$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return { passwordValid: true }
    }
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/login'], { relativeTo: this.route })
  }

}
