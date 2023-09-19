import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-ac-to-pc',
  templateUrl: './ac-to-pc.component.html',
  styleUrls: ['./ac-to-pc.component.css']
})
export class AcToPcComponent implements OnInit {

  constructor(
    private callAPIService: CallAPIService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private tosterService: ToastrService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) { }

  mainForm!:FormGroup;
  getTotal: any;
  pageSize: number = 10;
  tableDataArray = new Array();
  paginationNo: number = 1;
  userId:any = this.commonService.loggedInUserId();
  districtArray = new Array();
  assemblArray = new Array();
  testArray = new Array();
  parliamentaryconstituenciesId!:any;
  dId!:any;

  ngOnInit(): void {
    this.getTableData();
    this.controlForm();
    this.getDistrict();
  }

  controlForm(){
    this.mainForm = this.fb.group({
      parliamentaryConstituencies:[''],
      districtId:['']
    })

  }
    
  getDatatoBind(val?:any){
    console.log(val,'vvvvv');
    this.parliamentaryconstituenciesId = val?.parliamentaryconstituenciesId;
    this.mainForm.controls['parliamentaryConstituencies'].setValue(val.parliamentaryConstituencies)
    this.mainForm.controls['parliamentaryConstituencies'].setValue(val.parliamentaryConstituencies)
  }

  getDistrict() {
    // Api for District
    this.callAPIService.setHttp(
      'get',
      'ClientMasterWebApi/Filter/GetAllDistricts?UserId=1339&StateId=1&DivisionId=0',
      false,
      false,
      false,
      'electionMicroSerApp'
    );
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.districtArray = res.responseData;
          // this.categoryArray?.length == 1 ? this.f['categoryId'].setValue(this.categoryArray[0]?.categoryId) : '';
        } else {
          this.districtArray = [];
        }
      },
      (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      }
    );
  }

  getAssembly() {
    // Api for Category
    this.districtArray.map((e:any)=>{
      if(this.mainForm.value.districtId == e.districtId){
        this.dId = e.districtName;
      }
    })

    console.log(this.dId,'diddid');
    
    this.callAPIService.setHttp(
      'get',
      'api/BoothDetailsAsync/GetDistrictwiseAssembly?DistrictId=' + (this.mainForm.value.districtId),
      false,
      false,
      false,
      'electionMicroSerApp'
    );
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        console.log(res);
        if ( res.statusCode == '200') {
          this.assemblArray = res.responseData;
        } else {
          this.assemblArray = [];
        }
      },
      (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../../500'], { relativeTo: this.route });
        }
      }
    );
  }

  getTableData() {
    // Main Api For Table
    this.spinner.show();
    this.callAPIService.setHttp(
      'get',
      'AssignAcToPc/GetParlimentoryConstituencyData?UserId='+ this.userId +'&pageno='+ this.paginationNo +'&pagesize='+ this.pageSize +'&TextSearch=',
      false,
      false,
      false,
      'electionMicroSerApp'
    );
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.spinner.hide();
          this.tableDataArray = res?.responseData.responseData1;
          console.log(this.tableDataArray);

          
          this.getTotal = res.responseData2?.totalPages * this.pageSize;
        } else {
          this.spinner.hide();
          this.tableDataArray = [];
        }
      },
      (error: any) => {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    );
  }

  clearData(){
    this.controlForm();
    this.assemblArray = [];
  }

  constituencyComityModelArray: any[] = [];
  onClickCheckBox1(event:any,booths:any){
    console.log(booths,'booths');
    // return
    this.assemblArray.map((ele: any) => {
      // return
      if (booths?.assemblyId == ele?.assemblyId) {
        ele['checked'] = event.target.checked;
        return ele;
      }
  })
  this.updateTestMethod();
}

updateTestMethod(){
  this.constituencyComityModelArray = [];
  this.assemblArray.map((ele1:any)=>{
    if(ele1.checked == true){
      this.constituencyComityModelArray.push(ele1)
    }
  })

  console.log(this.constituencyComityModelArray,'final');
  
}


  itemAray:any[]=[];
  addItem(){
    if(!this.constituencyComityModelArray?.length){
        this.tosterService.error('Please Select at least One Booth');
        return;
      }else{
        let obj = {
          id: 0,
          // parliamentaryconstituenciesId:this.parliamentaryconstituenciesId,
          districtName:this.dId,
          assemblyArr: this.constituencyComityModelArray,
        }
        this.itemAray.push(obj);
    
        this.assemblArray=[];
        this.dId='';
        // this.constituencyComityModelArray=[];
        this.mainForm.controls['districtId'].setValue('');
    
        
        console.log(this.itemAray,'a');
      }
  }

  onSubmit() {
    if (this.mainForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.spinner.show();
      let finalArrayOfObj:any[] = [];
      for(let i=0;i<this.itemAray.length;i++){
        for(let j=0;j<this.itemAray[i].assemblyArr.length;j++){
          finalArrayOfObj.push({
            id: 0,
            parliamentaryconstituenciesId: this.parliamentaryconstituenciesId,
            assemblyId: this.itemAray[i]?.assemblyArr[j]?.assemblyId,
            createdBy: this.commonService.loggedInUserId()
          })
        }
      }
      console.log(finalArrayOfObj,'finalArray');

      let urlType =
        // this.mainForm.value.id == 0
          // ?
           'AssignAcToPc/Saveassignassemblytopc'
          // : 'AssignAcToPc/Updateassignassemblytopc';
      let apiType = 
      // formData.id == 0 ? 
      'POST' 
      // : 'PUT';

      this.callAPIService.setHttp(apiType,urlType,false,finalArrayOfObj,false,'electionMicroSerApp');
      this.callAPIService.getHttp().subscribe(
        (res: any) => {
          if (res.responseData != null && res.statusCode == '200') {
            this.spinner.hide();
            this.tosterService.success(res.statusMessage);
            this.itemAray = [];
            // this.getConstituencymastercommittee();
            // this.clearForm();
            // this.submitted = false;
          } else {
            this.spinner.hide();
            this.tosterService.error(res.statusMessage);
          }
        },
        (error: any) => {
          this.spinner.hide();
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      );
    }
  }
}