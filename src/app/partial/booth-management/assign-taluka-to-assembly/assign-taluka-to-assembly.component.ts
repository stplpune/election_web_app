import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-assign-taluka-to-assembly',
  templateUrl: './assign-taluka-to-assembly.component.html',
  styleUrls: ['./assign-taluka-to-assembly.component.css']
})
export class AssignTalukaToAssemblyComponent implements OnInit {
  assignTalukaForm!:FormGroup;
  userId:number=this.commonService.loggedInUserId();
  assemblyArray =new Array();
  stateArray = new Array();
  districtArray = new Array();
  
  talukaArray = new Array();
  talukaobjResult='';
  submitted:boolean=false;
  checkedTalukaArray = new Array();
  subTalukaTableArray =new Array();
  pageNumber:number=1;
  pageSize:number=10;
  totalCount:number|any;
  searchAssembly =new FormControl();
  getAssemblyArray=new Array();
  assemblyFilterArray=new Array();
  editTableSubTaluka:any=[];
  editFlag:boolean=false;
  editObj:any;
  chekedTalukaName:any=[];
  spliceFlag:boolean=false;
  assemblyDisabledFlag:boolean=false;
  assembyTableConvertArr:any=[];
  get f(){return this.assignTalukaForm.controls}
  @ViewChild('closeModal') closeModal!: ElementRef;

  constructor(private fb:FormBuilder,
    private apiService:CallAPIService,
    private router:Router,
    private activatedRout:ActivatedRoute,
    private commonService:CommonService,
    public dialog: MatDialog,
    private tosterService:ToastrService,
    private spinner:NgxSpinnerService){ }

  ngOnInit(): void {
    this.getAssemblyTable();
    this.getFormControl();
    this.getAllAssembly('filter');
  }

  getFormControl(){
    this.assignTalukaForm = this.fb.group({
      assembly:['',[Validators.required]],
      stateId:['',[Validators.required]],
      districtId:['',[Validators.required]],
      talukaId:['',[Validators.required]]
    })
  }

//#region------------------------------------------------table method start here------------------------------------------------------------------
 getAssemblyTable(){
  this.spans=[];
  this.getAssemblyArray=[];this.assembyTableConvertArr=[];
  this.apiService.setHttp('get', 'api/AssignTalukatoAssembly/GetAll?AssemblyId='+(this.searchAssembly.value? this.searchAssembly.value:0)+'&pageNo='+this.pageNumber+'&pageSize='+this.pageSize, false, false, false, 'electionMicroSerApp');
  this.apiService.getHttp().subscribe((res: any) => {
    if (res.responseData != null && res.statusCode == "200") {
      this.getAssemblyArray = res.responseData;
      this.getAssemblyArray = res.responseData;
      let talArr:any=[];
      this.getAssemblyArray.forEach((ele:any,i:number)=>{
        if(ele.talukadetailsList.length){
          ele.talukadetailsList.map((talEle:any)=>{
            talArr.push(talEle.talukaName);
            talEle['constituencyName']=ele.constituencyName;
            talEle['srNo']=i+1;
            talEle['taltaltal']=talArr.join(',');
            this.assembyTableConvertArr.push(talEle)
          })
        }else{
              let talEle={
                constituencyName:ele.constituencyName,
                assemblyId:ele.id,
                srNo:i+1,
              }
              this.assembyTableConvertArr.push(talEle)
        }
        talArr=[]
      }) 
      this.totalCount=res.responseData1.totalCount;
      this.cacheSpan('constituencyName',(d:any) => d.constituencyName);
      this.cacheSpan('districtName',(d:any) => d.constituencyName + d.districtName);  

    } else {
      this.assembyTableConvertArr = [];
      this.getAssemblyArray = [];
    }
  }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.activatedRout }) } })
 }

 onClickPagintion(pageNo:number){
  this.pageNumber = pageNo;
  this.getAssemblyTable();
 }

// Delete functionality start here

 deleteConfirmModel(delId:any) {
  const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
  dialogRef.afterClosed().subscribe((res:any) => {
    if (res == 'Yes') {
      this.deleteAssembly(delId);
    }
  });
}

deleteAssembly(delObj:any){
  let obj = {
    "id": delObj,
    "deletedBy": this.userId
  }
  this.apiService.setHttp('DELETE', 'api/AssignTalukatoAssembly/Delete', false, obj, false, 'electionMicroSerApp');
  this.apiService.getHttp().subscribe((res: any) => {
    if (res.statusCode == "200") {
      this.tosterService.success(res.statusMessage);
      this.getAssemblyTable();
    } else {
      this.tosterService.error(res.statusMessage);
    }
  }, (error: any) => {
    this.router.navigate(['../500'], { relativeTo: this.activatedRout });
  })
}

//patch edit object
editAssembly(editObj:any){
  this.getAssemblyArray.map((ele:any)=>{
    if(ele.id==editObj.assemblyId){
      this.editObj=ele;
    }
  })
  this.editTableSubTaluka=[];
  this.assignTalukaForm.controls['assembly'].setValue(editObj.id);
  editObj?.talukadetailsList?.length?this.assignTalukaForm.controls['stateId'].setValue(editObj?.talukadetailsList[0]?.stateId):'';
  this.editObj.talukadetailsList?.forEach((item: any) => {
    let existing: any = this.editTableSubTaluka?.filter((v: any) => {
      return v.districtId == item.districtId;
    });
    if (existing.length) {
      let existingIndex: any = this.editTableSubTaluka.indexOf(existing[0]);
      this.editTableSubTaluka[existingIndex].talukaId = this.editTableSubTaluka[existingIndex].talukaId.concat({talukaId:item.talukaId});
      this.editTableSubTaluka[existingIndex].talukaName = this.editTableSubTaluka[existingIndex].talukaName.concat(item.talukaName);
    } else {
      item.talukaId = [{talukaId:item.talukaId}];
      item.talukaName = [item.talukaName];
      this.editTableSubTaluka.push(item);
    }
  });
  this.subTalukaTableArray=this.editTableSubTaluka;
}
//#endregion-----------------------------------------------table method end here-------------------------------------------------------------

//#region--------------------------------------------------dropDown Apis---------------------------------------------------------------------
getAllAssembly(flag?:any) {
    this.apiService.setHttp('get', 'api/AssignTalukatoAssembly/GetConstituencyDetails', false, false, false, 'electionMicroSerApp');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
       flag=='filter'? this.assemblyFilterArray=res.responseData: this.assemblyArray = res.responseData;
       this.assemblyArray?.length==1? this.assignTalukaForm.controls['assembly'].setValue(res.responseData[0].id):'';
      } else {
        this.assemblyArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.activatedRout }) } })
}

getAllState() {
    this.apiService.setHttp('get', 'Filter/GetAllState?UserId=' + this.userId, false, false, false, 'electionMicroServiceForWeb');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.stateArray = res.responseData;
        this.stateArray?.length==1? (this.assignTalukaForm.controls['stateId'].setValue(res.responseData[0].id),this.getAllDistrict()):'';
      } else {
        this.stateArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.activatedRout }) } })
 }
  
getAllDistrict(){
    this.apiService.setHttp('get', 'Filter/GetAllDistricts?UserId=' + this.userId + '&StateId=' + (this.assignTalukaForm.value.stateId? this.assignTalukaForm.value.stateId:0), false, false, false, 'electionMicroServiceForWeb');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.districtArray = res.responseData;
      } else {
        this.districtArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.activatedRout }) } })
}
 
getTaluka(){
    this.apiService.setHttp('get', 'Filter/GetAllTaluka?UserId=' + this.userId + '&DistrictId=' + (this.assignTalukaForm.value.districtId? this.assignTalukaForm.value.districtId:0), false, false, false, 'electionMicroServiceForWeb');
    this.apiService.getHttp().subscribe((res: any) => {
      if (res.responseData != null && res.statusCode == "200") {
        this.talukaArray = res.responseData;
        this.checkTableData();
      } else {
        this.talukaArray = [];
      }
    }, (error: any) => { if (error.status == 500) { this.router.navigate(['../../500'], { relativeTo: this.activatedRout }) } })
}
//#endregion----------------------------------------------------dropDown Apis ends----------------------------------------------------------------
//#region-------------------------------------------------------Add update modal functinality start here-------------------------------------------
onClickCheckBox(event:any,obj:any){
    this.talukaArray.map((ele:any)=>{
      if(obj?.talukaId == ele?.talukaId){
         ele['checked'] = event.target.checked;
         return ele;
      }
    })
}

//add record in sub-taluka table 
assignSubTaluka(){
  this.checkedTalukaArray=[];
  this.chekedTalukaName=[];
  this.talukaArray.map((eleTal:any)=>{
    let talChecked={
      "talukaId":eleTal.talukaId
    }
    eleTal.checked==true?(this.checkedTalukaArray.push(talChecked),this.chekedTalukaName.push(eleTal.talukaName)):'';
  })
  if(this.assignTalukaForm.controls['districtId'].valid && this.checkedTalukaArray.length!=0){
    let DistName;
    this.districtArray.map((ele:any)=>{
     this.assignTalukaForm.value.districtId==ele.districtId?DistName=ele.districtName:'';
    })
  let obj={
      districtId:this.assignTalukaForm.value.districtId,
      districtName:DistName,
      talukaId:this.checkedTalukaArray,
      talukaName:this.chekedTalukaName
    }
    this.spliceFlag=false;
    this.subTalukaTableArray?.filter((ele:any,i:number)=>{
      if(ele.districtId == this.assignTalukaForm.value.districtId){
        this.spliceFlag=true;
          this.subTalukaTableArray.splice(i,1,obj)
      }
    })
   
    this.spliceFlag==false? this.subTalukaTableArray.push(obj):'';
    this.assignTalukaForm.controls['districtId'].reset();
    this.talukaArray=[];
  }
  else{
    this.tosterService.error(this.assignTalukaForm.controls['districtId'].invalid? 'Please Select district':'Please select taluka');
  }
}

compareDistId:any=[];
checkTableData(){    //check selected distict present in table or not
  this.compareDistId=[];
  this.subTalukaTableArray.forEach((element1:any) => {
   if(element1.districtId == this.assignTalukaForm.value.districtId){
     this.compareDistId.push(element1);
   }
  })
  this.talukaArray.forEach((element) => {
   this.compareDistId[0]?.talukaId.filter((element1:any) => {
    if(element1.talukaId == element.talukaId){
      element['checked'] =true;
    }
   })
  })
}

deleteSubTaluka(index:any){
   this.subTalukaTableArray.splice(index,1);
}

//add update record
onSubmitAssembly(){
    this.submitted=true;
    if(this.assignTalukaForm.controls['assembly'].invalid || this.assignTalukaForm.controls['stateId'].invalid ||this.subTalukaTableArray.length==0){
       return
    } 
    else{
      this.spinner.show();
      let requestObj:any=[];let obj:any;
      this.subTalukaTableArray.forEach((ele:any)=>{
       ele.talukaId?.forEach((talEle:any)=>{
        obj={
          "id":this.editFlag?this.editObj.id:0,
          "assemblyId": this.assignTalukaForm.value.assembly,
          "districtId": ele.districtId,
          "stateId": this.assignTalukaForm.value.stateId,
          "talukaId": talEle.talukaId,
          "createdBy": this.userId
        }
        requestObj.push(obj);
       })
      })
      this.apiService.setHttp(this.editFlag?'PUT':'POST',this.editFlag?'api/AssignTalukatoAssembly/Update':'api/AssignTalukatoAssembly/Create', false, requestObj, false, 'electionMicroSerApp');
      this.apiService.getHttp().subscribe((res: any) => {
        if (res.responseData != null && res.statusCode == "200") {
          this.spinner.hide();
          this.tosterService.success(res.statusMessage);
          this.closeModal.nativeElement.click();
          this.getAssemblyTable();
          this.clearAssemblyForm();
          this.submitted = false;
        } else {
          this.spinner.hide();
          this.tosterService.error(res.statusMessage);
        }
      }, (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.activatedRout });
      })
    }
  }

  clearAssemblyForm(){
    this.assemblyDisabledFlag=false;this.editObj='';this.editFlag=false;
    this.assignTalukaForm.reset();
    this.assemblyArray?.length==1? this.assignTalukaForm.controls['assembly'].setValue(this.assemblyArray[0].id):'';
    this.stateArray?.length==1? this.assignTalukaForm.controls['stateId'].setValue(this.stateArray[0].id):'';
    this.subTalukaTableArray=[];
  }

//#region-----------------------------------rowspan---------------------------------------------------------
spans:any=[];
cacheSpan(key:any, accessor:any) {
  for (let i = 0; i < this.assembyTableConvertArr.length;) {
    let currentValue = accessor(this.assembyTableConvertArr[i]);
    let count = 1;
    for (let j = i + 1; j < this.assembyTableConvertArr.length; j++) {        
      if (currentValue != accessor(this.assembyTableConvertArr[j])) {
        break;
      }
      count++;
    } 
    if (!this.spans[i]) {
      this.spans[i] = {};
    }
    this.spans[i][key] = count;
    i += count;
  }
}

getRowSpan(col:any, index:any) {
  return this.spans[index] && this.spans[index][col];
}
}
