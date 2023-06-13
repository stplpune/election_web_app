import { Component,  ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { Subject } from "rxjs";
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  status = 'ONLINE';
  isConnected = true;
  @ViewChild('openModal') openModal: any;
  @ViewChild('close') close: any;



  title = 'NCPYouthCongress';
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private titleService: Title, private spinner: NgxSpinnerService,
    private connectionService: ConnectionService) {
    this.checkingInternetConnection();

    this.router.events.subscribe((event: any) => { //beefore page load spinner is show
      if (event instanceof NavigationStart) {
        this.spinner.show()
      }
      if (event instanceof NavigationEnd) {
        this.spinner.hide();
        window.scroll(0, 0);
      }
    });
  }
  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      var rt = this.getChild(this.activatedRoute)
      rt.data.subscribe((data: { title: string; }) => {
        this.titleService.setTitle(data.title)
      })
    })
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  checkingInternetConnection() {
    this.connectionService.monitor().subscribe((isConnected: any) => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.status = "Internet Connection Available";
        let el: any = this.close.nativeElement;
        el.click();
      }
      else {
        this.status = "No Internet Connection";
        let el: any = this.openModal.nativeElement;
        el.click();
      }
    })
  }


}
