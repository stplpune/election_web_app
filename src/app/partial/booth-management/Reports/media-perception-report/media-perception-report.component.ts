import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { Gallery, GalleryItem} from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';
import { ImageItem } from '@ngx-gallery/core';

@Component({
  selector: 'app-media-perception-report',
  templateUrl: './media-perception-report.component.html',
  styleUrls: ['./media-perception-report.component.css']
})
export class MediaPerceptionReportComponent implements OnInit {

  clientNameArray: any;
  filterForm!: FormGroup;
  electionNameArray: any;
  constituencyNameArray: any;
  clientWiseBoothListArray: any;
  villageDropdown: any;
  dataNotFound: boolean = false;
  perceptionSummeryArray: any;

  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  subject: Subject<any> = new Subject();
  searchText= new FormControl('');
  boothwisePerceptionReportArray:any;

  getTotalPerDetail: any;
  paginationNoPerDetail: number = 1;
  pageSizePerDetail: number = 10;
  subjectPerDetail: Subject<any> = new Subject();
  searchTextPerDetail= new FormControl('');
  perceptionDetailsReportArray:any;
  voter_Id:any;
  mobile_No:any;
  hideDivPerDetail:boolean = false;
  highlightRow:any;
  checkHighlightRow:any;
  supportToId = 0;
  followupStatusDropDownData = [{ id: 1, name: 'Supporter', class: 'text-success' }, { id: 2, name: 'Opponent', class: 'text-danger' }, { id: 3, name: 'Neutral', class: 'text-info' }]
  getTotalPages: any;
  
  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public gallery: Gallery,
    public lightbox: Lightbox,
  ) { }

  ngOnInit(): void {
    this.defaultMainFilterForm();
    this.getClientName();
    this.getPerceptionSummery();
    this.searchboothwisePerData(); 
    this.searchboothwisePerDetail();
  }

  defaultMainFilterForm() {
    this.filterForm = this.fb.group({
      ClientId: [0],
      ElectionId: [0],
      ConstituencyId: [0],
      village: [0],
      getBoothId: [0],
    })
  }

  getClientName() {
    this.nullishFilterForm(); 
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetClientMaster?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientNameArray = res.responseData;
        this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].clientId }), this.getElectionName()) : '';
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getElectionName() {
    this.nullishFilterForm();     
    this.spinner.show();
    let obj = 'UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Filter/GetElectionMaster?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.electionNameArray = res.responseData;
        this.electionNameArray.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.electionNameArray[0].electionId }), this.getConstituencyName()) : '';
      } else {
        this.spinner.hide();
        this.electionNameArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getConstituencyName() {
    this.nullishFilterForm();      
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetConstituencyMaster?UserId=' + this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.constituencyNameArray = res.responseData;
        this.constituencyNameArray.length == 1 ? ((this.filterForm.patchValue({ ConstituencyId: this.constituencyNameArray[0].constituencyId })), this.dataNotFound = true, this.getVillageData()) : '';
      } else {
        this.constituencyNameArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getVillageData() {
    this.getPerceptionSummery(); 
    this.ClientWiseBoothList();
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetVillageMasters?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.villageDropdown = res.responseData;
      } else {
        this.villageDropdown = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  ClientWiseBoothList() {
    this.nullishFilterForm();
    let obj = 'ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId
      + '&VillageId=' + this.filterForm.value.village
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Filter/GetBoothDetailsMater?' + obj, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.clientWiseBoothListArray = res.responseData;
      } else {
        this.clientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue(0);
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue(0);
      this.dataNotFound = false;
    } else if (flag == 'constituencyId') {
      this.filterForm.controls['village'].setValue(0);
      this.filterForm.controls['getBoothId'].setValue(0);
      this.dataNotFound = false;
      this.ClientWiseBoothList();
      this.highlightRow ='';
      this.supportToId = 0 ;
    } else if (flag == 'village') {
      this.filterForm.controls['getBoothId'].setValue(0);
      this.ClientWiseBoothList();
      this.getPerceptionSummery();
      this.highlightRow ='';
      this.supportToId = 0 ;
    }
    this.searchText.setValue('');
  }


  nullishFilterForm() { //Check all value null || undefind || empty 
    let fromData = this.filterForm.value;
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0);
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.village ?? this.filterForm.controls['village'].setValue(0);
    fromData.getBoothId ?? this.filterForm.controls['getBoothId'].setValue(0);
  }

  getPerceptionSummery() {
    this.nullishFilterForm(); 
    this.searchText.setValue('');
    this.getBoothwisePerceptionReport();
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.filterForm.value.getBoothId
    + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetPerceptionSummery?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.perceptionSummeryArray = res.responseData;
       } else { this.perceptionSummeryArray = []; }
    }, (error: any) => {
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  getBoothwisePerceptionReport() {
    this.nullishFilterForm(); 
    this.hideDivPerDetail = false;
    this.spinner.show(); 
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.filterForm.value.getBoothId 
    + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize + '&Search=' + this.searchText.value.trim() + '&SupportToId=' + this.supportToId 
    + '&ElectionId=' + this.filterForm.value.ElectionId + '&ConstituencyId=' + this.filterForm.value.ConstituencyId;
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetBoothwisePerceptionReport?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.boothwisePerceptionReportArray = res.responseData.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
        this.getTotalPages = res.responseData.responseData2.totalPages;
       } else {
        this.spinner.hide();
        this.boothwisePerceptionReportArray = [];
      }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getBoothwisePerceptionReport();
  }

  onKeyUpSearchData() {
    this.subject.next();
  }
  
  searchboothwisePerData() {
    this.subject
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchText.value;
        this.paginationNo = 1;
        this.highlightRow ='';
        this.getBoothwisePerceptionReport();
      }
      );
  }

  clearSearchField(){
    this.searchText.setValue('');
    this.paginationNo = 1;
    this.highlightRow ='';
    this.getBoothwisePerceptionReport();
  }

  getPerceptionDetailsReport(voter_Id:any,mobile_No:any) {
    this.nullishFilterForm(); 
    this.spinner.show(); 
    this.hideDivPerDetail = true;
    this.voter_Id = voter_Id
    this.mobile_No = mobile_No;
    let obj = this.commonService.loggedInUserId() + '&ClientId=' + this.filterForm.value.ClientId + '&BoothId=' + this.filterForm.value.getBoothId
    + '&VoterId=' + this.voter_Id + '&pageno=' + this.paginationNoPerDetail + '&pagesize=' + this.pageSizePerDetail + '&MobileNo=' + this.mobile_No + '&SupportToId=' + this.supportToId + '&Search=' + this.searchTextPerDetail.value.trim()
    this.callAPIService.setHttp('get', 'ClientMasterApp/Dashboard/GetDashbord-GetPerceptionDetailsReport?UserId=' + obj, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.perceptionDetailsReportArray = res.responseData.responseData1;
        this.getTotalPerDetail = res.responseData.responseData2.totalPages * this.pageSizePerDetail;
       } else { this.perceptionDetailsReportArray = []; this.spinner.hide(); }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

  onClickPagintionPerDetail(pageNo: number) {
    this.paginationNoPerDetail = pageNo;
    this.getPerceptionDetailsReport(this.voter_Id,this.mobile_No);
  }

  onKeyUpSearchPerDetail() {
    this.subjectPerDetail.next();
  }
  
  searchboothwisePerDetail() {
    this.subjectPerDetail
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.searchTextPerDetail.value;
        this.paginationNoPerDetail = 1;
        this.getPerceptionDetailsReport(this.voter_Id,this.mobile_No);
      }
      );
  }

  clearSearchPerDetail(){
    this.searchTextPerDetail.setValue(''); 
    this.paginationNoPerDetail = 1;
    this.getPerceptionDetailsReport(this.voter_Id,this.mobile_No);
  }

  showImageLightbox(data: any) {  // Image Gallery Code
    let images = data.map((item: any) =>
    new ImageItem({ src: item.visitPhoto, thumb: item.visitPhoto, text: 'programGalleryImg' }));
    this.gallery.ref('lightbox').load(images);
  }

  redirectToVoterPrfile(obj: any) { //Redirect Voter Profile Page
    window.open('../voters-profile/' + obj.userId + '.' + this.filterForm.value.ClientId + '.' + obj.voterId);
  }


}
