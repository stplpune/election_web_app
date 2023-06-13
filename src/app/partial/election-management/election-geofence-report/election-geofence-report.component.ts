import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs/internal/Subscription';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-election-geofence-report',
  templateUrl: './election-geofence-report.component.html',
  styleUrls: ['./election-geofence-report.component.css']
})
export class ElectionGeofenceReportComponent implements OnInit {

  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientId = this.commonService.getlocalStorageData().ClientId;
  map: any;
  geofenceArray: any[] = [];
  isSubElectionApplicable:any;

  constructor(private spinner: NgxSpinnerService,
     private callAPIService: CallAPIService,
     private fb: FormBuilder,
     public commonService: CommonService,
     private router: Router,
    private route: ActivatedRoute,
     ) { }

  ngOnInit(): void {
    this.defaultMainFilterForm();
    this.getElectionName();
  }

  defaultMainFilterForm() {
    this.filterForm = this.fb.group({
      // ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
    })
  }

  getElectionName() {
    let objUrl = this.clientId == 0 ? 'Filter/GetAllElectionMaster?UserId=' + this.commonService.loggedInUserId() : 'Filter/GetElectionMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.clientId;
    this.callAPIService.setHttp('get', objUrl, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName()) : '';
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {
    this.electionNameArray.map((ele: any) => {
      this.filterForm.value.ElectionId == ele.electionId ? this.isSubElectionApplicable = ele.isSubElectionApplicable : '';
    })  
    let objUrl = this.clientId == 0 ? 'Filter/GetAllConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId : 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.clientId + '&ElectionId=' + this.filterForm.value.ElectionId;
    this.callAPIService.setHttp('get', objUrl, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })),this.onFilter()) : '';
      } else {
        this.constituencyNameArray = [];
      }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'electionId') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
    } else if (flag == 'constituencyId') {
    }
    this.onFilter();
  }


  onFilter() {
    this.geofenceArray?.forEach(element => { element?.marker.setMap(null); try { element?.centerMarker.setMap(null); } catch (e) { } });
    this.geofenceArray = [];
    this.spinner.show();
    let ConstituencyId = (this.commonService.checkDataType(this.filterForm.value.ConstituencyId) == true ) ? this.filterForm.value.ConstituencyId : 0
    let obj = this.filterForm.value.ElectionId + '&ConstituencyId=' + ConstituencyId + '&UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.clientId + '&IsSubElectionApplicabel=' + this.isSubElectionApplicable ;
     this.callAPIService.setHttp('get', 'ConstituencyGeofence/GetConstituencyGeofence?ElectionId=' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe({
      next: (data: any) => {
        this.spinner.hide();
        var OBJ_fitBounds = new google.maps.LatLngBounds();
        data?.responseData?.map((x: any) => {
          var infoWindow = new google.maps.InfoWindow({
            content: "<table><tr><td>Election Name</td><td><strong>&nbsp;:&nbsp;" + (x.electionName || "-") + '</strong></td></tr>' +
              "<tr><td>Constituency Name</td><td><strong>&nbsp;:&nbsp;" + (x.constituencyName || "-") + '</strong></td></tr></table>'
               
              // + "<tr><td>Division</td><td><strong>&nbsp;:&nbsp;" + (x.division || "-") + '</strong></td></tr>' +
              // "<tr><td>Contact No.</td><td><strong>&nbsp;:&nbsp;" + (x.contactNo || "-") + '</strong></td></tr>' +
              // "<tr><td>Email Id</td><td><strong>&nbsp;:&nbsp;" + (x.emailId || "-") + '</strong></td></tr>' +
              // "<tr><td>Incharge Name</td><td><strong>&nbsp;:&nbsp;" + (x.inchargeName || "-") + '(' + (x.inchargeContactNo || "-") + ")" + '</strong></td></tr>' +
              // "<tr><td>Long, Lat</td><td><strong>&nbsp;:&nbsp;" + (x.longitude || "-") + ' , ' + x.latitude + '</strong></td></tr>
              
            }); 

          let poly: any;
          let latlng: any;
          if (x.geofenceTypeId == 1) {
            try {
              const path = x.polygonText.split(',').map((x: any) => {
                let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) };
                (data.responseData?.length == 1) && (OBJ_fitBounds.extend(obj))
                return obj
              });
              poly = new google.maps.Polygon({ paths: path, map: this.map, strokeColor: "#00FF00", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#00FF00", fillOpacity: 0.35, editable: false });
              latlng = this.FN_CN_poly2latLang(poly);
            } catch (e) { }
          }
          if (x.geofenceTypeId == 2) {
            try {
              latlng = new google.maps.LatLng(+x.polygonText.split(" ")[1], +x.polygonText.split(" ")[0]);
              poly = new google.maps.Circle({
                strokeColor: '#FF0000',
                fillColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillOpacity: 0.35,
                map: this.map,
                // position: latlng,
                center: latlng,
                radius: x.distance,
              });
            } catch (e) { }
          }

          if (x.geofenceTypeId == 1 || x.geofenceTypeId == 2) {
     
            OBJ_fitBounds.extend(latlng);
            // this.map.panTo(latlng);
            // this.map.setCenter(latlng);

            this.geofenceArray[this.geofenceArray?.length] = {
              marker: poly,
              info: infoWindow,
              type: x.geofenceTypeId,
              radius: x.geofenceTypeId == 2 ? x.distance : 0,
              centerMarker: new google.maps.Marker({
                map: this.map,
                draggable: false,
                position: latlng
              }),
            }
          }
        });
        this.map.fitBounds(OBJ_fitBounds);
        var currWindow: any = false;
        this.geofenceArray.map((currentDetails) => {
          currentDetails.centerMarker.addListener('click', () => {
            if (currWindow) {
              currWindow.close();
            }
            currWindow = currentDetails.info;
            currentDetails.info.open(this.map, currentDetails.centerMarker);
          });
        });
        this.geofenceArray.length == 1 && (this.geofenceArray[0].type == 2 && (this.setZoomLevel(this.geofenceArray[0].radius)))
      },
      error: (err: any) => {
        this.spinner.hide();
        //alert(err);
      }
    })
  }

  setZoomLevel(radius: number) {
    console.log(radius);
    let zoom = 8;
    if (radius < 500) {
      zoom = 16;
    }
    else if (radius < 1000) {
      zoom = 14;
    }
    else if (radius < 2000) {
      zoom = 14;
    }
    else if (radius < 3000) {
      zoom = 12;
    }
    else if (radius < 5000) {
      zoom = 10;
    }
    else if (radius < 15000) {
      zoom = 10;
    }
    console.log(zoom);
    this.map.setZoom(zoom)
  }

  FN_CN_poly2latLang(poly: any) {
    var lowx,
      highx,
      lowy,
      highy,
      lats = [],
      lngs = [],
      vertices = poly.getPath();
    for (var i = 0; i < vertices.length; i++) {
      lngs.push(vertices.getAt(i).lng());
      lats.push(vertices.getAt(i).lat());
    }
    lats.sort();
    lngs.sort();
    lowx = lats[0];
    highx = lats[vertices.length - 1];
    lowy = lngs[0];
    highy = lngs[vertices.length - 1];
    const center_x = lowx + ((highx - lowx) / 2);
    const center_y = lowy + ((highy - lowy) / 2);
    return (new google.maps.LatLng(center_x, center_y));
    //return center_x + ' ' + center_y
  }

  
  onMapReady(map?: any) {
    this.map = map;
    // this.onFilter();
  }

}
