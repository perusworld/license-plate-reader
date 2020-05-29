import { Component } from '@angular/core';

import { environment } from "src/environments/environment";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent {
  feedURL = `${environment.backendURL}/video-feed`;
  constructor() { }


}

