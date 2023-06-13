import { Component, OnInit } from '@angular/core';
import { Location} from  '@angular/common';
import {Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css']
})
export class ServerErrorComponent implements OnInit {

  constructor(public router :Router,public location:Location) { }

  ngOnInit() {
  }

  goToHome(){
    this.router.navigate(['../election-dashboard']);
  }

}
