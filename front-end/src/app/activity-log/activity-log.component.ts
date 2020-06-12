import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort'
import { merge, Observable, of as observableOf, interval, of } from 'rxjs';
import { catchError, map, startWith, switchMap, mapTo } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css']
})
export class ActivityLogComponent implements OnInit {
  displayedColumns: string[] = ['updated', 'activity', 'license', 'where', 'duration'];
  dataSource: ActivityLogDataSource | null;
  dummyDataSource: DummyActivityLogProvider | null;
  data: ActivityLog[] = [];

  resultsLength = 0;
  isLoadingResults = true;

  autoRefresh = interval(environment.autoRefresh);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _httpClient: HttpClient, private _snackBar: MatSnackBar) { }

  @Input()
  set demoMode(demo: boolean) {
    if (null != this.dataSource) {
      this.dataSource.demo = demo;
    }
  }

  @Input()
  set beginDemo(date: Date) {
    if (this.dataSource.demo && null != date) {
      this.dummyDataSource.startTimer();
    }
  }


  ngAfterViewInit() {
    this.dummyDataSource = new DummyActivityLogProvider();
    this.dataSource = new ActivityLogDataSource(this._httpClient, this.dummyDataSource, environment.demoMode);

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.autoRefresh.pipe(mapTo('autoRefresh')))
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.dataSource!.getActivityLog(); //this.sort.active, this.sort.direction, this.paginator.pageIndex
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.length;
          return data.slice(this.paginator.pageIndex * this.paginator.pageSize, (this.paginator.pageIndex + 1) * this.paginator.pageSize);
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }

  ngOnInit(): void {
  }

  resetData() {
    this.dataSource.clearActivityLog().toPromise().then(resp => this._snackBar.open('Activity Log Cleared', null, { duration: 3000 }));
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

export interface Response {
  done: boolean
}

export class ActivityLogDataSource {
  constructor(private _httpClient: HttpClient, private _dummyDataProvider: DummyActivityLogProvider, public demo: boolean) { }
  getActivityLog(): Observable<ActivityLog[]> {
    if (this.demo) {
      return of(this._dummyDataProvider.nextActivityLog());
    } else {
      const requestUrl = `${environment.backendURL}/api/activity-log`;
      return this._httpClient.get<ActivityLog[]>(requestUrl).pipe(catchError(error => of([])));
    }
  }

  clearActivityLog(): Observable<Response> {
    if (this.demo) {
      return of({ done: true });
    } else {
      const requestUrl = `${environment.backendURL}/api/clear-activity-log`;
      return this._httpClient.get<Response>(requestUrl).pipe(catchError(error => of({ done: false })));
    }
  }
}

export class DummyActivityLogProvider {
  toRet = [];
  started: any = null;
  timestamps: any = [];

  constructor() {
  }

  startTimer() {
    this.toRet = [];
    this.started = moment();
    this.timestamps = [];
    environment.demo.offSets.forEach((offset, idx) => {
      let parked = 0 == idx % 2;
      let lIdx = Math.floor(idx / 2);
      let toPush = moment().add(offset, 'seconds');
      this.timestamps.push(toPush);
      this.toRet.push({
        "activity": parked ? 'PARKED' : 'EXITED',
        "duration": parked ? null : environment.demo.durations[lIdx],
        "license": environment.demo.licenses[lIdx],
        "updated": toPush.format('ddd, DD MMM HH:mm:ss zz'),
        "where": environment.demo.where
      });
    });
  }

  nextActivityLog(): ActivityLog[] {
    let ret = [];
    let chk = moment();
    this.timestamps.forEach((ts, idx) => {
      if (chk.isAfter(ts)) {
        ret.push(this.toRet[idx]);
      }
    });
    return ret.reverse();
  }
}