import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'console';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-booth-list',
  templateUrl: './booth-list.component.html',
  styleUrls: ['./booth-list.component.css']
})
export class BoothListComponent implements OnInit {

  filterForm: FormGroup | any;
  filterModelForm: FormGroup | any;
  marathiArray: any;
  englishArray: any;
  districtArray: any;
  assemblyTableArray: any;
  getTotal: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  assemblyListArray: any;
  boothDetailArray: any;
  boothModelObj: any;
  mergeMarathiEnglishArray: any[] = [];
  constituencyNo:any;
  @ViewChild('closeBoothModel') closeBoothModel: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.defaultFilterForm();
    this.boothModelForm();
    this.getDistrict();
    this.getAssemblyTable();
  }

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      DistrictId: [''],
      assemblyId: [''],
    })
  }

  getDistrict() {
    this.callAPIService.setHttp('get', 'Filter/GetAllDistricts?UserId=' + this.commonService.loggedInUserId() + '&StateId=' + 1 + '&DivisionId=' + 0, false, false, false, 'electionMicroServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.districtArray = res.responseData;
        // this.districtArray?.length == 1 ? (this.f['DistrictId'].setValue(this.districtArray[0]?.districtId), this.getTaluka()) : '';
      } else {
        this.districtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getAssemblyList() {
    this.callAPIService.setHttp('get', 'api/BoothDetailsAsync/GetDistrictwiseAssembly?DistrictId=' + (this.filterForm.value.DistrictId || 0), false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.assemblyListArray = res.responseData;
      } else {
        this.assemblyListArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  getAssemblyTable() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'api/BoothDetailsAsync/AssemblyList?DistrictId=' + (this.filterForm.value.DistrictId || 0) + '&AssemblyId=' + (this.filterForm.value.assemblyId || 0)
      + '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.assemblyTableArray = res.responseData?.responseData1;
        this.getTotal = res.responseData.responseData2.totalPages * this.pageSize;
      } else {
        this.spinner.hide();
        this.assemblyTableArray = [];
      }
    }, (error: any) => { this.spinner.hide(); if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getAssemblyTable();
  }

  getBoothDetail(assemblyId: any) {
    this.callAPIService.setHttp('get', 'api/BoothDetailsAsync/GetBoothDetails?AssemblyId=' + assemblyId, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.boothDetailArray = res.responseData;
      } else {
        this.boothDetailArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  assemblyListUpdateArray: any;
  getAssemblyList_Update() { // same Code
    this.callAPIService.setHttp('get', 'api/BoothDetailsAsync/GetDistrictwiseAssembly?DistrictId=' + (this.filterModelForm.value.DistrictId || 0), false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.assemblyListUpdateArray = res.responseData;
      } else {
        this.assemblyListUpdateArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  //.....................................  Booth Model Codel Start Here ............................................//

  get m() { return this.filterModelForm.controls };

  boothModelForm() {
    this.filterModelForm = this.fb.group({
      DistrictId: [''],
      assemblyId: [''],
      marathiFile: [''],
      englishFile: [''], 
    })
  }

  patchboothModel(districtId: any, assemblyId: any) {
    this.clearModelForm();
    this.filterModelForm.patchValue({
      DistrictId: Number(districtId),
      assemblyId: assemblyId,
    })
    this.getAssemblyList_Update();
  }

  uploadExcel(event: any, flag: any) {
    this.constituencyNo = this.assemblyListUpdateArray.find((ele:any)=> ele.assemblyId == this.filterModelForm.value.assemblyId).constituencyNo;
    if (flag == 'marathi') {
      this.UploadFile(event, flag);
    } else {
      this.UploadFile(event, flag);
    }
  }

  ApplyExcelData() {
    if (this.marathiArray?.length && this.englishArray?.length) {
      this.mergeMarathiEnglishArray = [];
      this.marathiArray?.map((ele: any) => {
        this.englishArray?.map((ele1: any) => {
          if (ele.boothListNumber == ele1.boothListNumber) {
            let obj = {
              "voterCount": 0,
              "assemblyId": this.filterModelForm.value.assemblyId,
              "constituencyNo": this.constituencyNo,
              "boothNickName": ele.boothListNumber + '-' + ele.boothMarathiName,

              'boothListNumber': ele.boothListNumber,
              'boothName': ele.boothName,
              'boothEnglishName': ele1.boothEnglishName,
              'poolingStationNameM': ele.poolingStationNameM,
              'poolingStationNameE': ele1.poolingStationNameE,
            }
            this.mergeMarathiEnglishArray.push(obj);
          }
        })
      })
    } else {
      this.marathiArray?.length ? (this.mergeMarathiEnglishArray = [], this.mergeMarathiEnglishArray = this.marathiArray) :
        this.englishArray?.length ? (this.mergeMarathiEnglishArray = [], this.mergeMarathiEnglishArray = this.englishArray) :
          this.toastrService.error('Please Upload Excel');
    }
  }

  UploadFile(event: any, flag: any) {
    let allowedDocTypes = "xlsx,xls";
    const selResult = event.target.value.split('.');
    const docExt = selResult.pop();
    docExt.toLowerCase();
    if (allowedDocTypes.match(docExt)) {
      flag == 'marathi' ? this.marathiArray = [] : this.englishArray = [];
      let fileReader: any = new FileReader();
      fileReader.onload = () => {
        var data = new Uint8Array(fileReader.result);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i)
          arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, { type: "binary" });
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        flag == 'marathi' ? this.marathiArray = XLSX.utils.sheet_to_json(worksheet, { raw: true }) :
          this.englishArray = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        this.filterExcelData(flag);
      };
      fileReader.readAsArrayBuffer(event.target.files[0]);
      flag == 'marathi' ? this.m['marathiFile'].setValue('1') : this.m['englishFile'].setValue('2');
    } else {
      this.toastrService.error('Only Supported file Types...' + allowedDocTypes)
    }
  }

  filterExcelData(flag: any) {
    if (flag == 'marathi') {
      this.marathiArray.shift();
      let header_KeyName = Object.keys(this.marathiArray[0]);
      if (header_KeyName[0] == 'विधानसभा निहाय मतदान केंद्रांची यादी' && header_KeyName[1] == '__EMPTY') {
        this.marathiArray = this.marathiArray?.map((ele: any) => {
          let obj = {

            "voterCount": 0,
            "assemblyId": this.filterModelForm.value.assemblyId,
            "constituencyNo": this.constituencyNo,
            "boothNickName": ele['विधानसभा निहाय मतदान केंद्रांची यादी'],

            'boothListNumber': Number(ele['विधानसभा निहाय मतदान केंद्रांची यादी']?.split('-')[0]?.trim()),
            'boothName': ele['विधानसभा निहाय मतदान केंद्रांची यादी']?.split('-')[1],
            'boothEnglishName': '',
            'poolingStationNameM': ele.__EMPTY,
            'poolingStationNameE': '',
          }
          return ele = obj;
        })
      } else {
        this.m['marathiFile'].setValue(''); this.marathiArray = [];
        this.toastrService.error('Upload Valid Excel'); return;
      }
    } else {
      this.englishArray.shift();
      let header_KeyName = Object.keys(this.englishArray[0]);
      if (header_KeyName[0] == 'Assembly wise List of Polling Stations' && header_KeyName[1] == '__EMPTY') {
        this.englishArray = this.englishArray?.map((ele: any) => {
          let obj = {
            "voterCount": 0,
            "assemblyId": this.filterModelForm.value.assemblyId,
            "constituencyNo": this.constituencyNo,
            "boothNickName": ele['Assembly wise List of Polling Stations'],

            'boothListNumber': Number(ele['Assembly wise List of Polling Stations']?.split('-')[0]?.trim()),
            'boothName': '',
            'boothEnglishName': ele['Assembly wise List of Polling Stations']?.split('-')[1],
            'poolingStationNameM': '',
            'poolingStationNameE': ele.__EMPTY,
          }
          return ele = obj;
        })
      } else {
        this.m['englishFile'].setValue(''); this.englishArray = [];
        this.toastrService.error('Upload Valid Excel'); return;
      }
    }
  }

  clearModelForm() {
    this.m['marathiFile'].setValue('');
    this.m['englishFile'].setValue('');
    this.mergeMarathiEnglishArray = [];
    this.marathiArray = []; this.englishArray = [];
  }

  onSubmit() {
    if (!this.mergeMarathiEnglishArray?.length) {
      this.toastrService.error('Please Add Booth Data');
      return;
    } else {
      this.spinner.show();
      this.callAPIService.setHttp('POST', 'api/BoothDetailsAsync/SaveBoothDetails', false, this.mergeMarathiEnglishArray, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.getAssemblyTable();
          this.closeBoothModel.nativeElement.click();
        } else { this.spinner.hide(); }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
    }
  }

  //.....................................  Booth Model Codel End Here ............................................//

}
