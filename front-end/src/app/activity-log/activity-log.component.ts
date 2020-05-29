import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort'
import { merge, Observable, of as observableOf, interval } from 'rxjs';
import { catchError, map, startWith, switchMap, mapTo } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css']
})
export class ActivityLogComponent implements OnInit {
  displayedColumns: string[] = ['updated', 'activity', 'license', 'where', 'duration'];
  dataSource: ActivityLogDataSource | null;
  data: ActivityLog[] = [];

  resultsLength = 0;
  isLoadingResults = true;

  autoRefresh = interval(environment.autoRefresh);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _httpClient: HttpClient) { }

  ngAfterViewInit() {
    this.dataSource = new ActivityLogDataSource(this._httpClient);

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
    console.log('Reset');
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

export class ActivityLogDataSource {
  constructor(private _httpClient: HttpClient) { }

  getActivityLog(): Observable<ActivityLog[]> {
    const requestUrl = `${environment.backendURL}/api/activity-log`;
    return this._httpClient.get<ActivityLog[]>(requestUrl);
  }
}
