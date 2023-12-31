import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DeleteComponent } from '../../dialogs/delete/delete.component';

@Component({
  selector: 'app-ac-to-pc',
  templateUrl: './ac-to-pc.component.html',
  styleUrls: ['./ac-to-pc.component.css'],
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
  ) {}

  mainForm!: FormGroup;
  getTotal: any;
  pageSize: number = 10;
  tableDataArray = new Array();
  paginationNo: number = 1;
  userId: any = this.commonService.loggedInUserId();
  districtArray = new Array();
  assemblArray = new Array();
  testArray = new Array();
  parliamentaryconstituenciesId!: any;
  dId!: any;
  searchAssembly = '';
  checkArrLength=new Array();
  @ViewChild('closeModal') closebutton: any;

  ngOnInit(): void {
    this.getTableData();
    this.controlForm();
    this.getDistrict();
  }

  controlForm() {
    this.mainForm = this.fb.group({
      parliamentaryConstituencies: [''],
      districtId: [''],
      assembly:['']
    });
  }

  // getDatatoBind(val?:any){
  //   console.log(val,'vvvvv');
  //   this.parliamentaryconstituenciesId = val?.parliamentaryconstituenciesId;
  //   this.mainForm.controls['parliamentaryConstituencies'].setValue(val.parliamentaryConstituencies)
  //   this.mainForm.controls['parliamentaryConstituencies'].setValue(val.parliamentaryConstituencies)
  // }

  deleteConfirmModel(id?:any){
    const dialogRef = this.dialog.open(DeleteComponent, { disableClose: true });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'Yes') {
        this.deleteListData(id);
      }
    });
  }

  deleteListData(id?: any) {
    this.itemArray.splice(id, 1);
    this.mainForm.controls['districtId'].setValue('')
    this.assemblArray = [];
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
    this.searchAssembly = '';
    // Api for Category
    this.districtArray.map((e: any) => {
      if (this.mainForm.value.districtId == e.districtId) {
        this.dId = e.districtName;
      }
    });
    this.callAPIService.setHttp(
      'get',
      'api/BoothDetailsAsync/GetDistrictwiseAssembly?DistrictId=' +
        this.mainForm.value.districtId,
      false,
      false,
      false,
      'electionMicroSerApp'
    );
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.statusCode == '200') {
          this.assemblArray = res.responseData;
          // for(let i=0;i<this.editObj.assemblyList[0].AssemblyArray.length;i++){
      //   console.log(this.editObj.assemblyList[0].AssemblyArray[i].checked,'oooo - ' ,booths.assemblyId);
      //   // return
      //   if(booths.assemblyId == this.editObj.assemblyList[0].AssemblyArray[i].assemblyId){
      //     this.tosterService.error('Assembly/Booth already exits');
      //     return;
      //   }
      //   else{
      //     this.updateTestMethod();
      //   }
      // }
          for(let i=0;i<this.itemArray.length;i++){
            this.assemblArray.forEach((ele:any)=>{
              if(this.itemArray[i].assemblyId == ele.assemblyId){
                ele['disabledFlag'] = true;
                return ele;
              }
            }) 
          }
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

  checkBoxFlag:boolean=false;
  checkBoothsAvail(val?:any){
    this.assemblArray.map((ele:any)=>{
      if(ele.assemblyName.toLowerCase() != val.toLowerCase()){
        this.checkBoxFlag = true;
      }else{
        this.checkBoxFlag = false;
      }
    })
  }

  getTableData() {
    // Main Api For Table
    this.spinner.show();
    this.callAPIService.setHttp('get','AssignAcToPc/GetParlimentoryConstituencyData?StateId=1&UserId=' + this.userId +'&pageno=' +this.paginationNo +
        '&pagesize=' +this.pageSize +'&TextSearch=',false,false,false,'electionMicroSerApp');
    this.callAPIService.getHttp().subscribe(
      (res: any) => {
        if (res.responseData != null && res.statusCode == '200') {
          this.spinner.hide();
          let oldArray = res?.responseData.responseData1;
          this.tableDataArray = JSON.parse(JSON.stringify(oldArray));
          this.tableDataArray.map((ele: any) => { ele.assemblyList = Object.values(ele.assemblyList.reduce((acc: any, cur: any) => Object.assign(acc, { [cur.districtId]: cur }), {}))})
      
          this.tableDataArray.map((ele1: any) => {
            oldArray.map((ele: any) => {
              ele1.assemblyList.find((res1: any) => { let AssemblyArray: any[] = [];
                ele.assemblyList.find((res: any) => {
                  if(ele.parliamentaryconstituenciesId == ele1.parliamentaryconstituenciesId){
                    if (res.districtId == res1.districtId) { 
                      AssemblyArray.push(res);
                      res1['AssemblyArray'] = AssemblyArray;
                    }
                  }
                })
              })
            })
          })

          this.getTotal = res.responseData.responseData2?.totalCount;
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

  clearData() {
    this.controlForm();
    this.assemblArray = [];
    this.itemArray = [];
    this.searchAssembly = '';
  }

  constituencyComityModelArray: any[] = [];
  onClickCheckBox1(event: any, booths: any) {
    this.assemblArray.map((ele: any) => {
      // return
      if (booths?.assemblyId == ele?.assemblyId) {
        ele['checked'] = event.target.checked;
        return ele;
      }
    });

      // for(let i=0;i<this.editObj.assemblyList[0].AssemblyArray.length;i++){
      //   console.log(this.editObj.assemblyList[0].AssemblyArray[i].checked,'oooo - ' ,booths.assemblyId);
      //   // return
      //   if(booths.assemblyId == this.editObj.assemblyList[0].AssemblyArray[i].assemblyId){
      //     this.tosterService.error('Assembly/Booth already exits');
      //     return;
      //   }
      //   else{
      //     this.updateTestMethod();
      //   }
      // }
      this.updateTestMethod();
  }

  updateTestMethod() {
    this.constituencyComityModelArray = [];
    this.assemblArray.map((ele1: any) => {
      if (ele1.checked == true) {
        this.constituencyComityModelArray.push(ele1);
      }
    });
  }

  
  itemArray: any[] = [];
  parliamentaryConstituencies:any;
  editObj:any;
  patchFormData(obj?: any) {
    this.editObj = obj;
    this.parliamentaryConstituencies = obj.parliamentaryConstituencies;
    this.parliamentaryconstituenciesId = obj.parliamentaryconstituenciesId;
    this.mainForm.patchValue({
      parliamentaryConstituencies: obj?.parliamentaryConstituencies,
      createdBy: obj?.createdBy,
      // assemblyList:obj?.assemblyList
    })

    if(obj?.assemblyList.length){
    obj?.assemblyList.forEach((ele:any) => {
      ele?.AssemblyArray.forEach((ele:any) => { 
        this.itemArray.push(ele)
      })
    })}
    // else{
    //   this.itemArray.push({
    //     id: 0,
    //     createdBy: this.userId,
    //     assemblyId: obj?.assemblyList?.assemblyId,
    //     checked: true,
    //   })
    // }
  }

  arrayAfterClickAdd:any[]=[];
  addItem() {
    if(!this.mainForm.value?.districtId){
      this.tosterService.error('Please Select District First')
    }
    else if (!this.constituencyComityModelArray?.length) {
      this.tosterService.error('Please Select at least One Assembly');
      return;
    } else {
     for (let index = 0; index < this.constituencyComityModelArray.length; index++) {
      this.itemArray.push(this.constituencyComityModelArray[index])
     }

     
      this.arrayAfterClickAdd.push(this.constituencyComityModelArray)

      // console.log(this.constituencyComityModelArray,'sss');
      // this.arrayAfterClickAdd = [this.constituencyComityModelArray,...this.itemArray]
      this.assemblArray = [];
      this.dId = '';
      // this.constituencyComityModelArray=[];
      this.mainForm.controls['districtId'].setValue('');
      if(!this.mainForm.value.distrctId){
        this.constituencyComityModelArray=[];
      }
    }
  }

  onSubmit() {
    if (this.mainForm.invalid) {
      this.spinner.hide();
      return;
    }else if(!this.itemArray.length){
      this.spinner.hide();
      this.tosterService.error('Add at least one Assembly/Booth');
      return;
    } 
    else {
      this.spinner.show();
      let finalArrayOfObj = {};
      let formArr:any[]=[] 
      for(let i=0;i<this.itemArray.length;i++){
        formArr.push( {
          id: 0,
          assemblyId: this.itemArray[i].assemblyId,
          createdBy: this.userId
        })
      }
      // return
      finalArrayOfObj = {
        parliamentaryconstituenciesId: this.parliamentaryconstituenciesId,
        createdBy: this.userId,
        assemblyList: formArr
        // this.constituencyComityModelArray
        // [
        //   {
        //     id: 0,
        //     "assemblyId": 0,
        //     "createdBy": 0
        //   }
        // ]
      }
      // return
      let urlType = !this.checkArrLength ? 'AssignAcToPc/Saveassignassemblytopc' : 'AssignAcToPc/Updateassignassemblytopc';
      let apiType = !this.checkArrLength ? 'POST' : 'PUT';

      this.callAPIService.setHttp(
        apiType,
        urlType,
        false,
        finalArrayOfObj,
        false,
        'electionMicroSerApp'
      );
      this.callAPIService.getHttp().subscribe(
        (res: any) => {
          if (res.responseData != null && res.statusCode == '200') {
            this.spinner.hide();
            this.tosterService.success(res.statusMessage);
            this.itemArray = [];
            this.getTableData();
            this.closebutton.nativeElement.click();
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

  onClickPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getTableData();
  }
}
