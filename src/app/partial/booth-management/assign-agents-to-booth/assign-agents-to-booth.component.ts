import { Component, OnInit, ViewChild } from '@angular/core';
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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

@Component({
  selector: 'app-assign-agents-to-booth',
  templateUrl: './assign-agents-to-booth.component.html',
  styleUrls: ['./assign-agents-to-booth.component.css'],
  animations: [
    trigger('keyfieldExpanded', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AssignAgentsToBoothComponent implements OnInit {

  assAgentToBoothForm!: FormGroup;
  assignAgentForm!: FormGroup;
  submitted = false;
  aAsubmitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Add Agent';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  electionNameArray: any;
  clientNameArray: any;
  constituencyNameArray: any;
  AssemblyNameArray: any = [];
  BoothSubeleNonSubEleArray: any;
  insertBoothAgentArray: any;
  globalClientId: any;
  clientAgentWithBoothArray: any = [];
  index: any;
  searchboothList = '';
  AssemblyBoothArray: any = [];
  getAllClientAgentList: any;
  clientAgentListFlag: boolean = false;
  ClientAgentListddl: any;
  constituencyData = '';
  userId: any;
  ClientId: any;
  assBoothObjData: any;
  checkAssemblyArray: any = [];
  boothDivHide: boolean = false;
  boothListMergeArray: any = [];
  searchAssembly = '';
  assemblyArray: any = [];
  assemblyCheckBoxCheck!: boolean;
  AssemblyId: any;
  assemblyIdArray: any = [];
  boothListArray: any;
  selBoothId: any;
  assemblyBoothJSON: any;
  ConstituencyId: any;
  ConstituencyIdArray: any = [];
  globalEditObj: any;
  modalTextChange: any;
  agentBlogStatus: any
  agentwiseAssigBoothArray: any = [];
  agentwiseAssigBoothHide: boolean = false;
  defaultAgentDataFlag: boolean = false;
  disabledNoOfCasesDiv: boolean = false;

  globalHeaderId: any;
  getMobileNoOnSelAgent: any;

  filterElectionNameArray: any;
  filterconstituencyNameArray: any;
  filterAssemblyArray: any;
  filterclientWiseBoothListArray: any;
  filterAssembleListArray: any;

  loginPages: any[] = [];
  filterClientNameArray: any;
  agentModalFlag: boolean = false;
  // paginationNo :number = 1;
  assemblyId: any;
  checkLoginClientId: any;
  onClickBoothId: any;
  boothAssignAgentMergedArray: any;
  agentwiseAssBoothArray: any;

  tableDataArray: any[] = [];
  dataNotFound: boolean = false;
  isDisable: boolean = false;

  @ViewChild('openAssignAgentToBooths') openAssignAgentToBooths: any;
  @ViewChild('closeAddAgentModal') closeAddAgentModal: any;
  @ViewChild('closeAssignAgent') closeAssignAgent: any;
  deleteObj: any;

  filterArray: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.checkLoginClientId = this.commonService.getlocalStorageData().ClientId
    this.agentToBoothForm();
    this.agentForm();
    this.defaultFilterForm();
    this.searchFilters('false');
    // this.getClientName();
    this.filterClientName();
  }

  agentToBoothForm() {
    this.assAgentToBoothForm = this.fb.group({
      Id: [0],
      ClientId: ['', [Validators.required]],
      UserId: ['', [Validators.required]],
      ElectionId: ['', [Validators.required]],
      ConstituencyId: ['', [Validators.required]],
      AssemblyId: [''],
      boothId: [''],
      CreatedBy: [this.commonService.loggedInUserId()]
    })
  }

  get a() { return this.assAgentToBoothForm.controls };

  resetAssignAgentForm() {
    this.btnText = 'Add Agent';
    this.aAsubmitted = false;
    this.agentToBoothForm();
    this.clearAssemblyBooth();
    this.agentwiseAssigBoothArray = [];
    this.agentwiseAssigBoothHide = false;
    this.disabledNoOfCasesDiv = false;
    this.globalEditObj = [];
  }

  getClientName() {
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.clientNameArray = res.data1;

        //this.clientNameArray?.length == 1  ?  (this.assAgentToBoothForm.controls['ClientId'].setValue(this.clientNameArray[0].id), this.getClientAgentList()) :  '';

        if (this.btnText == 'Update Agent' || this.clientNameArray?.length == 1) {
          this.assAgentToBoothForm.controls['ClientId'].setValue(this.globalEditObj.ClientId);
          this.getClientAgentList();
        }

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  Client_AgentList() {//Client_AgentList
    let data = this.assAgentToBoothForm.value;
    this.callAPIService.setHttp('get', 'Web_Client_AgentList?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.clientAgentListFlag = true;

        this.getAllClientAgentList = res.data1;
      } else {
        this.getAllClientAgentList = [];

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentwiseAssignedBooth() {//getAgentwiseAssigBooth

    let data = this.assAgentToBoothForm.value;
    this.nullishFilterForm();
    let userId: any;
    data.UserId == null || data.UserId == '' || data.UserId == undefined ? userId = 0 : userId = data.UserId;
    this.callAPIService.setHttp('get', 'Web_get_Agentwise_AssignedBooth?AgentId=' + userId + '&ClientId=' + data.ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.agentwiseAssBoothArray = res.data1;
        let agentwiseAssigBoothArray = res.data1;
        userId == 0 ? this.agentwiseAssigBoothHide = false : this.agentwiseAssigBoothHide = true;//all assign booths by agent are showing
        this.sortEleByBoothId(this.agentwiseAssBoothArray);
        let HeaderId = this.agentwiseAssBoothArray[0].HeaderId;
        this.pushDataAgentwiseAssigBoothArray(this.agentwiseAssBoothArray);
        // this.AssemblyBoothArray = this.agentwiseAssBoothArray;
        // this.onCheckChangeBooths(true, BoothId: any, ConstituencyId: any, AssemblyId: any, ElectionId: any);
        //this.editAssignBoothsPatchValue(data, 'Add agent with Booths');
        // this.checkAllBooths(this.boothListMergeArray);
        let obj: any[] = [];
        agentwiseAssigBoothArray.map((ele: any) => {
          if (ele.BoothId || ele.ElectionId || ele.ConstituencyId || ele.ElectionId) {
            obj.push({ 'ElectionId': ele.ElectionId, 'AssemblyId': ele.Assembly, 'BoothId': ele.BoothId, 'ConstituencyId': ele.ConstituencyId });
          }
        })
        this.AssemblyBoothArray = obj;
      } else {
        this.AssemblyBoothArray = [];
        //this.uncheckAllBooths(this.boothListMergeArray);
        //this.editAssignBoothsPatchValue(data, 'Add agent with Booths');
        this.agentwiseAssBoothArray = [];
        this.disabledNoOfCasesDiv = true;
        this.agentwiseAssigBoothHide = false;
        this.assAgentToBoothForm.controls['Id'].setValue(0); //IF Booths Assigned  is empty set id is 0

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  uncheckAllBooths(data: any) {
    // this.boothListMergeArray =  data.filter((element:any) => {
    //   element.checked = false;
    //   return element
    // });
    // this.boothListMergeArray=[];
  }

  checkAllBooths(data: any) {
    // this.agentwiseAssigBoothArray=[];
    // this.boothListMergeArray =  data.filter((element:any) => {
    //   element.checked = true;
    //   return element
    // });
  }

  pushDataAgentwiseAssigBoothArray(data: any) {
    this.assAgentToBoothForm.controls['Id'].setValue(data[0].HeaderId); // set Id by selected booths

    data.map((ele: any) => {
      let ElectionId = ele.ElectionId;
      let AssemblyId = ele.Assembly;
      let BoothId = ele.BoothId;
      let ConstituencyId = ele.ConstituencyId;
      this.agentwiseAssigBoothArray.push({ ElectionId: ElectionId, 'AssemblyId': AssemblyId, 'BoothId': BoothId, 'ConstituencyId': ConstituencyId });
    })

  }

  sortEleByBoothId(mainArray: any) {
    this.boothAssignAgentMergedArray = JSON.parse(JSON.stringify(mainArray));
    this.boothAssignAgentMergedArray = Object.values(this.boothAssignAgentMergedArray.reduce((acc: any, cur: any) => Object.assign(acc, { [cur.ElectionId]: cur }), {}))

    this.boothAssignAgentMergedArray.map((ele: any) => {
      ele['ConstituencyArray'] = [];
      mainArray.map((ele1: any) => {
        if (ele.ElectionId == ele1.ElectionId) {
          let obj = {
            'ConstituencyName': ele1.ConstituencyName,
            'ConstituencyId': ele1.ConstituencyId
          }
          ele.ConstituencyArray.push(obj);
        }
      })
      ele.ConstituencyArray = Object.values(ele.ConstituencyArray.reduce((acc: any, cur: any) => Object.assign(acc, { [cur.ConstituencyId]: cur }), {}))
    })

    this.boothAssignAgentMergedArray.map((ele: any) => {
      ele.ConstituencyArray.map((ele1: any) => {
        ele1['boothArray'] = [];
        mainArray.map((ele2: any) => {
          if (ele1.ConstituencyId == ele2.ConstituencyId) {
            let obj = {
              'BoothNickName': ele2.BoothNickName,
              'BoothId': ele2.BoothId
            }
            ele1.boothArray.push(obj);
          }
        })
      })
      // ele.ConstituencyArray = Object.values(ele.ConstituencyArray.reduce((acc:any,cur:any)=>Object.assign(acc,{[cur.ConstituencyId]:cur}),{}))
    })
    console.log(this.boothAssignAgentMergedArray, 'mergebooth');
  }

  getClientAgentList() {
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + this.assAgentToBoothForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.ClientAgentListddl = res.data1;
        if (this.btnText == 'Update Agent') { //assign booth
          this.globalEditObj.UserId == null || this.globalEditObj.UserId == undefined || this.globalEditObj.UserId == '' ? (this.agentwiseAssigBoothHide = false, this.assAgentToBoothForm.controls['UserId'].setValue('')) : this.assAgentToBoothForm.controls['UserId'].setValue(this.globalEditObj.UserId)
          this.getAgentwiseAssignedBooth();
          this.getElectionName()
        }
        if (this.agentModalFlag) {
          this.assAgentToBoothForm.controls['UserId'].setValue(this.ClientAgentListddl[0].AgentId);
          this.disabledNoOfCasesDiv = true;
          this.agentModalFlag = false;
          this.getElectionName();
        }
      } else {
        this.ClientAgentListddl = [];

      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElectionName() {
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.assAgentToBoothForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.electionNameArray = res.data1;
        //this.agentwiseAssigBoothHide = true; // all assign booths by agent are showing

        if (this.btnText == 'Update Agent') {
          this.assAgentToBoothForm.controls['ElectionId'].setValue(this.globalEditObj.ElectionId);
          this.getConstituencyName();
        }
        this.ClientAgentListddl.forEach((element: any) => {
          if (element.AgentId == this.assAgentToBoothForm.value.UserId) {
            this.getMobileNoOnSelAgent = element.MobileNo;
          }
        });
      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getConstituencyName() {
    this.nullishFilterForm();
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.assAgentToBoothForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.assAgentToBoothForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.constituencyNameArray = res.data1;
        if (this.btnText == 'Update Agent') {
          this.assAgentToBoothForm.controls['ConstituencyId'].setValue(this.globalEditObj.ConstituencyId);
          this.getAssemblyName();
        }
      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  getAssemblyName() {
    let data = this.assAgentToBoothForm.value;
    // data.ConstituencyId
    this.callAPIService.setHttp('get', 'Web_Get_Assembly_byClientId_ddl?ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + this.filterForm.value.ConstituencyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.assemblyArray = res.data1;

        if (this.btnText == 'Update Agent') {
          this.disabledNoOfCasesDiv = true; //booth list showing
          this.checkBoxCehckAssemblyArray(this.ConstituencyIdArray)
        }

      } else {

        this.AssemblyNameArray = [];
        this.assemblyArray = [];
        this.boothListMergeArray = [];


      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getIsSubElectionApplicable() {
    let eleIsSubElectionApplicable: any;
    this.electionNameArray.filter((ele: any) => {
      if (ele.ElectionId == this.assAgentToBoothForm.value.ElectionId) {
        eleIsSubElectionApplicable = ele.IsSubElectionApplicable
      };
    })
    return eleIsSubElectionApplicable;
  }

  onCheckChangeAssembly(event: any, assemblyId: any) {
    if (event.target.checked) {
      this.assemblyIdArray.push(assemblyId);
      this.getBoothsByAssembleId(assemblyId);
    } else {
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
      this.AssemblyBoothArray = uncheckAssemblyBoothArrayckAs;
      this.checkBoxCehckBoothArray(this.AssemblyBoothArray);
    }
  }

  onCheckChangeBooths(event: any, BoothId: any, ConstituencyId: any, AssemblyId: any, ElectionId: any) {
    if (event.target.checked == false) {
      let index = this.AssemblyBoothArray.map((x: any) => { return x.BoothId; }).indexOf(BoothId);
      this.AssemblyBoothArray.splice(index, 1);
    }
    else {
      this.AssemblyBoothArray.push({ 'BoothId': BoothId, "ConstituencyId": ConstituencyId, 'AssemblyId': AssemblyId, 'ElectionId': ElectionId });
    }
  }


  getBoothsByAssembleId(assembleId: any) {

    let data = this.assAgentToBoothForm.value;
    // data.ConstituencyId
    let url;
    this.getIsSubElectionApplicable() == 1 ? url = 'Web_Get_Booths_by_Subelection_ddl_1_0?' : url = 'Web_Get_Booths_NonSubElection_ddl?';
    this.callAPIService.setHttp('get', url + 'ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + this.filterForm.value.ConstituencyId + '&AssemblyId=' + assembleId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.boothListArray = res.data1;

        this.boothListArray.map((ele: any) => {
          this.boothListMergeArray.push(ele);
        });

        this.boothListMergeArray = this.boothListMergeArray.reduce((element: any, current: any) => {
          if (
            !element.some(
              (item: any) => item.BoothId === current.BoothId
            )
          ) {
            element.push(current);
          }
          return element;
        }, []);


        if (this.btnText == 'Update Agent') {     //on edit get obj by BoothId
          this.AssemblyBoothArray.forEach((element: any, i: any) => {
            this.boothListArray.filter((item: any) => {
              if (element == item.BoothId) {
                this.AssemblyBoothArray[i] = item;
              }
            });
          });
          this.checkBoxCehckBoothArray(this.AssemblyBoothArray);
        }

      } else {

        this.boothListArray = [];
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {

        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onSubmitAssAgentToBoothForm() {

    this.aAsubmitted = true;
    let formData = this.assAgentToBoothForm.value;

    if (this.assAgentToBoothForm.invalid) {

      return;
    }
    else if (this.AssemblyBoothArray.length == 0) {
      this.toastrService.error("Assembly Or Booth is required");

      return;
    }
    else {
      this.agentwiseAssBoothArray.length == 0 ? this.agentwiseAssigBoothArray = [] : ''; //check agent booths
      this.assemblyBoothJSON = JSON.stringify(this.AssemblyBoothArray);

      // let id;
      // formData.Id == "" || formData.Id == null  || formData.Id == undefined ? id = 0 : id = formData.Id;
      // let obj =  id + '&UserId=' + formData.UserId + '&ClientId=' + formData.ClientId
      //   + '&strAssmblyBoothId=' + this.assemblyBoothJSON + '&CreatedBy=' + this.commonService.loggedInUserId();
      // this.callAPIService.setHttp('get', 'Web_Insert_Election_AssignBoothToAgentHeader?Id=' + obj, false, false, false, 'electionServiceForWeb');

      let fromData = new FormData();
      fromData.append('Id', formData.Id);
      fromData.append('UserId', formData.UserId);
      fromData.append('ClientId', formData.ClientId);
      fromData.append('strAssmblyBoothId', this.assemblyBoothJSON);
      fromData.append('CreatedBy', this.commonService.loggedInUserId());

      this.callAPIService.setHttp('post', 'Web_Insert_Election_AssignBoothToAgentHeader_Post', false, fromData, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {

          this.toastrService.success(res.data1[0].Msg);

          this.resetAssignAgentForm();

          let closeAssignAgentModal = this.closeAssignAgent.nativeElement;
          closeAssignAgentModal.click();

          this.filterClientHaveSubEleOrNonSubEle();
          formData.Id == 0 ? this.sendDownloadLink(this.getMobileNoOnSelAgent) : '';

        } else {

          //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  sendDownloadLink(mobileNo: any) {
    this.callAPIService.setHttp('get', 'Send_App_Download_link?mobileno=' + mobileNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.toastrService.success(res.data1);
      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  // ---------------------------------------------  filter's method's start here  --------------------------------------------- //

  filterData() {
    this.paginationNo = 1;
    // this.filterClientHaveSubEleOrNonSubEle();
    this.resetAssignAgentForm();
  }

  clearFilter(flag: any) {
    if (flag == 'clientName') {
      this.defaultFilterForm();
      this.filterForm.controls['Search'].setValue('');
      this.dataNotFound = false;
    } else if (flag == 'electionId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['AssemblyId'].setValue(0);
      this.filterForm.controls['BoothId'].setValue(0);
      this.filterForm.controls['Search'].setValue('');
      //  this.clientAgentWithBoothArray = [];
      //  this.tableDataArray=[];
      this.dataNotFound = false;
    } else if (flag == 'Constituency') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['AssemblyId'].setValue(0);
      this.filterForm.controls['BoothId'].setValue(0);
      this.filterForm.controls['Search'].setValue('');
      // this.clientAgentWithBoothArray = [];
      // this.tableDataArray=[];  
      this.dataNotFound = false;
    } else if (flag == 'AssemblyId') {
      this.filterForm.controls['AssemblyId'].setValue(0);
      this.filterForm.controls['BoothId'].setValue(0);
      this.filterForm.controls['Search'].setValue('');
      // this.clientAgentWithBoothArray =[];
    }
    else if (flag == 'BoothId') {
      this.filterForm.controls['BoothId'].setValue(0);
      this.filterForm.controls['Search'].setValue('');
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
  }

  defaultFilterForm() {

    this.filterForm = this.fb.group({
      ClientId: [this.commonService.getlocalStorageData().ClientId],
      ElectionId: [0],
      ConstituencyId: [0],
      BoothId: [0],
      AssemblyId: [0],
      Search: [''],
    })
  }

  nullishTopFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0);
    fromData.BoothId ?? this.filterForm.controls['BoothId'].setValue(0);
    fromData.AssemblyId ?? this.filterForm.controls['AssemblyId'].setValue(0);
    fromData.Search ?? this.filterForm.controls['Search'].setValue('');
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
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchFilter = this.filterForm.value.Search;
      this.paginationNo = 1;
      this.filterClientHaveSubEleOrNonSubEle();
    });
  }

  clearAggentToBooth(flag: any) {
    if (flag == 'clientName') {
      this.clearAssemblyBooth();
      this.agentToBoothForm();
      this.agentwiseAssigBoothArray = [];
      // this.agentwiseAssigBoothHide = false;
      this.disabledNoOfCasesDiv = false;
    } else if (flag == 'agentName') {
      this.assAgentToBoothForm.controls['UserId'].setValue('');
      this.assAgentToBoothForm.controls['ElectionId'].setValue('');
      this.assAgentToBoothForm.controls['ConstituencyId'].setValue('');
      this.clearAssemblyBooth();
      this.agentwiseAssigBoothArray = [];
      // this.agentwiseAssigBoothHide = false;
      this.disabledNoOfCasesDiv = false;
    }
    else if (flag == 'electionName') {
      this.assAgentToBoothForm.controls['ElectionId'].setValue('');
      this.assAgentToBoothForm.controls['ConstituencyId'].setValue('');
      this.clearAssemblyBooth();
    } else if (flag == 'constituencyName') {
      this.assAgentToBoothForm.controls['ConstituencyId'].setValue('');
      this.clearAssemblyBooth();
    }
    this.paginationNo = 1;
  }

  nullishFilterForm() {
    let fromData = this.assAgentToBoothForm.value;
    fromData.ClientId ?? this.assAgentToBoothForm.controls['ClientId'].setValue(this.commonService.getlocalStorageData().ClientId);
    fromData.UserId ?? this.assAgentToBoothForm.controls['UserId'].setValue(0);
    fromData.ElectionId ?? this.assAgentToBoothForm.controls['ElectionId'].setValue(0);
    fromData.ConstituencyId ?? this.assAgentToBoothForm.controls['ConstituencyId'].setValue(0);
    fromData.AssemblyId ?? this.assAgentToBoothForm.controls['AssemblyId'].setValue(0);
    fromData.boothId ?? this.assAgentToBoothForm.controls['boothId'].setValue(0);
    fromData.CreatedBy ?? this.assAgentToBoothForm.controls['CreatedBy'].setValue(0);
  }

  clearAssemblyBooth() {
    this.boothListMergeArray = [];
    this.assemblyArray = [];
  }


  filterClientName() {
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.filterClientNameArray = res.data1;
        this.filterClientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.filterClientNameArray[0].id }),
          this.fillterElectionName()) : '';
        // this.filterClientNameArray?.length == 1  ?  this.fillterElectionName() :  '';

      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  fillterElectionName() {
    this.globalClientId = this.assAgentToBoothForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.filterElectionNameArray = res.data1;
        this.filterElectionNameArray?.length == 1 ? (this.filterForm.patchValue({ ElectionId: this.filterElectionNameArray[0].ElectionId }), this.filterConstituencyName()) : '';
      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  filterConstituencyName() {
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.filterconstituencyNameArray = res.data1;
        this.filterconstituencyNameArray?.length == 1 ? (this.filterForm.patchValue({ ConstituencyId: this.filterconstituencyNameArray[0].ConstituencyId }), this.filterAssemblyName(), this.dataNotFound = true, this.filterClientHaveSubEleOrNonSubEle()) : '';
      } else {

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  filterAssemblyName() {
    let data = this.filterForm.value;
    this.callAPIService.setHttp('get', 'Web_Get_Assembly_byClientId_ddl?ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.filterAssemblyArray = res.data1;
        this.filterAssemblyArray?.length == 1 ? (this.filterForm.patchValue({ AssemblyId: this.filterAssemblyArray[0].Id }), this.dataNotFound = true, this.filterBoothsByAssembleId(), this.filterClientHaveSubEleOrNonSubEle()) : '';
      } else { }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  filterBoothsByAssembleId() {
    let data = this.filterForm.value;
    let url;
    this.FilterIsSubElectionApplicable() == 1 ? url = 'Web_Get_Booths_by_Subelection_ddl_1_0?' : url = 'Web_Get_Booths_NonSubElection_ddl?';
    this.callAPIService.setHttp('get', url + 'ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId + '&AssemblyId=' + data.AssemblyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.filterAssembleListArray = res.data1;
        // this.filterAssembleListArray.length == 1 ? this.filterClientHaveSubEleOrNonSubEle() : '';
        this.filterForm.controls['Search'].setValue('');
      } else {
        this.filterAssembleListArray = [];

        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {

        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ClientWiseBoothList() {
    let fromData = this.filterForm.value;
    let obj = 'ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + fromData.ElectionId + '&ConstituencyId=' + fromData.ConstituencyId
      + '&AssemblyId=' + fromData.AssemblyId + '&IsSubElectionApplicable=' + this.AssemblyId + '&VillageId=' + 0

    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.filterclientWiseBoothListArray = res.data1;
      } else {
        this.filterclientWiseBoothListArray = [];

      }
    }, (error: any) => {

      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  FilterIsSubElectionApplicable() {
    let eleIsSubElectionApplicable: any;
    this.filterElectionNameArray.filter((ele: any) => {
      if (ele.ElectionId == this.filterForm.value.ElectionId) {
        eleIsSubElectionApplicable = ele.IsSubElectionApplicable
      };
    })
    return eleIsSubElectionApplicable;
  }


  filterClientHaveSubEleOrNonSubEle() {
    this.spinner.show();
    this.nullishTopFilterForm();
    let data = this.filterForm.value;
    let url;

    this.FilterIsSubElectionApplicable() == 1 ? url = 'Web_Client_AgentWithBooths_1_0?' : url = 'Web_Client_AgentWithBooths_1_0_NoSubEle?';
    this.callAPIService.setHttp('get', url + 'ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId + '&AssemblyId=' + data.AssemblyId + '&BoothId=' + data.BoothId + '&Search=' + data.Search + '&nopage=' + this.paginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientAgentWithBoothArray = res.data1;
        this.total = res.data2[0].TotalCount;
        this.isDisable = true;
        this.tableDataArray = this.clientAgentWithBoothArray.map((x: any) => x.BoothId)
          .filter((v: any, i: any, a: any) => a.indexOf(v) == i)
          .map((x: any) => ({
            boothId: x,
            data: this.clientAgentWithBoothArray.filter((y: any) => y.BoothId == x)
          }));
      } else {
        this.clientAgentWithBoothArray = [];
        this.tableDataArray = [];
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


  // ---------------------------------------------  filter's method's end here  --------------------------------------------- //

  // ------------------------------------------  add agent method's start here -------------------------------------------- //

  agentForm() {
    this.assignAgentForm = this.fb.group({
      Id: [0],
      ClientId: [''],
      FullName: [''],
      FName: ['', Validators.compose([Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')])],
      MName: ['', Validators.compose([Validators.pattern(/^[A-Za-z]+$/)])],
      LName: ['', Validators.compose([Validators.required, Validators.pattern('^[^\\s0-9\\[\\[`&._@#%*!+,|"\-\'\/\\]\\]{}][a-zA-Z]+$')])],
      Address: ['', Validators.pattern('^[^[ ]+|[ ][gm]+$')],
      MobileNo: ['', [Validators.required, Validators.pattern('[6-9]\\d{9}')]],
      IsMemberAddAllow: [''],
      CreatedBy: ['']
    })
  }

  get f() { return this.assignAgentForm.controls };

  clearAggentForm() {
    this.submitted = false;
    this.btnText = 'Add Agent';
    this.agentForm();
  }

  // ------------------------------------------  add agent method's end here -------------------------------------------- //

  //------------------------------------------   pagination start here  -------------------------------------------- //

  onClickPagintion(pageNo: number) {
    this.clearAssemblyBooth();
    this.agentToBoothForm();
    this.paginationNo = pageNo;
    this.filterClientHaveSubEleOrNonSubEle();
  }

  //------------------------------------------ edit Assign Booth Election form   ------------------------------------------  //
  patchAssBoothElection(HeaderId: any, flag: any) {
    this.resetAssignAgentForm();
    this.defaultAgentDataFlag = true;
    this.btnText = 'Update Agent';

    this.callAPIService.setHttp('get', 'Web_Election_GetBoothToAgentDetails?HeaderId=' + HeaderId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {

        this.editAssignBoothsPatchValue(res.data1[0], flag);
      } else {

        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editAssignBoothsPatchValue(objData: any, flag: any) {
    this.agentwiseAssigBoothHide = true; // all assign booths by agent are showing
    this.globalEditObj = objData;
    this.assAgentToBoothForm.patchValue({
      Id: objData.HeaderId,
      // UserId: objData.UserId,
      // ClientId: objData.ClientId,
      // ElectionId: objData.ElectionId,
      // ConstituencyId: objData.ConstituencyId,
    });
    flag != 'Add agent with Booths' ? (this.getClientName(), this.btnText = 'Update Agent') : this.getElectionName();
    // this.getClientName();

    let Assembly: any;
    typeof (objData.Assembly) == "number" ? Assembly = objData.Assembly.toString() : Assembly = objData.Assembly;
    let checkAssemblyComma = Assembly.includes(",");
    checkAssemblyComma == true ? this.ConstituencyIdArray = Assembly.split(',') : this.ConstituencyIdArray = Assembly.split(' ');

    let checkBooth: any;
    typeof (objData.BoothId) == "number" ? checkBooth = objData.BoothId.toString() : checkBooth = objData.BoothId;
    let checkBoothComma = checkBooth.includes(",");
    checkBoothComma == true ? this.AssemblyBoothArray = checkBooth.split(',') : this.AssemblyBoothArray = checkBooth.split(' ');
  }

  checkBoxCehckAssemblyArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j < this.assemblyArray.length; j++) {
        if (this.assemblyArray[j].Id == Number(ConstituencyId[i])) {
          this.assemblyArray[j].checked = true;
          this.getBoothsByAssembleId(Number(ConstituencyId[i]));
        }
      }
    }
  }

  checkBoxCehckBoothArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j < this.boothListArray.length; j++) {
        if (this.boothListArray[j].BoothId == ConstituencyId[i].BoothId) {
          this.boothListArray[j].checked = true;
        }
      }
    }
  }
  //------------------------------------------ edit Assign Booth Election form   ------------------------------------------  //

  //------------------------------------------   assign booth list modal start here  -------------------------------------------- //
  assignedBoothModel(assBoothObj: any) {
    this.assBoothObjData = assBoothObj;
  }

  addAgent() {
    this.submitted = true;
    if (this.assignAgentForm.invalid) {

      return;
    }
    else {

      let data = this.assignAgentForm.value;
      data.IsMemberAddAllow == true ? data.IsMemberAddAllow = 1 : data.IsMemberAddAllow = 0 //only assign true = 1 & false = 0
      let FullName = data.FName + " " + data.MName + " " + data.LName;
      data.FullName = FullName;
      this.globalClientId = this.assAgentToBoothForm.value.ClientId;
      let obj = data.Id + '&FullName=' + data.FullName + '&MobileNo=' + data.MobileNo
        + '&FName=' + data.FName + '&MName=' + data.MName + '&LName=' + data.LName + '&Address=' + data.Address
        + '&IsMemberAddAllow=' + data.IsMemberAddAllow + '&ClientId=' + this.filterForm.value.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId()
      this.callAPIService.setHttp('get', 'Web_Client_InsertBoothAgent?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.clientAgentListFlag = true;

          this.toastrService.success(res.data1[0].Msg);
          // this.agentModalFlag = true;
          this.openAssignAgentToBooth();
          this.Client_AgentList();
          // this.getClientAgentList();
          this.resetAgentForm();
        } else {

        }
      }, (error: any) => {

        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  openAssignAgentToBooth() {
    if (this.agentModalFlag) {
      let closeAddAgentModal = this.closeAddAgentModal.nativeElement;
      closeAddAgentModal.click();
      let el: any = this.openAssignAgentToBooths.nativeElement;
      el.click();
    }
  }
  editAgent(data: any) {
    this.btnText = 'Update Agent';
    this.assignAgentForm.patchValue({
      Id: data.UserId,
      FName: data.FName,
      MName: data.MName,
      LName: data.LName,
      Address: data.Address,
      MobileNo: data.MobileNo,
      IsMemberAddAllow: data.IsMemberAddAllow,
      CreatedBy: this.commonService.loggedInUserId()
    })
  }

  resetAgentForm() {
    this.agentForm();
    this.btnText = 'Add Agent';
    this.submitted = false;
  }
  //------------------------------------------   assign booth list modal end here  -------------------------------------------- //

  blockUser(userId: any, ClientId: any, blogStatus: any) {
    let checkBlogStatus: any;
    blogStatus == 0 ? checkBlogStatus = 1 : checkBlogStatus = 0;


    let data = this.assAgentToBoothForm.value;
    this.callAPIService.setHttp('get', 'Web_Insert_Election_BlockBoothAgent?UserId=' + userId + '&ClientId=' + ClientId + '&CreatedBy=' + this.commonService.loggedInUserId() + '&IsBlock=' + checkBlogStatus, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.filterClientHaveSubEleOrNonSubEle();
        this.Client_AgentList();

      } else {
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  showAssignBoots(data: any) {
    let BoothId: any[] = [];
    this.agentwiseAssBoothArray.forEach((ele: any) => {
      if (ele.ElectionId == data.ElectionId) {
        BoothId.push(ele.BoothId);
      }
    })
    data.BoothId = BoothId.toString();
    this.btnText = 'Update Agent';
    this.editAssignBoothsPatchValue(data, 'Add agent with Booths');
  }


  assignAgentToBooth(data: any) {
    this.disabledNoOfCasesDiv = true //  Div show on click agent
    this.btnText = 'Update Agent';
    this.assemblyId = data.Assembly;
    this.onClickBoothId = data.BoothId;
    this.editAssignBoothsPatchValue(data, false);
  }

  //................................................... Call Delete Booth Agent Api...........................//

  delConfirmation(obj: any) {
    this.deleteObj = obj;
    this.deleteConfirmModel();
  }

  deleteConfirmModel() {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.deleteBoothAgent();
      }
    });
  }

  deleteBoothAgent() {
    this.callAPIService.setHttp('get', 'Web_Delete_Booth_Agent?ClientId=' + this.deleteObj.ClientId
      + '&AgentId=' + this.deleteObj.AgentId + '&CreatedBy=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.Client_AgentList();
        this.clearAggentForm();
      } else {

      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

}

