import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import * as moment from 'moment-timezone';
import { MonitorService } from './monitor.service';
import { DemoAwareComponent } from './demo-aware-component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends DemoAwareComponent {
  public demoMode = false;
  _title = 'License Plate Reader';

  constructor(private _snackBar: MatSnackBar, public monitorSvc: MonitorService) {
    super(monitorSvc);
    moment.tz.setDefault(environment.timezone);
  }

  beforeResetDemo() {
    this._snackBar.open('Resetting Demo', null, { duration: 3000 });
  }

}
