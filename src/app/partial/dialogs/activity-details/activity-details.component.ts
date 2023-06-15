import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Gallery } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.css']
})
export class ActivityDetailsComponent implements OnInit, AfterViewInit {
  resultBodyMemActDetails:any;
  comUserdetImg:any;
  lat: any = 19.75117687556874;
  lng: any = 75.71630325927731;
  previous:any;
  constructor(public gallery: Gallery, public dialogRef: MatDialogRef<ActivityDetailsComponent>, 
     @Inject(MAT_DIALOG_DATA) public data: any, private commonService:CommonService,
     private _lightbox: Lightbox) { }

  ngOnInit(): void {
    //console.log(this.data);
    this.resultBodyMemActDetails = this.data;
    this.activitieDetails();
  }

  ngAfterViewInit(){
  }

  activitieDetails(){
    this.comUserdetImg = this.resultBodyMemActDetails.Images.split(',');
    this.comUserdetImg = this.commonService.imgesDataTransform(this.comUserdetImg,'array');
    this.gallery.ref().load(this.comUserdetImg);
    let latLong = this.resultBodyMemActDetails.ActivityLocation.split(",");
    this.lat = Number(latLong[0]);
    this.lng = Number(latLong[1]);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  clickedMarker(infowindow:any) {
    if (this.previous) {
        this.previous.close();
    }
    this.previous = infowindow;
 }

}
