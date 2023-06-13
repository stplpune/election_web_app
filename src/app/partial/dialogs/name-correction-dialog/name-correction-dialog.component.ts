import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-name-correction-dialog',
  templateUrl: './name-correction-dialog.component.html',
  styleUrls: ['./name-correction-dialog.component.css']
})
export class NameCorrectionDialogComponent implements OnInit {

  nameCorrectionForm!: FormGroup;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<NameCorrectionDialogComponent>,
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    }

  ngOnInit(): void {
    console.log(this.data);
    this.nameCorrectionFormData();
  }

  closeModel(){
    this.dialogRef.close();
  }

  nameCorrectionFormData(){
    this.nameCorrectionForm = this.fb.group({
      // Id:[''],
      VoterId: ['' || this.data.Id],
      ModifiedBy: ['' || this.commonService.loggedInUserId()],
      IsNameChange: [1 || this.data.NameChanged],
      
      NewFirstName: ['' || this.data.ChangeFirstName,[Validators.required ,Validators.pattern(/^\S*$/)]],
      NewMiddleName: ['' || this.data.ChangeMiddleName,[Validators.required ,Validators.pattern(/^\S*$/)]],
      NewLastName: ['' || this.data.ChangeLastName,[Validators.required ,Validators.pattern(/^\S*$/)]],
      NewEnglishName: ['' || this.data.NewEnglishName],

      OldFirstName:['' || this.data.FirstName],
      OldMiddleName: ['' || this.data.MiddleName],
      OldLastName: ['' || this.data.LastName],
      OldEnglishName: ['' || this.data.OldEnglishName],
      ClientId: ['' || this.data.ClientId],
      ConstituencyId: ['' || this.data.AssemblyId],

      NewEFirstName: ['' || this.data.EFirst,Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      NewEMiddleName: ['' || this.data.EMiddle,Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      NewELastName: ['' || this.data.ELast,Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      NewMarathiName: ['' || this.data.NewMarathiName],
    })
  }

  get f() { return this.nameCorrectionForm.controls };

  updateNameCorrectionData() {
    this.submitted = true;
    if (this.nameCorrectionForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      this.spinner.show();
      let formData = this.nameCorrectionForm.value;

      formData.NewEnglishName = formData.NewEFirstName + " " + formData.NewEMiddleName + " " + formData.NewELastName;
      formData.NewMarathiName = formData.NewFirstName + " " + formData.NewMiddleName + " " + formData.NewLastName;

      let obj = 'VoterId=' + formData.VoterId + '&ModifiedBy=' + formData.ModifiedBy + '&IsNameChange=' + formData.IsNameChange + '&NewFirstName=' + formData.NewFirstName
      + '&NewMiddleName=' + formData.NewMiddleName + '&NewLastName=' + formData.NewLastName
      + '&NewEnglishName=' + formData.NewEnglishName + '&OldFirstName=' + formData.OldFirstName + '&OldMiddleName=' + formData.OldMiddleName + '&OldLastName=' 
      + formData.OldLastName + '&OldEnglishName=' + formData.OldEnglishName + '&ClientId=' + formData.ClientId + '&ConstituencyId=' + formData.ConstituencyId
      + '&NewEFirstName=' + formData.NewEFirstName + '&NewEMiddleName=' + formData.NewEMiddleName
      + '&NewELastName=' + formData.NewELastName + '&NewMarathiName=' + formData.NewMarathiName 

      this.callAPIService.setHttp('get', 'Web_Election_Update_VoterList?'+ obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
          this.spinner.hide();
          this.nameCorrectionFormData();
          this.closeModel();
          this.submitted = false;
        } else {
          this.spinner.hide();
          //  //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

}
