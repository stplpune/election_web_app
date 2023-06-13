import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import
{
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit
{
  loginForm!: FormGroup;
  submitted = false;
  show_button: Boolean = false;
  show_eye: Boolean = false;
  date: any = new Date();

  //Only For ForgotPassword
  generateOTP: boolean = false;
  forgotPasswordForm!: FormGroup;
  isSubmitForgotPassword: boolean = false;
  mobileNo: string = '';
  @ViewChild('closeForgotForm') closeForm!: ElementRef;


  @ViewChild('newPassword') newPassword!: ElementRef;
  newPasswordText: string = 'password';
  @ViewChild('retypePassword') retypePassword!: ElementRef;
  retypePasswordText: string = 'password';
  @ViewChild('registeredMobile') registeredMobile!: ElementRef;

  @ViewChild('focusInput') focusInput!: ElementRef;


  constructor(
    private callAPIService: CallAPIService,
    private fb: FormBuilder,
    private fbForget: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) { }

  ngOnInit(): void
  {
    // this.reCaptcha();
    this.defaultLoginForm();
    if (localStorage.getItem('loggedInDetails'))
    {
      //this.commonService.getAllPageName()
    }
  }

  @HostListener('focusout', ['$event']) public onListenerTriggered(event: any): void
  {
    this.setFocusToInput();
  }

  setFocusToInput()
  {

    this.focusInput.nativeElement.focus();

  }

  defaultLoginForm()
  {
    this.loginForm = this.fb.group({
      UserName: ['', Validators.required],
      Password: ['', [Validators.required, this.passwordValid]],
      recaptchaReactive: [''],
    });

    this.forgotPasswordForm = this.fbForget.group(
      {
        registeredMobileNo: [''],
        OTP: ['', [Validators.required, Validators.min(6)]],
        password: ['', [Validators.required, this.ValidatePassword()]],
        confirmPassword: ['', [Validators.required, this.ValidatePassword()]],
      },
      { validators: this.checkPasswords }
    );
  }
  get f()
  {
    return this.loginForm.controls;
  }

  onSubmit()
  {
    this.spinner.show();
    this.submitted = true;
    if (this.loginForm.invalid)
    {
      this.spinner.hide();
      return;
    }
    //  else if(){
    //   this.toastrService.error("Please Enter Valid credentials....!!!");
    // }
    // else if (this.loginForm.value.recaptchaReactive != this.commonService.checkvalidateCaptcha()) {
    //   this.spinner.hide();
    //   this.toastrService.error("Invalid Captcha. Please try Again");
    // }
    else
    {
      this.callAPIService.setHttp(
        'get',
        'Web_GetLogin_3_0?UserName=' +
        this.loginForm.value.UserName +
        '&Password=' +
        this.loginForm.value.Password +
        '&LoginType=1',
        false,
        false,
        false,
        'electionServiceForWeb'
      );
      this.callAPIService.getHttp().subscribe((res: any) =>
      {
        if (res.data == '0')
        {
          localStorage.setItem('loggedInDetails', JSON.stringify(res));
          sessionStorage.setItem('loggedIn', 'true');
          localStorage.setItem('loginDateTime', this.date);
          this.spinner.hide();
          this.toastrService.success('Login Successful');
          this.router.navigate(
            ['../' + this.commonService.redirectToDashborad()],
            { relativeTo: this.route }
          );
        } else
        {
          if (res.data == 1)
          {
            this.toastrService.error(
              'Login is unsuccessful! Please check User Name and Password.'
            );
          } else
          {
            this.toastrService.error('Please try again something went wrong');
          }
          this.spinner.hide();
        }
      });
    }
    //  this.reCaptcha();
  }

  reCaptcha()
  {
    this.commonService.createCaptchaCarrerPage();
  }

  showPassword()
  {
    this.show_button = !this.show_button;
    this.show_eye = !this.show_eye;
  }

  passwordValid(controls: any)
  {
    const regExp = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*)(?=.*\W.*)[a-zA-Z0-9\S]{8,}$/
    );
    if (regExp.test(controls.value))
    {
      return null;
    } else
    {
      return { passwordValid: true };
    }
  }

  //ForgotPassword Try

  get forgotForm()
  {
    return this.forgotPasswordForm.controls;
  }

  checkMobileNo()
  {
    const regExp = new RegExp(/^[6-9]{1}[0-9]{9}$/);
    if (!regExp.test(this.forgotForm.registeredMobileNo.value))
    {
      this.toastrService.error('Invalid Mobile No');
    } else
    {
      this.GenerateOTPbyAPI(this.forgotForm.registeredMobileNo.value);
    }
  }

  GenerateOTPbyAPI(mobileNo: string)
  {
    this.spinner.show();
    this.callAPIService.setHttp(
      'put',
      'WebUserAccount/GenerateOTP?mobileNo=' + mobileNo,
      false,
      false,
      false,
      'electionMicroServiceForWeb'
    );
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res != null)
      {
        const Message = res.statusMessage.split(':')[1];
        if (res.responseData > 0)
        {
          this.spinner.hide();
          this.toastrService.success(Message);
          this.mobileNo = mobileNo;
          this.forgotForm.registeredMobileNo.disable();
          this.generateOTP = true;
        } else
        {
          this.spinner.hide();
          this.toastrService.error(Message);
        }
      }
    });
  }

  checkPasswords: ValidatorFn = (group: any) =>
  {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  checkOTP()
  {
    this.isSubmitForgotPassword = true;
    if (this.forgotPasswordForm.invalid)
    {
      return;
    } else
    {
      this.UpdatePasswordAPI();
    }
  }

  UpdatePasswordAPI()
  {
    this.spinner.show();
    let dataForm = this.forgotPasswordForm.value;
    const obj = {
      mobileNo: this.mobileNo,
      otp: dataForm.OTP,
      password: dataForm.password,
    };
    this.callAPIService.setHttp(
      'put',
      'WebUserAccount/UpdatePasswordUsingOTP',
      false,
      obj,
      false,
      'electionMicroServiceForWeb'
    );
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res != null)
      {
        const Message = res.statusMessage.split(':')[1];
        if (res.responseData > 0)
        {
          this.spinner.hide();
          this.toastrService.success(Message);
          this.closeForm.nativeElement.click();
        } else
        {
          this.spinner.hide();
          this.toastrService.error(Message);
        }
      }
    });
  }

  clearStateForgotPassword()
  {
    this.forgotForm.registeredMobileNo.enable();
    this.generateOTP = false;
    this.defaultLoginForm();
    this.isSubmitForgotPassword = false;
  }

  changeTypeOfPasswordFields(type: string)
  {
    if (type == 'NewPassword')
      this.newPasswordText = this.newPasswordText == 'password' ? 'text' : 'password';
    else
      this.retypePasswordText = this.retypePasswordText == 'password' ? 'text' : 'password';
  }
  //Password Validation
  ValidatePassword(): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors | null =>
    {
      if (!control.value)
        return { required: true };
      else if (!RegExp('[A-Z]{1,}').test(control.value))
        return { capsLetterMissing: true };
      else if (!RegExp('[a-z]{1,}').test(control.value))
        return { smallLetterMissing: true };
      else if (!RegExp('[0-9]{1,}').test(control.value))
        return { numberMissing: true };
      else if (!RegExp('[~!@#$%^&*()_-]{1,}').test(control.value))
        return { specialCharacterMissing: true };
      else if (control.value.length < 8)
        return { lengthInvalid: true };
      else
        return null;
    };
  }
}
