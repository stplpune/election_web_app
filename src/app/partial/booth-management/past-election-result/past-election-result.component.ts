import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-past-election-result',
  templateUrl: './past-election-result.component.html',
  styleUrls: ['./past-election-result.component.css']
})
export class PastElectionResultComponent implements OnInit {

  filterForm!: FormGroup;
  uploadElectionForm!: FormGroup;
  ConstituencyTypeArray = [{ id: 1, name: 'Parlimentary Constituency' }, { id: 2, name: 'Assembly Constituency' }]

  electionArray: any = [];
  constituencyArray: any = [];
  electionResultArray: any = [];
  candidatesDetailsArray: any = [];
  selectedCandidateDetails: any
  localStorageData = this.commonService.getlocalStorageData();
  pageNo: number = 1;
  pageSize: number = 10;
  getTotalPages: any;
  filterExcleDataArray: any = [];
  excleDataArray: any = [];
  isConstituencyDisabled = false;

  electionName: any;
  excelSampleFileName = '../../../../assets/sample Excel/sampleForParlimentaryConstituency.xlsx';
  noDataFoundMsg = 'Select Above Filters To View Data!'

  @ViewChild('excleUpload') excleUpload!: ElementRef;
  @ViewChild('closeElectionModel') closeElectionModel!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private callAPIService: CallAPIService,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
  ) { }

  ngOnInit(): void {
    this.defultForm();
    this.electionForm()
    this.bindElection();
    this.bindConstituency();
  }

  defultForm() {
    this.filterForm = this.fb.group({
      constituencyType: [1],
      electionId: [''],
      constituencyId: ['']
    })
  }

  electionForm() {
    this.uploadElectionForm = this.fb.group({
      electionId: [''],
      constituencyId: [''],
      excleData: ['']
    })
  }


  bindElection() {
    this.electionResultArray = [];
    let id = this.filterForm.value.constituencyType == 1 ? 2 : 3
    let url = `UserId=${this.localStorageData.Id}&ClientId=${this.localStorageData.ClientId}&StateId=${this.localStorageData.StateId}`

    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/GetPastElectionName?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200" && res.responseData.length) {
        this.electionArray = res.responseData.filter((res: any) => res.electionTypeId == id);
      } else {
        this.electionArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  bindConstituency() {
    this.constituencyArray = [];
    let url = `UserId=${this.localStorageData.Id}&ClientId=${this.localStorageData.ClientId}&StateId=${this.localStorageData.StateId}&FilterTypeId=${this.filterForm.value.constituencyType}`

    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/BoothCommitteeFormation_Map_ConsituencyDropdown?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200" && res.responseData?.length) {
        this.constituencyArray = res.responseData;
      } else {
        this.constituencyArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }


  getTableData() {
    let formdata = this.filterForm.value;
    if (!formdata.electionId) { this.toastrService.error('Please Select Election'); return };
    this.spinner.show();
    let url = `flag=${formdata.constituencyType}&AssemblyId=${formdata.constituencyId || 0}&ElectionId=${formdata.electionId}&pageNo=${this.pageNo}&pageSize=${this.pageSize}`

    this.callAPIService.setHttp('get', 'api/ElectionResultDetails/GetAllDistinctList?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData?.responseData1 != null && res.statusCode == "200" && res.responseData?.responseData1?.length) {
        this.spinner.hide();
        this.electionResultArray = res.responseData?.responseData1;
        this.getTotalPages = res.responseData?.responseData2?.totalCount;       
      } else {
        this.spinner.hide();
        this.electionResultArray = [];
        this.noDataFoundMsg = 'No Results Found!';
      }
    }, (error: any) => { this.spinner.hide(); if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  onClickPagintion(pageNo: number) {
    this.pageNo = pageNo;
    this.getTableData();
  }
  onConstituencyChange() {
    this.noDataFoundMsg = 'Select Above Filters To View Data!'
    this.bindElection();
    this.bindConstituency();
    if(this.filterForm.value.constituencyType == 1){
      this.excelSampleFileName = '../../../../assets/sample Excel/sampleForParlimentaryConstituency.xlsx'
    }else{
      this.excelSampleFileName = '../../../../assets/sample Excel/sampleForAssemblyConstituency.xlsx'
    }
  }
  onRemoveElection() {
    this.noDataFoundMsg = 'Select Above Filters To View Data!'
    this.filterForm.controls['constituencyId'].setValue('');
    this.electionResultArray = [];
    this.getTableData();
  }

  viewCandidatesDetails(obj: any) {
    this.selectedCandidateDetails = obj;
    let url = `ElectionId=${this.filterForm.value.electionId}&ConstituencyId=${obj.constituencyId}`;
    this.callAPIService.setHttp('get', 'api/ElectionResultDetails/GetElectionResultDetailsById?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200" && res.responseData?.length) {
        this.candidatesDetailsArray = res.responseData;
      } else {
        this.candidatesDetailsArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })

  }

  onAction() {
    this.uploadElectionForm.controls['electionId'].setValue(this.filterForm.value.electionId);
    //this.uploadElectionForm.controls['constituencyId'].setValue(this.filterForm.value.constituencyId);
    // this.uploadElectionForm.value.constituencyId ? this.isConstituencyDisabled = true :this.isConstituencyDisabled = false;
    this.electionName = this.electionArray.find((res: any) => res.electionId == this.uploadElectionForm.value.electionId).electionName
  }

  uploadExcel(event: any) {
    let allowedDocTypes = "xlsx,xls";
    const selResult = event.target.value.split('.');
    const docExt = selResult.pop();
    docExt.toLowerCase();
    if (allowedDocTypes.match(docExt)) {
      this.excleDataArray = [];
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
        this.excleDataArray = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        let keysOfPC: any = [];
        if (this.filterForm.value.constituencyType == 1) {
          keysOfPC = Object.values(this.excleDataArray[1])
        }
        let validExcel = true;
        let keynames = this.filterForm.value.constituencyType == 2 ? ['Candidate Name', 'SL.No', 'Total Vote'] : ['State Name', 'PC NAME', 'CANDIDATES NAME', 'SEX', 'AGE', 'CATEGORY', 'PARTY NAME', 'PARTY SYMBOL', 'GENERAL', 'POSTAL', 'TOTAL', 'OVER TOTAL ELECTORS IN CONSTITUENCY', 'OVER TOTAL VOTES POLLED IN CONSTITUENCY', 'Total Electors', 'Constitiency No']
        this.excleDataArray.map((res: any) => {
          if (this.filterForm.value.constituencyType == 2) {
            if (!validExcel) { return }
            if (Object.keys(res).length != 1 && res['Candidate Name'] != 'Total') {
              for (let key of keynames) {
                if (key in res) { validExcel = true }
                else { validExcel = false; break; }
              }
            }
          } else {
            for (let i = 0; i < keysOfPC.length; i++) {
              if (!keynames.includes(keysOfPC[i].toString()?.trim())) {
                validExcel = false;
                break
              }
            }
          }
        })
        if (!validExcel) {
          this.toastrService.error('Upload Valid Excel');
          this.onClearElection();
          return
        }
        this.filterForm.value.constituencyType == 2 ? this.filterExcelDataAC() : this.filterExcelDataPC();
      };
      fileReader.readAsArrayBuffer(event.target.files[0]);
      // fileReader.readAsBinaryString(event.target.files[0]);

    } else {
      this.toastrService.error('Only Supported file Types...' + allowedDocTypes)
    }
  }

  filterExcelDataPC() {
    console.log(this.excleDataArray);
    
    this.excleDataArray.map((res: any, i: any) => {
      let noOfKeys = Object.keys(res);
      if (noOfKeys.length == 15 && i != 1) {
        let obj = {
          //  srNo: count,
          candidateName: res.__EMPTY_2,
          constituencyName: res.__EMPTY_1,
          totalVote: res.__EMPTY_10,
          partyName: res.__EMPTY_6,
          constituencyNo: res.__EMPTY
        }
        this.filterExcleDataArray.push(obj);
      }
    })
  }

  filterExcelDataAC() {
    let constituency_Name = '';
    this.excleDataArray.map((res: any) => {
      let noOfKeys = Object.keys(res);
      if (noOfKeys.length == 1) {
        constituency_Name = res['SL.No'];
      } else {
        // debugger
        let from = res['Candidate Name']?.lastIndexOf('(');
        let to = res['Candidate Name']?.lastIndexOf(')')
        let obj = {
          // srNo: res['SL.No'],
          candidateName: res['Candidate Name'],
          constituencyName: constituency_Name,
          totalVote: res['Total Vote'],
          partyName: res['Candidate Name']?.substring(from + 1, to),
          constituencyNo: constituency_Name?.split('-')[0]
        }
        if (res['Candidate Name'] != 'Total') { this.filterExcleDataArray.push(obj) }
      }
    })
    //  this.filterExcleDataArray.sort((res:any, ele:any)=> ele.totalVote - res.totalVote)
  }

  onClearElection() {
    this.filterExcleDataArray = [];
    this.excleDataArray = [];
    this.uploadElectionForm.controls['excleData'].setValue('');
    this.excleUpload.nativeElement = '';
  }

  saveElection() {
    if (!this.filterExcleDataArray.length) {
      this.toastrService.error('Please Upload Excel');
      return
    }
    this.spinner.show();
    let submitArray: any = [];
    this.filterExcleDataArray.map((res: any) => {
      let obj = {
        id: 0,
        candidateName: res.candidateName,
        partyName: res.partyName,
        partyId: 0,
        totalVotes: +res.totalVote,
        isWinner: 0,
        winningMargin: 0,
        electionId: +this.uploadElectionForm.value.electionId,
        constituencyId: +this.filterForm.value.constituencyId || 0,
        createdBy: this.localStorageData.Id,
        constituencyNo: res.constituencyNo.toString(),
        constituencyTypeId: this.filterForm.value.constituencyType,
        stateId: this.localStorageData.StateId
      }
      submitArray.push(obj)
    });

    this.callAPIService.setHttp('POST', 'api/ElectionResultDetails/AddElectionResultDetails', false, submitArray, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        this.closeElectionModel.nativeElement.click();
        this.pageNo = 1;
        this.getTableData();
      } else { this.spinner.hide(); this.toastrService.error(res.statusMessage); }
    }, (error: any) => {
      this.spinner.hide();
      this.router.navigate(['../500'], { relativeTo: this.route });
    })
  }

}
