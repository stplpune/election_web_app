import { MapsAPILoader } from '@agm/core';
import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-geo-fance',
  templateUrl: './geo-fance.component.html',
  styleUrls: ['./geo-fance.component.css']
})
export class GeoFanceComponent implements OnInit {
  lat: any = 19.0898177;
  lng: any = 76.5240298;
  zoom = 12;
  map:any;
  constituencyDetailsArray:any;
  drawingManager:any;

  @ViewChild('search') searchElementRef: any;
  createGeofence!: FormGroup;

 constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public dialogRef: MatDialogRef<GeoFanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
   
  }

  ngOnInit(): void {
    console.log(this.data)
    this.defaultcreateGeofenceForm();
  }

    // create geo fance modal 
    defaultcreateGeofenceForm() {
      this.createGeofence = this.fb.group({
        id: [''],
        constituencyId: [''],
        latitude: [''],
        longitude: [''],
        polygonText: [''],
        geofenceTypeId: [''],
        createdBy: [this.commonService.loggedInUserId()],
        distance: [],
      })
    }
  
    get g() { return this.createGeofence?.controls };

  google: any;
  pointList: any;
  selectedArea = 0;
  centerMarker:any;
  centerMarkerLatLng: string = "";
  isShapeDrawn: boolean = false;
  isHide: boolean = false;
  newRecord: any = {
    dataObj: undefined,
    geofenceType: "",
    polygon: undefined,
    circle: undefined,
    quarryPhotos: [],
    polygontext: '',
    radius: undefined
  };
  selectedRecord = {
    dataObj: undefined,
    geofenceData: undefined,
    polygon: undefined,
    circle: undefined,
    quarryPhotos: []
  };
  

  centerMarkerRadius = "";


  onMapReady(map?: any) {

    map.setOptions({ // add satellite view btn
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
      }
    });

    this.isHide = this.data?.isHide || false;
    this.map = map;
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.CIRCLE],
      },
      circleOptions: {
        fillColor: "#00FF00",
        strokeColor: "#00FF00",
        clickable: false,
        editable: true,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: "#00FF00",
        strokeColor: "#00FF00",
        draggable: true,
        editable: true,
        
      },
      map: map
      //drawingMode: google.maps.drawing.OverlayType.POLYGON
    });



    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef?.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          map.setZoom(16);
          map.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
          if (this.centerMarker == undefined) {
            this.centerMarker = new google.maps.Marker({
              map: map,
              draggable: true
            })
            this.centerMarker.addListener('dragend', (evt: any) => {
              this.centerMarkerLatLng = "Long, Lat:" + evt.latLng.lng().toFixed(6) + ", " + evt.latLng.lat().toFixed(6);
              this.centerMarker.panTo(evt.latLng);
            });
          }
          this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
        });
      });
    })

    //self.updatePointList(this.data.selectedRecord.polygonText);

    if (this.data?.selectedRecord && this.data.selectedRecord?.geofenceType == 1) {
      try {
        var OBJ_fitBounds = new google.maps.LatLngBounds();
        const path = this.data.selectedRecord.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
        const existingShape = new google.maps.Polygon({ paths: path, map: map, strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#FF0000", fillOpacity: 0.35, editable: false });
        let latLng = this.FN_CN_poly2latLang(existingShape);
        map.setCenter(latLng); map.fitBounds(OBJ_fitBounds);
        const existingMarker = new google.maps.Marker({ map: map, draggable: false, position: latLng });

        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><h6>Selected Constituency details</h6></td></tr>';
        hc += '<tr><td>Constituency Name</td><td>: ' + (this.data.constituencyDetailsArray.ConstituencyName || "-") + '</td></tr>';
        hc += '<tr><td>No Of Members </td><td>: ' + (this.data.constituencyDetailsArray.NoofMembers || "-") + '</td></tr>';
        hc += "</tbody></table>";
        const info = new google.maps.InfoWindow({
          content: hc
        })
        existingMarker.addListener('click', () => {
          info.open(this.map, existingMarker);
        })

      } catch (e) { }
    }
    if (this.data?.selectedRecord && this.data?.selectedRecord?.geofenceType == 2) {
    
      try {
        let latlng = new google.maps.LatLng(this.data.selectedRecord.polygonText.split(" ")[1], this.data.selectedRecord.polygonText.split(" ")[0]);
        const existingMarker = new google.maps.Marker({ map: map, draggable: false, position: latlng });
        let circle = new google.maps.Circle({
          strokeColor: '#FF0000',
          fillColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.35,
          map: map,
          //position: latlng,
          center: latlng,
          radius: this.data.selectedRecord.distance,
        });
        map.panTo(latlng);
        this.setZoomLevel(this.data.selectedRecord.distance);

        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><h4>Selected Thana details</h4></td></tr>';
        hc += '<tr><td>Thana Name</td><td>: ' + (this.data.selectedRecord.thanaName || "-") + '</td></tr>';
        hc += '<tr><td>Zone Name</td><td>: ' + (this.data.selectedRecord.zoneName || "-") + '</td></tr>';
        hc += "</tbody></table>";

        const info = new google.maps.InfoWindow({
          content: hc
        })
        existingMarker.addListener('click', () => {
          info.open(this.map, existingMarker);
        })

      } catch (e) { }
    }

    this.isHide && this.drawingManager.setDrawingMode(null);
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (e:any) => {
        this.isShapeDrawn = true;
        var newShape = e.overlay;

        if (e.type == 'polygon' || e.type == 'circle') { this.drawingManager.setDrawingMode(null); }

        google.maps.event.addListener(newShape, 'radius_changed', () => {
          this.ngZone.run(() => {
            this.setSelection(newShape, "circle");
          })
        });
        google.maps.event.addListener(newShape, 'dragend', (e:any) => {
          this.ngZone.run(() => {
            this.setSelection(newShape, this.newRecord.geofenceType);
          })
        });

        this.setSelection(newShape, e.type);

      }
    );
  }



  setSelection(shape: any, type: string) {
    this.clearSelection(false);
    type == 'circle' && (this.newRecord.circle = shape, this.newRecord.circle.setMap(this.map), this.newRecord.circle.setEditable(true), this.newRecord.centerMarkerLatLng = this.getLanLongFromCircle(shape), this.newRecord.radius = +shape.getRadius().toFixed(2))
    type == 'polygon' && (this.newRecord.polygon = shape, this.newRecord.polygon.setMap(this.map), this.newRecord.polygon.setEditable(true), this.newRecord.centerMarkerLatLng = this.getCenterLanLongFromPolygon(shape), this.newRecord.radius = 0, this.centerMarkerRadius = '')
    try {
      var ll = new google.maps.LatLng(+this.centerMarkerLatLng.split(',')[1], +this.centerMarkerLatLng.split(',')[0]);
      this.map.panTo(ll);
    }
    catch (e) { }
  }
  clearSelection(isAllClear: any) {
    
    this.newRecord.polygon && (this.newRecord.polygon.setEditable(false), this.newRecord.polygon.setMap(null), this.newRecord.polygon = undefined);
    this.newRecord.circle && (this.newRecord.circle.setEditable(false), this.newRecord.circle.setMap(null), this.newRecord.circle = undefined);
    //$('#Latlng, #geofenceRadius').val("");
    this.centerMarkerLatLng = "";
    this.centerMarkerRadius = "";
    this.newRecord.geofenceType = "";
    this.newRecord.polygontext = "";
    this.newRecord.radius = 0;
    if (this.selectedRecord && !isAllClear) {
      if (this.selectedRecord.geofenceData) {

      }
    }
  }

  deleteSelectedShape() {
    this.clearSelection(false);
  }


  getLanLongFromCircle(circle: any) {
    
    var lat = circle.getCenter().lat().toFixed(8);
    var long = circle.getCenter().lng().toFixed(8);
    this.newRecord.polygontext = long + ' ' + lat;
    this.createGeofence.controls['geofenceTypeId'].setValue(2);
    this.createGeofence.controls['longitude'].setValue(long);
    this.createGeofence.controls['latitude'].setValue(lat);
    return long + ',' + lat;
  }
  getCenterLanLongFromPolygon(polygon: any) {
    let bounds = new google.maps.LatLngBounds();
    var paths = polygon.getPaths();
    this.newRecord.polygontext = "";
    var tempPolygonText: any[] = [];
    paths.forEach(function (path: any) {
      var ar = path.getArray();
      for (var i = 0, l = ar.length; i < l; i++) {
        tempPolygonText[tempPolygonText.length] = ar[i].lng().toFixed(8) + ' ' + ar[i].lat().toFixed(8);
        bounds.extend(ar[i]);
      }
    })
    tempPolygonText[tempPolygonText.length] = tempPolygonText[0];
    this.newRecord.polygontext = tempPolygonText.join();
    this.createGeofence.controls['geofenceTypeId'].setValue(1);
    this.createGeofence.controls['longitude'].setValue(bounds.getCenter().lng().toFixed(8));
    this.createGeofence.controls['latitude'].setValue(bounds.getCenter().lat().toFixed(8));
    return bounds.getCenter().lng().toFixed(8) + ',' + bounds.getCenter().lat().toFixed(8);
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
  removeShape() {
    this.isShapeDrawn = false;
    this.clearSelection(false);
  }
  setZoomLevel(radius: number) {
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
    this.map.setZoom(zoom)
  }


  insertElectionCreateGeofence() {

    let geofenFormData = this.createGeofence.value;
    this.createGeofence.controls['constituencyId'].setValue(this.data.constituencyDetailsArray?.Id);
    this.createGeofence.controls['id'].setValue(this.data.constituencyDetailsArray?.GeofenceId ? this.data.constituencyDetailsArray?.GeofenceId :0);
    this.createGeofence.controls['latitude'].setValue(+geofenFormData?.latitude)
    this.createGeofence.controls['longitude'].setValue(+geofenFormData?.longitude)
    this.createGeofence.controls['distance'].setValue(this.newRecord?.radius)
    this.createGeofence.controls['polygonText'].setValue(this.newRecord?.polygontext)
    this.onNoClick(this.createGeofence.value);
  }

  onNoClick(status?:any): void {
    this.dialogRef.close(status);
  }

}
