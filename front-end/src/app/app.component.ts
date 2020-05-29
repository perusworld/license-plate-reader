import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'License Plate Reader';
  constructor() {
    moment.tz.setDefault(environment.timezone);
  }
}
