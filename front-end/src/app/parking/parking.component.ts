import { Component, } from '@angular/core';
import { environment } from "src/environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DemoAwareComponent } from '../demo-aware-component';
import { MonitorService } from '../monitor.service';


const RECORD = 'fiber_manual_record';
const STOP = 'stop';

@Component({
  selector: 'app-parking',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.css']
})
export class ParkingComponent extends DemoAwareComponent {
  recordingService: VideoRecordService | null;
  buttonIcon = RECORD;
  beginDemo = null;
  videoURL = environment.demoVideoURL;
  feedURL = `${environment.backendURL}/video-feed`;
  activityDemoDataSet = environment.demo.parking;

  constructor(private _httpClient: HttpClient, private _snackBar: MatSnackBar, public monitorSvc: MonitorService) {
    super(monitorSvc);
  }

  ngAfterViewInit() {
    this.recordingService = new VideoRecordService(this._httpClient, this.monitorSvc.demoMode);
  }

  toggleRecord() {
    this.buttonIcon = RECORD == this.buttonIcon ? STOP : RECORD;
    if (RECORD == this.buttonIcon) {
      this._snackBar.open('Stopping Video Feed Recording', null, { duration: 3000 });
      this.recordingService.stopRecording().toPromise().then(resp => this._snackBar.open(`Stopped Video Feed Recording -> ${resp.done}`, null, { duration: 3000 }));
    } else {
      this._snackBar.open('Starting Video Feed Recording', null, { duration: 3000 });
      this.recordingService.startRecording().toPromise().then(resp => this._snackBar.open(`Started Video Feed Recording -> ${resp.done}`, null, { duration: 3000 }));
    }
  }

  playing() {
    this.beginDemo = new Date();
  }

  onDemoMode(isDemo: boolean) {
    if (null != this.recordingService) {
      this.recordingService.demo = isDemo;
    }
  }

  onResetDemo() {
    let lst = document.getElementsByTagName('video');
    if (null != lst && 0 < lst.length) {
      lst[0].load();
    }
  }

}

export interface Response {
  done: boolean
}

export class VideoRecordService {
  constructor(private _httpClient: HttpClient, public demo: boolean) { }

  startRecording(): Observable<Response> {
    if (this.demo) {
      return of({ done: true });
    } else {
      return this.callApi('start-recording');
    }
  }

  stopRecording(): Observable<Response> {
    if (this.demo) {
      return of({ done: true });
    } else {
      return this.callApi('stop-recording');
    }
  }

  callApi(activity: string): Observable<Response> {
    const requestUrl = `${environment.backendURL}/api/${activity}`;
    return this._httpClient.get<Response>(requestUrl);
  }

}



