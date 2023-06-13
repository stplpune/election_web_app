import { Component, NgZone, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
// import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit {
  loginType!:number;
  isShowMenu: boolean = false;
  isAuthenticated: boolean = false;
  constructor(private zone: NgZone, private router: Router, private commonService:CommonService) { }

  ngOnInit(): void {
    this.loginType = this.commonService.getLoginType();
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        // this.spinner.show()
        }
      if (event instanceof NavigationEnd) {
        // this.spinner.hide()
        window.scroll(0,0);

      }
    });
  }

}
