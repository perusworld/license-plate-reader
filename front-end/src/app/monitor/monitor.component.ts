import { Component, } from '@angular/core';
import { environment } from "src/environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


const RECORD = 'fiber_manual_record';
const STOP = 'stop';
const LIVE = 'Live Mode';
const DEMO = 'Demo Mode';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent {
  recordingService: VideoRecordService | null;
  buttonIcon = RECORD;
  demoMode = environment.demoMode;
  beginDemo = null;
  videoURL = environment.demoVideoURL;
  feedURL = `${environment.backendURL}/video-feed`;
  mode = DEMO;

  constructor(private _httpClient: HttpClient, private _snackBar: MatSnackBar) { }

  ngAfterViewInit() {
    this.recordingService = new VideoRecordService(this._httpClient, this.demoMode);
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

  toggleDemo() {
    this.demoMode = !this.demoMode;
    this.mode = this.demoMode ? DEMO : LIVE;
    this.recordingService.demo = this.demoMode;
  }

  resetDemo() {
    this._snackBar.open('Resetting Demo', null, { duration: 3000 });
    if (this.demoMode) {
      let lst = document.getElementsByTagName('video');
      if (null != lst && 0 < lst.length) {
        lst[0].load();
      }
    }
  }

  playing() {
    this.beginDemo = new Date();
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
