import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';
import { MonitorService } from '../monitor.service';
import { DataPollComponent, DummyPollDataProvider, PollDataProvider, Response, SimplePollDataProvider, SimpleDummyActivityLogProvider } from '../data-poll-component';

@Component({
  selector: 'app-parking-activity-log',
  templateUrl: './parking-activity-log.component.html',
  styleUrls: ['./parking-activity-log.component.css']
})
export class ParkingActivityLogComponent extends DataPollComponent<ActivityLog> {
  displayedColumns: string[] = ['updated', 'activity', 'license', 'where', 'duration'];
  constructor(private _httpClient: HttpClient, _snackBar: MatSnackBar, _monitorSvc: MonitorService) {
    super(_snackBar, _monitorSvc);
  }

  getDummyDataSource(dataSet: any): DummyPollDataProvider<any> {
    return new DummyActivityLogProvider(dataSet);
  }

  getPollDataProvider(dummyDataProvider: DummyPollDataProvider<ActivityLog>, demoMode: boolean): PollDataProvider<any> {
    return new ActivityLogDataSource(this._httpClient, dummyDataProvider, demoMode);
  }

  iconFor(activity: string) {
    return 'PARKED' === activity ? 'directions_car' : 'transit_enterexit';
  }

}

export interface ActivityLog {
  activity: string;
  license: string,
  where: string,
  updated: Date;
  duration?: number
}

export class ActivityLogDataSource extends SimplePollDataProvider<ActivityLog> {
  constructor(private _httpClient: HttpClient, _dummyDataProvider: DummyPollDataProvider<ActivityLog>, demo: boolean) {
    super(_dummyDataProvider, demo)
  }
  doGetData(): Observable<ActivityLog[]> {
    const requestUrl = `${environment.backendURL}/api/activity-log`;
    return this._httpClient.get<ActivityLog[]>(requestUrl).pipe(catchError(error => of([])));
  }
  doClearData(): Observable<Response> {
    const requestUrl = `${environment.backendURL}/api/clear-activity-log`;
    return this._httpClient.get<Response>(requestUrl).pipe(catchError(error => of({ done: false })));
  }
}

export class DummyActivityLogProvider extends SimpleDummyActivityLogProvider<ActivityLog> {
  loadDummyData(dataSet: any): void {
    dataSet.offSets.forEach((offset, idx) => {
      let parked = 0 == idx % 2;
      let lIdx = Math.floor(idx / 2);
      let toPush = moment().add(offset, 'seconds');
      this.timestamps.push(toPush);
      this.toRet.push({
        "activity": parked ? 'PARKED' : 'EXITED',
        "duration": parked ? null : dataSet.durations[lIdx],
        "license": dataSet.licenses[lIdx],
        "updated": toPush.toDate(),
        "where": dataSet.where
      });
    });
  }
}