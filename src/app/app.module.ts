import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizationService } from './auth/authorization.service';
import { NoAuthGuardService } from './auth/no-auth-guard.service';
import { PartialComponent } from './partial/partial.component';
import { FooterComponent } from './partial/template/footer/footer.component';
import { HeaderComponent } from './partial/template/header/header.component';
import { SidebarComponent } from './partial/template/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { DeleteComponent } from './partial/dialogs/delete/delete.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NameCorrectionDialogComponent } from './partial/dialogs/name-correction-dialog/name-correction-dialog.component';
import { VoterCallEntriesComponent } from './partial/dialogs/voter-call-entries/voter-call-entries.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ExcelService } from '../../src/app/services/excel.service';
import { RatingModule } from 'ng-starrating';
import { AgmDrawingModule } from '@agm/drawing';
import { AgmCoreModule } from '@agm/core';
import { GeoFanceComponent } from './partial/dialogs/geo-fance/geo-fance.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddDesignationComponent } from './partial/dialogs/add-designation/add-designation.component';
import { AddMemberComponent } from './partial/dialogs/add-member/add-member.component';
import { ActivityDetailsComponent } from './partial/dialogs/activity-details/activity-details.component';
import { RecentPostDetailsComponent } from './partial/dialogs/recent-post-details/recent-post-details.component';
import { AddCommitteeComponent } from './partial/dialogs/add-committee/add-committee.component';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { ConstituencyMasterCommitteeComponent } from './constituency-master-committee/constituency-master-committee.component';

@NgModule({
  declarations: [
    AppComponent,
    PartialComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DeleteComponent,
    VoterCallEntriesComponent,
    NameCorrectionDialogComponent,
    AddDesignationComponent,
    AddMemberComponent,
    ActivityDetailsComponent,
    RecentPostDetailsComponent,
    AddCommitteeComponent,
    GeoFanceComponent,
    ConstituencyMasterCommitteeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSelectModule,
    HttpClientModule,
    MatDialogModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,
    RatingModule,
    LightboxModule,
    NgxPaginationModule,
    DragDropModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'drawing', 'geometry'],
    }),
    AgmDrawingModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      closeButton: true,
      progressBar:true,
      preventDuplicates: true,
    }),
  ],
  providers: [DatePipe, AuthorizationService, NoAuthGuardService, AuthGuard,ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
