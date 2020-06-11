import { Component } from '@angular/core';
import { environment } from "src/environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


const RECORD = 'fiber_manual_record';
const STOP = 'stop';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent {
  recordingService: VideoRecordService | null;
  buttonIcon = RECORD;
  feedURL = `${environment.backendURL}/video-feed`;
  constructor(private _httpClient: HttpClient, private _snackBar: MatSnackBar) { }

  ngAfterViewInit() {
    this.recordingService = new VideoRecordService(this._httpClient);
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

}

export interface Response {
  done: boolean
}

export class VideoRecordService {
  constructor(private _httpClient: HttpClient) { }

  startRecording(): Observable<Response> {
    return this.callApi('start-recording');
  }

  stopRecording(): Observable<Response> {
    return this.callApi('stop-recording');
  }

  callApi(activity: string): Observable<Response> {
    const requestUrl = `${environment.backendURL}/api/${activity}`;
    return this._httpClient.get<Response>(requestUrl);
  }
}
