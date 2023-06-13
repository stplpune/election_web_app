import { Component, OnInit } from '@angular/core';
import { Location} from '@angular/common';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent implements OnInit {

  constructor(public location:Location) { }

  ngOnInit() {
  }

}
