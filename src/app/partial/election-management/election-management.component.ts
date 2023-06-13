import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class ElectionManagementComponent implements OnInit {
 
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
