import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
// import { cos } from '@amcharts/amcharts4/.internal/core/utils/Math';
// import { time } from 'console';
// import { $ } from 'protractor';

@Component({
  selector: 'app-assign-booth-to-constituency',
  templateUrl: './assign-booth-to-constituency.component.html',
  styleUrls: ['./assign-booth-to-constituency.component.css']
})
export class AssignBoothToConstituencyComponent implements OnInit {

  assignBoothForm!: FormGroup;
  submitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Assign Booths';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  assemblyArray: any;
  boothListArray: any;
  electionNameArray: any;
  constituencyNameArray: any;
  assignedBoothToElectionArray: any;
  ElectionId: any;
  AssemblyBoothArray: any = [];
  AssemblyId: any;
  assemblyBoothJSON: any;
  boothDivHide: boolean = false;
  ConstiId: any;
  ConstituencyId: any;
  ConstituencyIdArray: any = [];
  boothListMergeArray: any = [];
  assemblyIdArray: any = [];
  AssBoothListDetailArray: any;
  searchAssembly = '';
  searchboothList = '';
  assemblyCheckBoxCheck!: boolean;
  selBoothId: any;
  BoothListDetailData: any;
  globalEditObj:any;
  updateFlag:any;


  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.defaultAssignBoothsForm();
    this.getElection();
    this.defaultFilterForm();
    this.getAssignedBoothToElection();
    this.searchFilters('false');
  }

  //---------------------------------------- left side AssignBoothForm method's  start here -----------------------------------------------// 
  defaultAssignBoothsForm() {
    this.assignBoothForm = this.fb.group({
      Id: [0],
      ElectionId: ['', Validators.required],
      ConstituencyId: ['', Validators.required],
      assembly: [''],
      boothList: [''],
    })
  }

  get f() { return this.assignBoothForm.controls };

  getElection() {
    // this.callAPIService.setHttp('get', 'Web_GetElection?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.setHttp('get', 'Web_Election_Get_ElectionNameHaveConstituency?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.electionNameArray = res.data1;
        if (this.btnText == 'Update Booths' && this.updateFlag == true) {
          this.assignBoothForm.controls['ElectionId'].setValue(this.globalEditObj.ElectionId);
          this.getConstituencyName(this.globalEditObj.ElectionId);
        }
      } else {
        this.electionNameArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getConstituencyName(ElectionId: any) {
    this.callAPIService.setHttp('get', 'Web_Election_Get_ConstituencyName?UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.constituencyNameArray = res.data1;
        if (this.btnText == 'Update Booths' && this.updateFlag == true) {
          this.assignBoothForm.controls['ConstituencyId'].setValue(this.globalEditObj.ConstituencyId);
          this.getAssembly();
        }
      } else {
        this.constituencyNameArray = [];
        this.toastrService.error("Constituency Name is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAssembly() {
    this.callAPIService.setHttp('get', 'Web_Election_GetAssembly?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.assemblyArray = res.data1;
        if (this.btnText == 'Update Booths' && this.updateFlag == true) {
          this.checkBoxCehckAssemblyArray(this.ConstituencyIdArray);
          this.boothDivHide = true;
        }
      } else {}
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getBoothList(AssemblyId: any) {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetBoothList?ConstituencyId=' + AssemblyId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {

      if (res.data == 0) {
        this.spinner.hide();
        this.boothDivHide = true;
        this.boothListArray = res.data1;
        this.boothListArray.map((ele: any) => {
          this.boothListMergeArray.push(ele);
        });

        if (this.btnText == 'Update Booths' && this.updateFlag == true) {
          //on edit get obj by BoothId
           this.AssemblyBoothArray.forEach((element: any, i:any) => {
            this.boothListArray.filter((item: any) => {
              if(element == item.Id){
                this.AssemblyBoothArray[i] = item;
                    this.AssemblyBoothArray[i].BoothId = item.Id;
                    delete this.AssemblyBoothArray[i]['BoothEnglishName'];
                    delete this.AssemblyBoothArray[i]['checked'];
              }
            });
          });
          this.checkBoxCehckBoothArray(this.AssemblyBoothArray);
        }
      } else {
        this.boothListMergeArray.length == 0 ?  this.boothListMergeArray = [] : '';
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  checkBoxCehckAssemblyArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j <this.assemblyArray.length; j++) {
        if (this.assemblyArray[j].Id == Number(ConstituencyId[i])) {
    
          this.assemblyArray[j].checked = true;
          this.getBoothList(Number(ConstituencyId[i]));
        }
      }
    }
  }

  checkBoxCehckBoothArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j < this.boothListArray.length; j++) {
        if (this.boothListArray[j].Id == Number(ConstituencyId[i].Id)) {
          this.boothListArray[j].checked = true;
        }
      }
    }
  }

  onSubmitElection() {
    this.submitted = true;
    let formData = this.assignBoothForm.value;
    if (this.assignBoothForm.invalid) {
      this.spinner.hide();
    }else if (this.AssemblyBoothArray.length == 0  ||  this.AssemblyBoothArray.length == 0){
      this.toastrService.error("Assembly and Booth are required");
      return;
    }
    else {
      this.spinner.show();
      this.assemblyBoothJSON = JSON.stringify(this.AssemblyBoothArray);
      let fromData = new FormData();
      fromData.append('Id',formData.Id);
      fromData.append('ElectionId', formData.ElectionId);
      fromData.append('ConstituencyId', formData.ConstituencyId);
      fromData.append('strAssmblyBoothId', this.assemblyBoothJSON);
      fromData.append('CreatedBy', this.commonService.loggedInUserId());
 
      this.callAPIService.setHttp('post', 'Web_Insert_Election_AssignBoothToElection_Post', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          res.data1[0].Msg == 'Booths already Assigned to this Election and Constituency' ? this.toastrService.error(res.data1[0].Msg) : this.toastrService.success(res.data1[0].Msg);
          this.assemblyArray = [];
          this.AssemblyBoothArray = [];
          this.boothDivHide = false;
          this.getAssignedBoothToElection();
          this.spinner.hide();
          this.clearForm();
          this.submitted = false;
          this.btnText = 'Assign Booths';
          this.boothListMergeArray = [];
        } else {
          this.spinner.hide();
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  clearForm() {
    this.submitted = false;
    this.btnText = 'Assign Booths';
    this.defaultAssignBoothsForm();
    this.boothListArray = [];
    this.boothDivHide = false;
    this.searchAssembly = '';
    this.searchboothList = '';
    this.assemblyArray = [];
    this.boothListMergeArray = [];
  }

  clearFormSelectData(flag:any){
    if(flag == 'election'){
      this.assemblyArray = [];
      this.boothListMergeArray = [];
      this.AssemblyBoothArray = [];
      this.assignBoothForm.controls['ConstituencyId'].setValue('');
    }else if(flag == 'constituency'){
      this.getAssembly();
      this.boothListMergeArray = [];
      this.AssemblyBoothArray = [];
    }
    this.updateFlag = false;
  }

  onCheckChangeAssembly(event: any, assemblyId:any) {
    if (event.target.checked){
      this.assemblyIdArray.push(assemblyId); 
      this.getBoothList(assemblyId);
    }else{
      this.boothListMergeArray = this.boothListMergeArray.filter((ele: any) => {
        if (ele.AssemblyId !== assemblyId) {
          return ele;
        }
      });
      let uncheckAssemblyBoothArrayckAs = this.AssemblyBoothArray.filter((ele: any) => {
        if (ele.AssemblyId !== assemblyId) {
          return ele;
        }
      });
      this.checkBoxCehckBoothArray(this.AssemblyBoothArray = uncheckAssemblyBoothArrayckAs);
    }
  }

  onCheckChangeBooths(event: any, assemblyId: any, boothId: any) {
    if (event.target.checked == false) {
      let index = this.AssemblyBoothArray.map((x: any) => { return x.BoothId; }).indexOf(boothId);
      this.AssemblyBoothArray.splice(index, 1);
    }
    else {
      this.AssemblyBoothArray.push({ 'AssemblyId': assemblyId, 'BoothId': boothId });
    }
  }

  clearAssemblyBooth() {
    this.boothListMergeArray = [];
    this.assemblyArray = [];
  }
  //---------------------------------------- left side AssignBoothForm method's  end here -----------------------------------------------// 


  //------------------------------------------------- Top filters method's  start here ---------------------------------------------------// 

  defaultFilterForm() {
    this.filterForm = this.fb.group({
      ElectionNameId: [0],
      Search: [''],
    })
  }

  onKeyUpFilter() {
    this.subject.next();
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
        this.filterForm.value.Search;
        this.paginationNo = 1;
        this.getAssignedBoothToElection();
      });
  }

  filterData() {
    this.paginationNo = 1;
    this.getAssignedBoothToElection();
    this.clearForm();
  }

  clearFilter(flag: any) {
    if (flag == 'electionType') {
      this.filterForm.controls['ElectionNameId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    this.getAssignedBoothToElection();
    this.clearForm();
  }

  //------------------------------------------------- Top filters method's  end here ---------------------------------------------------// 

  //----------------------------------------------- assign booth to constituency table method's start here---------------------------------//  
  getAssignedBoothToElection() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj = '&ElectionId=' + formData.ElectionNameId + '&UserId=' + this.commonService.loggedInUserId() + '&Search=' + formData.Search +
      '&nopage=' + this.paginationNo;
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedBoothToElection?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.assignedBoothToElectionArray = res.data1;
        this.total = res.data2[0].TotalCount;
      } else {
        this.spinner.hide();
        this.assignedBoothToElectionArray = [];
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAssignedBoothListDetail(HeaderId: any, obj: any) {
    this.BoothListDetailData = obj;
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedBoothListDetail?HeaderId=' + HeaderId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.AssBoothListDetailArray = res.data1;
      } else {
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  delConfirmAssBothEle(ElectionId: any) {
    this.ElectionId = ElectionId;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteElectionMasterData();
      }
    });
  }

  deleteElectionMasterData() {
    this.callAPIService.setHttp('get', 'Web_Insert_Election_DeleteBoothToElection?HeaderId=' + this.ElectionId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.clearForm();
        this.getAssignedBoothToElection();
      } else {
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintion(pageNo: number) {
    this.paginationNo = pageNo;
    this.getAssignedBoothToElection();
  }

  //----------------------------------------------- assign booth to constituency table method's end here-----------------------------------//  
  //----------------------------------------------- assign booth edit form  method's start here-----------------------------------//  
  patchAssBoothElection(HeaderId: any) {
    this.clearAssemblyBooth();
    this.btnText = 'Update Booths';
    this.callAPIService.setHttp('get', 'Web_Election_GetAssignedBoothListbyHeaderId?HeaderId=' + HeaderId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.editAssignBoothsPatchValue(res.data1[0]);
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  
  editAssignBoothsPatchValue(objData: any) {
    this.ConstituencyIdArray = [];
    this.AssemblyBoothArray = [];
    this.globalEditObj = objData;
    this.assignBoothForm.patchValue({ Id: objData.Id});
    this.getElection();
    let checkAssemblyComma = objData.Assembly.includes(",");
    checkAssemblyComma == true ? this.ConstituencyIdArray = objData.Assembly.split(',') : this.ConstituencyIdArray = objData.Assembly.split(' ');
    let checkBoothComma = objData.BoothId.includes(",");
    checkBoothComma == true ? this.AssemblyBoothArray = objData.BoothId.split(',') : this.AssemblyBoothArray = objData.BoothId.split(' ');
  }
  editAssemblyBoothArray() {

  }
  //----------------------------------------------- assign booth edit form  method's end here-----------------------------------//  
}

