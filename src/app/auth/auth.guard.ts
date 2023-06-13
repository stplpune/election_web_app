import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from "rxjs";
import { CommonService } from '../services/common.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService,
    private router: Router ,private commonService:CommonService){
  }
  logInUserType:any =  this.commonService.loggedInUserType();

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.commonService.checkUserIsLoggedIn()) {
      this.router.navigate(['/login']);
      return false
    } else {
      return true;
    }
  }
  
}
