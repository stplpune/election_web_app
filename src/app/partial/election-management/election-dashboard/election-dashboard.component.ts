import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-election-dashboard',
  templateUrl: './election-dashboard.component.html',
  styleUrls: ['./election-dashboard.component.css']
})
export class ElectionDashboardComponent implements OnInit
{
  totalElection: number = 0;
  totalConstituency: number = 0;
  totalAssembly: number = 0;
  totalClient: number = 0;
  totalVoters: number = 0;
  constructor(private router: Router, private route: ActivatedRoute, private spinner: NgxSpinnerService, private callAPIService: CallAPIService, private commonService: CommonService) { }

  ngOnInit(): void
  {
    this.getDashboardData();
  }

  getDashboardData()
  {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetAdminDashboardData', false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) =>
    {
      if (res.responseData != null && res.statusCode == '200')
      {
        this.spinner.hide();
        this.totalElection = res.responseData.totalElection;
        this.totalConstituency = res.responseData.totalConstituency;
        this.totalAssembly = res.responseData.totalAssembly;
        this.totalClient = res.responseData.totalClient;
        this.totalVoters = res.responseData.totalVoters;
      } else
      {
        this.totalElection = 0;
        this.totalConstituency = 0;
        this.totalAssembly = 0;
        this.totalClient = 0;
        this.totalVoters = 0;
        this.spinner.hide();
      }
    }, (error: any) =>
    {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    });
  }

}
