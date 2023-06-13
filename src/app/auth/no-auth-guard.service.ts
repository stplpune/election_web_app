import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService {
  constructor(private auth: AuthService,
    private router: Router ,private commonService:CommonService){
  }
  logInUserType:any =  localStorage.getItem('loggedInDetails');
    canActivate(): any {
      if(this.commonService.checkUserIsLoggedIn()){
        if(this.logInUserType){
          this.router.navigate(['/'+this.commonService.redirectToDashborad()]);
        }
      }else{
        return true;
      }
    }
}
