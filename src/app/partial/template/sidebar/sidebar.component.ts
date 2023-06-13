import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  hide:boolean=true;
  isShowMenu:boolean=false;
  logInUserType:any;
  loginAfterPages:any;
  loginPages:any = [];
  obj:any;

  @Input() set showMenu(value: boolean) {
    this.isShowMenu = value
  }
  
  constructor(
    private commonService:CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.logInUserType = this.commonService.loggedInUserType();
    this.loginAfterPages = this.commonService.getAllPageName();
    this.loginAfterPages.forEach((item: any) => {
      let existing: any = this.loginPages.filter((v: any, i: any) => {
        return v.PageGroup == item.PageGroup;
      });
      if (existing.length) {
        let existingIndex: any = this.loginPages.indexOf(existing[0]);
        this.loginPages[existingIndex].PageURL = this.loginPages[existingIndex].PageURL.concat(item.PageURL);
        this.loginPages[existingIndex].pageName = this.loginPages[existingIndex].pageName.concat(item.pageName);
      } else {
        if (typeof item.pageName == 'string')
          item.PageURL = [item.PageURL];
        item.pageName = [item.pageName];
        this.loginPages.push(item);
      }
    });
  }

  hideSubMenu() {
    let elements: any = document.getElementsByClassName('accordion-has-submenu') || [];
    for (let i = 0; i < elements.length; i++) {
      if (elements[i]) {
        elements[i].querySelector('.accordion-button').classList.add('collapsed');
        elements[i].querySelector('.accordion-collapse').classList.remove('show');
      }
    }
  }
}
