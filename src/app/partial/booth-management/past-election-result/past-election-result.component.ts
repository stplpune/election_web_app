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

  filterExcleDataArray: any = [];
  excleDataArray: any = [];
  isConstituencyDisabled = false;

  electionName:any;

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
    let url = `UserId=${this.localStorageData.Id}&ClientId=${this.localStorageData.ClientId}&StateId=${this.localStorageData.StateId}`

    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/GetPastElectionName?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.electionArray = res.responseData;
      } else {
        this.electionArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  bindConstituency() {
    let url = `UserId=${this.localStorageData.Id}&ClientId=${this.localStorageData.ClientId}&StateId=${this.localStorageData.StateId}&FilterTypeId=${this.filterForm.value.constituencyType}`

    this.callAPIService.setHttp('get', 'api/BoothCommitteeDashboard/BoothCommitteeFormation_Map_ConsituencyDropdown?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.constituencyArray = res.responseData;
      } else {
        this.constituencyArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }


  getTableData() {
    let formdata = this.filterForm.value;
    if (!formdata.electionId) {this.toastrService.error('Please Select Election'); return }
    let url = `flag=${formdata.constituencyType}&AssemblyId=${formdata.constituencyId || 0}&ElectionId=${formdata.electionId}`

    this.callAPIService.setHttp('get', 'api/ElectionResultDetails/GetAllDistinctList?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData.responseData1 != null && res.statusCode == "200") {
        this.electionResultArray = res.responseData.responseData1;
      } else {
        this.electionResultArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })
  }

  onRemoveElection() {
    this.filterForm.controls['constituencyId'].setValue('');
    this.electionResultArray = [];
    this.getTableData();
  }
  
  viewCandidatesDetails(obj: any) {
    this.selectedCandidateDetails = obj;
    let url = `ElectionId=${obj.electionId}&ConstituencyId=${obj.constituencyId}`;
    this.callAPIService.setHttp('get', 'api/ElectionResultDetails/GetElectionResultDetailsById?' + url, false, false, false, 'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.candidatesDetailsArray = res.responseData;
      } else {
        this.candidatesDetailsArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.route }) } })

  }

  onAction() {
    this.uploadElectionForm.controls['electionId'].setValue(this.filterForm.value.electionId);
    this.uploadElectionForm.controls['constituencyId'].setValue(this.filterForm.value.constituencyId);
    this.uploadElectionForm.value.constituencyId ? this.isConstituencyDisabled = true :this.isConstituencyDisabled = false;
    this.electionName = this.electionArray.find((res:any)=> res.electionId == this.uploadElectionForm.value.electionId).electionName   
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
        console.log(this.excleDataArray);
        let validExcel = true;
        let keynames = ['Candidate Name','SL.No','Total Vote']
        this.excleDataArray.map((res:any)=>{
          if(Object.keys(res).length != 1 && res['Candidate Name'] != 'Total'){
            if (!validExcel) {return }
            for(let key of keynames){
              if(key in res){validExcel = true}
              else{validExcel = false;break;}
            }
          }
          
        })
        if(!validExcel){
          this.toastrService.error('Upload Valid Excle');
          this.onClearElection()
        }
      };
      fileReader.readAsArrayBuffer(event.target.files[0]);
    } else {
       this.toastrService.error('Only Supported file Types...' + allowedDocTypes)
    }
  }

  filterExcelData() {
    let constituency_Name = '';
    this.excleDataArray.map((res: any) => {
      let noOfKeys = Object.keys(res);
      if (noOfKeys.length == 1) {
        constituency_Name = res['SL.No'];
      } else {
        let obj = {
          srNo: res['SL.No'],
          candidateName: res['Candidate Name'],
          constituencyName: constituency_Name,
          totalVote: res['Total Vote']
        }       
        if (res['Candidate Name'] != 'Total') { this.filterExcleDataArray.push(obj) }
      }
    })
    this.filterExcleDataArray.sort((res:any, ele:any)=> ele.totalVote - res.totalVote)
  }

  onClearElection() {
    this.filterExcleDataArray = [];
    this.excleDataArray = [];
    this.uploadElectionForm.controls['excleData'].setValue('');
    this.excleUpload.nativeElement = '';
  }

  saveElection(){
    this.spinner.show();
    let submitArray:any=[];
      this.filterExcleDataArray.map((res:any)=>{
        let obj={
          id: 0,
          candidateName: res.candidateName,
          partyName: "",
          partyId: 0,
          totalVotes: +res.totalVote,
          isWinner: 0,
          winningMargin: 0,
          electionId: +this.uploadElectionForm.value.electionId,
          constituencyId: +this.uploadElectionForm.value.constituencyId,
          createdBy: this.localStorageData.Id
        }
        submitArray.push(obj)
      });

      this.callAPIService.setHttp('POST', 'api/ElectionResultDetails/AddElectionResultDetails', false, submitArray, false, 'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.closeElectionModel.nativeElement.click();
        } else { this.spinner.hide();this.toastrService.error(res.statusMessage); }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      })
  }

}
