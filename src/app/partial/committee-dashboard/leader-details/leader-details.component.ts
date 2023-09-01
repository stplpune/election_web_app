import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallAPIService } from 'src/app/services/call-api.service';

@Component({
  selector: 'app-leader-details',
  templateUrl: './leader-details.component.html',
  styleUrls: ['./leader-details.component.css']
})
export class LeaderDetailsComponent implements OnInit {

leaderId:any;
getByIdImp_LeadersArray:any;

  constructor(
    private route: ActivatedRoute,
    private callAPIService: CallAPIService,
    private router: Router,) {
    let ReceiveDataSnapshot: any = this.route.snapshot.params.id;
    if (ReceiveDataSnapshot) {this.leaderId = ReceiveDataSnapshot}
   }

  ngOnInit(): void {
    this.leaderId ? this.getByIdImp_Leaders(this.leaderId) : '';
  }

  getByIdImp_Leaders(id:any) { 
    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/GetImporatntLeaderGetById?LeaderId=' + id, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.getByIdImp_LeadersArray = res.responseData;
      } else { this.getByIdImp_LeadersArray = []; }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

}
