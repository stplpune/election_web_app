import { Component, OnInit, ViewChild, NgZone, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { GeoFanceComponent } from '../../dialogs/geo-fance/geo-fance.component';
import { debounceTime } from 'rxjs/operators';
import { MapsAPILoader } from '@agm/core';

declare var $: any
declare const google: any;

@Component({
  selector: 'app-create-constitueny',
  templateUrl: './create-constitueny.component.html',
  styleUrls: ['./create-constitueny.component.css']
})
export class CreateConstituenyComponent implements OnInit {

  defaultNoMembers = 0;
  submitted: boolean = false;
  submittedCreGeofence: boolean = false;
  electionTypeArray: any;
  addconstituencyArray: any[] = [];
  allembers = [{ id: 0, name: "Single" }, { id: 1, name: "Multiple" }];
  subConstituencyArray = [{ id: 1, name: "Yes" }, { id: 0, name: "No" }];
  constituencyDetailsArray: any;
  createConstituencyForm!: FormGroup;
  filterForm!: FormGroup;
  noOfMembersDiv: boolean = false;
  subConstituencyDivHide: boolean = false;
  electionName: any;
  constituencyArray: any;
  subConsArray: any;
  addSubConstituencyArray: any = [];
  subConstituencyTableDiv: boolean = false;
  index: any;
  subject: Subject<any> = new Subject();
  searchFilter: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  constituencynName: any;
  constId: any;
  total: any;
  btnText = "Create Constituency";
  highlightedRow: any;
  prevArrayData: any;
  SubElectionName: any;
  data:any;
  geoCoder: any;
  createGeofence!: FormGroup;
  ploygonGeofecneArr: any[] = [];
  geofenceCircleArr: any[] = [];
  markers: any[] = [];
  map: any;
  ltlg: any;
  drawingManager: any;
  selectedShape: any;
  Village_City_marker: any;
  disabledgeoFance: boolean = true;
  disabledLatLong: boolean = true;
  disabledKml: boolean = true;
  defaultMapData: any;
  geoFanceConstituencyId: any;
  getGeofenceTypeId: any;
  ElectionId: any;
  geoFanceselData:any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
    let getlocalStorageData: any = localStorage.getItem('ElectionId');
    this.ElectionId = JSON.parse(getlocalStorageData);
  }

  ngOnInit(): void {
    this.defaultConstituencyForm();
    this.defaultFilterForm();
    this.getElection();
    this.getConstituency();
    this.searchFilters('false');
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
    });
  }

  defaultConstituencyForm() {
    this.createConstituencyForm = this.fb.group({
      Id: [0],
      ElectionId: ['' || this.ElectionId, Validators.required],
      ConstituencyName: ['', [Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&-._@#%*!+"\'\/\\]\\]{}][a-zA-Z0-9&-._@#%\\s]+$')]],
      Members: [0],
      NoofMembers: [''],
      IsSubConstituencyApplicable: [0],
      StrSubElectionId: [''],
      subEleName: [''],
      subEleConstName: [''],
    })
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ElectionNameId: [0 || this.ElectionId],
      Search: [''],
    })
  }

  get f() { return this.createConstituencyForm?.controls };

  getElection() {
    this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.electionName = res.data1;
        this.SubElectionName = res.data1;
      } else {
        this.electionName = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  selectGetElection() {
    this.SubElectionName = this.electionName.filter((ele: any) => {
      if (ele.Id != this.createConstituencyForm.value.ElectionId) {
        return ele;
      }
    })
  }

  getConstituency() {
    let data = this.filterForm.value;
    let eleId: any;
    data.ElectionNameId == undefined || data.ElectionNameId == "" || data.ElectionNameId == null ? eleId = 0 : eleId = data.ElectionNameId
    this.callAPIService.setHttp('get', 'Web_Election_GetConstituency?ElectionId=' + eleId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + data.Search + '&nopage=' + this.paginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.constituencynName = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.constituencynName = [];
        // //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onSubmit() {
    this.validationNoofMembers();
    let formData = this.createConstituencyForm.value;
    if (this.createConstituencyForm.value.IsSubConstituencyApplicable == 1 && this.addSubConstituencyArray.length == 0) {
      this.validationSubElectionForm();
    }
    this.submitted = true;
    if (this.createConstituencyForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if ((formData.NoofMembers < 2) && (formData.Members == 1)) {
      this.toastrService.error("Enter at least 2 Number of Members"); 
      return;
    }
    else if (formData.ConstituencyName.trim() == '' || formData.ConstituencyName == null || formData.ConstituencyName == undefined) {
      this.toastrService.error("Constituency Name can not contain space");
      return;
    }
    else if (formData.IsSubConstituencyApplicable == 1) {
      if (this.addSubConstituencyArray.length == 0) {
        this.toastrService.error("Please Add Sub Constituency");
        return;
      }
    }

    if (formData.IsSubConstituencyApplicable == 1) {
      this.addSubConstituencyArray.map((ele: any) => {
        delete ele['ConstituencyName'];
        delete ele['SubElection'];
        if (ele['SrNo']) {
          delete ele['SrNo'];
        }
        return ele;
      })
      this.subConsArray = JSON.stringify(this.addSubConstituencyArray);
    } else {
      this.subConsArray = "";
    }
    this.spinner.show();
    let id;
    let NoofMembers;
    formData.Id == "" || formData.Id == null ? id = 0 : id = formData.Id;
    // formData.NoofMembers == "" || formData.NoofMembers == null ? NoofMembers = 1 : NoofMembers = formData.NoofMembers;
    formData.Members == 0 ? NoofMembers = 1 : NoofMembers = formData.NoofMembers;
    // this.subConsArray ? this.subConsArray : this.subConsArray = "";
    let obj = id + '&ElectionId=' + formData.ElectionId + '&ConstituencyName=' + escape(formData.ConstituencyName) + '&Members=' + formData.Members +
      '&NoofMembers=' + NoofMembers + '&IsSubConstituencyApplicable=' + formData.IsSubConstituencyApplicable + '&CreatedBy=' + this.commonService.loggedInUserId() + '&StrSubElectionId=' + this.subConsArray;
    this.callAPIService.setHttp('get', 'Web_Insert_ElectionConstituency?Id=' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        if (res.data1[0].Id != 0 && this.geoFanceselData) {// call geoface  
          if (this.geoFanceselData.latitude != "" && this.geoFanceselData.longitude != "") {
            this.geoFanceselData['constituencyId'] = res.data1[0].Id;
            this.geoFanceselData
            this.insElectionCreateGeofence();
          }
        }

        this.spinner.hide();
        if (res.data1[0].Msg == "Constituency Name already Registerd") {
          this.toastrService.error("Constituency Name is already registered");
          
        } else {
          this.toastrService.success(res.data1[0].Msg);
        }
        this.btnText = "Create Constituency";
        this.resetConstituencyName();
        this.getConstituency();
      } else {
        this.spinner.hide();
        //  //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    });
  }

  patchCreateConstituency(data: any) {
    this.highlightedRow = data.Id;
    this.btnText = 'Update Constituency';
    data.Members == 1 ? this.noOfMembersDiv = true : this.noOfMembersDiv = false;
    data.IsSubConstituencyApplicable == 1 ? (this.subConstituencyDivHide = true, this.subConstituencyTableDiv = true) : (this.subConstituencyDivHide = false, this.subConstituencyTableDiv = false);
    this.createConstituencyForm.patchValue({
      Id: data.Id,
      ElectionId: data.ElectionId,
      ConstituencyName: data.ConstituencyName,
      Members: data.Members,
      NoofMembers: data.NoofMembers,
      IsSubConstituencyApplicable: data.IsSubConstituencyApplicable,
    });
  }

  resetConstituencyName() {
    this.submitted = false;
    this.ngOnDestroy();
    this.addSubConstituencyArray = [];
    this.subConsTableHideShowOnArray();
    this.defaultConstituencyForm();
    this.subConstituencyDivHide = false;
    this.noOfMembersDiv = false;
    this.btnText = 'Create Constituency';
  }

  GetConstituencyName(ElectionId: any) {
    // if(typeof(ElectionId) == 'number'){
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.constituencyArray = res.data1;
      } else {
        this.constituencyArray = [];
        this.toastrService.error("Constituency is not added for the Election");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
    // }
  }

  editConstituency(masterId: any) {//Edit api
    this.geoFanceConstituencyId = masterId;
    // this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyDetails?ConstituencyId=' + masterId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyDetailsArray = res.data1[0];
        res.data2 == "" || res.data2 == null || res.data2 == undefined ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray = res.data2;
        this.patchCreateConstituency(this.constituencyDetailsArray);

        this.data = {
          "newRecord": {
              "latLng": "",
              "polygonText": "",
              "geofenceType": 0,
              "radius": 0
          },
          "selectedRecord": {
              "latitude": this.constituencyDetailsArray?.Latitude,
              "longitude": this.constituencyDetailsArray?.Longitude,
              "polygonText": this.constituencyDetailsArray?.Geofencepath,
              "geofenceType": this.constituencyDetailsArray?.GeofenceTypeId,
              "distance":  this.constituencyDetailsArray?.Distance,
          },
          "alreadyExistMapAryObj": [],
          "isHide": false
      }
      } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  subConstituencyRadiobtn(subEleId: any) {
    if (subEleId == 1) {
      this.subConstituencyDivHide = true;
      this.subConstituencyTableDiv = true;
      this.prevArrayData?.length != 0 ? this.addSubConstituencyArray = this.prevArrayData : this.addSubConstituencyArray = [];
    } else {
      this.prevArrayData = this.addSubConstituencyArray;
      this.addSubConstituencyArray = [];
      this.subConstituencyTableDiv = false;
      this.subConstituencyDivHide = false;
    }
    this.createConstituencyForm.value.Id == 0 ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray;
    (this.createConstituencyForm.value.Id != 0 && this.constituencyDetailsArray.IsSubConstituencyApplicable == 0) ? this.addSubConstituencyArray = [] : this.addSubConstituencyArray;
  }

  addSubConstituency() {
    let electionNameByEleId: any;
    let subElectionNameBySubEleId: any;
    this.electionName.find((ele: any) => { // find election name by ele id
      if (this.createConstituencyForm.value.subEleName == ele.Id) {
        electionNameByEleId = ele.ElectionName;
      }
    });

    this.constituencyArray.find((ele: any) => { // find sub election name by sub ele id
      if (this.createConstituencyForm.value.subEleConstName == ele.id) {
        subElectionNameBySubEleId = ele.ConstituencyName;
      }
    });

    let arrayOfObj = this.subConstArrayCheck(this.createConstituencyForm.value.subEleName, this.createConstituencyForm.value.subEleConstName);
    if (arrayOfObj == false) {
      this.addSubConstituencyArray.push({ 'SubElectionId': this.createConstituencyForm.value.subEleName, 'SubConstituencyId': this.createConstituencyForm.value.subEleConstName, 'SubElection': electionNameByEleId, 'ConstituencyName': subElectionNameBySubEleId });
    } else {
      this.toastrService.error("Election Name and Constituency Name	already exists");
    }

    this.createConstituencyForm?.controls.subEleName.reset();
    this.createConstituencyForm?.controls.subEleConstName.reset();
    this.subConsTableHideShowOnArray();
  }

  subConstArrayCheck(eleName: any, subEleCostName: any) {
    return this.addSubConstituencyArray.some((el: any) => {
      return el.SubElectionId === eleName && el.SubConstituencyId === subEleCostName;
    });
  }

  selMembers(id: any) {
    id == 1 ? this.noOfMembersDiv = true : this.noOfMembersDiv = false;
  }

  validationNoofMembers() {
    if (this.createConstituencyForm.value.Members == 1) {
      this.createConstituencyForm?.controls["NoofMembers"].setValidators([Validators.required,Validators.pattern('^[1-9][0-9]{0,2}$')]);
      this.createConstituencyForm?.controls["NoofMembers"].updateValueAndValidity();
      this.createConstituencyForm?.controls["NoofMembers"].clearValidators();
    }
    else {
      this.createConstituencyForm?.controls["NoofMembers"].clearValidators();
      this.createConstituencyForm?.controls["NoofMembers"].updateValueAndValidity();
    }
  }

  validationSubElectionForm() {
    if (this.createConstituencyForm.value.IsSubConstituencyApplicable == 1) {
      this.createConstituencyForm?.controls["subEleName"].setValidators(Validators.required);
      this.createConstituencyForm?.controls["subEleConstName"].setValidators(Validators.required);
      this.createConstituencyForm?.controls["subEleName"].updateValueAndValidity();
      this.createConstituencyForm?.controls["subEleConstName"].updateValueAndValidity();
      this.createConstituencyForm?.controls["subEleName"].clearValidators();
      this.createConstituencyForm?.controls["subEleConstName"].clearValidators();
    }
    else {
      this.createConstituencyForm?.controls["subEleName"].clearValidators();
      this.createConstituencyForm?.controls["subEleName"].updateValueAndValidity();
      this.createConstituencyForm?.controls["subEleConstName"].clearValidators();
      this.createConstituencyForm?.controls["subEleConstName"].updateValueAndValidity();
    }
  }

  delConfirmation(index: any) { //subElection data remove
    this.index = index;
    this.deleteConfirmModel('subElectionDelFlag');
  }

  deleteConfirmModel(flag: any) {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        if (flag == 'electionMasterDelFlag') {
          this.deleteElectionMasterData();

        } else {
          this.addSubConstituencyArray.splice(this.index, 1);
          this.subConsTableHideShowOnArray();
        }
      }
    });
  }

  delConfirmEleMaster(event: any) { //Election Master data remove
    this.constId = event;
    this.deleteConfirmModel('electionMasterDelFlag');
  }

  subConsTableHideShowOnArray() {
    this.ElectionId = '';
    this.addSubConstituencyArray.length != 0 ? this.subConstituencyTableDiv = true : this.subConstituencyTableDiv = false; // hide div on array

  }

  deleteElectionMasterData() {
    this.callAPIService.setHttp('get', 'Web_Election_Delete_Constituency?ConstituencyId=' + this.constId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.resetConstituencyName();
        this.getConstituency();
      } else {
        this.toastrService.error('Something went wrong please try again');
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getConstituency();
  }

  ngOnDestroy() {
    localStorage.removeItem('ElectionId');
  }

  // filter form 

  filterData() {
    this.paginationNo = 1;
    this.getConstituency();
    this.resetConstituencyName();
  }

  clearFilter(flag: any) {
    if (flag == 'electionName') {
      this.filterForm?.controls['ElectionNameId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm?.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getConstituency();
    this.resetConstituencyName();
  }

  onKeyUpFilter() {
    this.subject.next();
    this.resetConstituencyName();
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.Search == "" || this.filterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchFilter = this.filterForm.value.Search;
        this.paginationNo = 1;
        this.getConstituency();
      }
      );
  }

  // ----------------------------------agm map start  coading here ----------------------------------------------//
  openGeoFence() {
    let fromData = this.createConstituencyForm.value;
    if(fromData.ElectionId == "" || fromData.ConstituencyName == ""){
      this.toastrService.error("Election Name and Constituency Name is required");
      return
    }
    
    this.btnText == "Create Constituency" ? this.data = "" :this.data['constituencyDetailsArray'] = this.constituencyDetailsArray;
    const dialogRef = this.dialog.open(GeoFanceComponent,{ 
      width: '950px',
      data: this.data,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
       this.geoFanceselData = result;
        // this.editConstituency(this.geoFanceConstituencyId)
      }
    });
  }

  insElectionCreateGeofence(){
    this.callAPIService.setHttp('post', 'ClientMasterWebApi/ConstituencyGeofence/Create', false,  this.geoFanceselData, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.statusCode == '200') {
        // this.toastrService.success(res.statusMessage);
        this.geoFanceselData="";
      } else {
        this.toastrService.error(res.statusMessage);
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
}

