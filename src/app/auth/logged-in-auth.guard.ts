import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../services/common.service';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {
  constructor(private _authService: AuthService, private commonService:CommonService,
    private _router: Router, private toastrService: ToastrService) { }

  canActivate(): any {
    if (this._authService.isLoggedIn()) {
      // this._router.navigate(['/dashboard']);
      this._router.navigate(['/'+this.commonService.redirectToDashborad()]);
      this.toastrService.success('You are already logged in');

    } else {
      // this.toastrService.error('Please login and try again');
      return true;
    }
  }
}
