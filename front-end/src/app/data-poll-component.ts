import { ViewChild, Input, Directive } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort'
import { merge, Observable, of as observableOf, interval, of } from 'rxjs';
import { catchError, map, startWith, switchMap, mapTo } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';
import { DemoAwareComponent } from './demo-aware-component';
import { MonitorService } from './monitor.service';
import * as moment from 'moment-timezone';

@Directive()
export abstract class DataPollComponent<T = any> extends DemoAwareComponent {
    dataSource: PollDataProvider<T> | null;
    dummyDataSource: DummyPollDataProvider<T> | null;
    data: T[] = [];

    resultsLength = 0;
    isLoadingResults = true;

    autoRefresh = interval(environment.autoRefresh);

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private _snackBar: MatSnackBar, private _monitorSvc: MonitorService) {
        super(_monitorSvc);
    }

    abstract getDummyDataSource(demoDataSet: any): DummyPollDataProvider<T>;
    abstract getPollDataProvider(dummyDataProvider: DummyPollDataProvider<T>, demoMode: boolean): PollDataProvider<T>;

    onDemoMode(isDemo: boolean) {
        if (null != this.dataSource) {
            this.dataSource.demo = isDemo;
        }
    }

    @Input()
    set beginDemo(date: Date) {
        if (null != this.dataSource && this.dataSource.demo && null != date) {
            this.dummyDataSource.startTimer();
        }
    }

    filterPageData(data: T): boolean {
        return true;
    }

    filterDataPage(page: DataPage<T>): T[] {
        return page.list.filter(entry => this.filterPageData(entry));
    }

    filterData(data: T[]): T[] {
        return data;
    }

    ngAfterViewInit() {
        this.dummyDataSource = this.getDummyDataSource(this._demoDataSet);
        this.dataSource = this.getPollDataProvider(this.dummyDataSource, this._monitorSvc.demoMode);

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page, this.autoRefresh.pipe(mapTo('autoRefresh')))
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this.dataSource.isPaged() ? this.dataSource.getDataPage() : this.dataSource!.getData(); //this.sort.active, this.sort.direction, this.paginator.pageIndex
                }),
                map(data => {
                    this.isLoadingResults = false;
                    let filtered: T[] = [];
                    if (data instanceof Array) {
                        filtered = this.filterData(data);
                    } else {
                        filtered = this.filterDataPage(data);
                    }
                    this.resultsLength = filtered.length;
                    return filtered.slice(this.paginator.pageIndex * this.paginator.pageSize, (this.paginator.pageIndex + 1) * this.paginator.pageSize);
                }),
                catchError(() => {
                    this.isLoadingResults = false;
                    return observableOf([]);
                })
            ).subscribe(data => this.data = data);
    }

    resetData() {
        this.dataSource.clearData().toPromise().then(resp => this._snackBar.open('Activity Log Cleared', null, { duration: 3000 }));
    }
}

export interface DataPage<T> {
    currentPage?: number;
    totalPages?: number;
    totalSize?: number;
    first?: boolean;
    last?: boolean;
    list: T[]
}

export interface Response {
    done: boolean
}

export interface PollDataProvider<T> {
    demo: boolean;
    isPaged(): boolean;
    getData(): Observable<T[]>;
    getDataPage(): Observable<DataPage<T>>;
    clearData(): Observable<Response>;
}

export interface DummyPollDataProvider<T> {
    startTimer(): void;
    nextData(): T[];
    nextDataPage(): DataPage<T>;
}

export abstract class SimplePollDataProvider<T> implements PollDataProvider<T> {
    constructor(private _dummyDataProvider: DummyPollDataProvider<T>, public demo: boolean) { }
    isPaged(): boolean {
        return false;
    }
    doGetDataPage(): Observable<DataPage<T>> {
        throw new Error("Method not implemented.");
    }
    abstract doGetData(): Observable<T[]>;
    abstract doClearData(): Observable<Response>;
    getData(): Observable<T[]> {
        if (this.demo) {
            return of(this._dummyDataProvider.nextData());
        } else {
            return this.doGetData();
        }
    }
    getDataPage(): Observable<DataPage<T>> {
        if (this.demo) {
            return of(this._dummyDataProvider.nextDataPage());
        } else {
            return this.doGetDataPage();
        }
    }
    clearData(): Observable<Response> {
        if (this.demo) {
            return of({ done: true });
        } else {
            return this.doClearData();
        }
    }
}

export abstract class SimpleDummyActivityLogProvider<T> implements DummyPollDataProvider<T> {
    toRet: T[] = [];
    started: any = null;
    timestamps: any = [];

    constructor(private _demoDataSet: any) {
    }
    abstract loadDummyData(dataSet: any): void;

    startTimer() {
        this.toRet = [];
        this.started = moment();
        this.timestamps = [];
        this.loadDummyData(this._demoDataSet);
    }

    nextData(): T[] {
        let ret = [];
        let chk = moment();
        this.timestamps.forEach((ts, idx) => {
            if (chk.isAfter(ts)) {
                ret.push(this.toRet[idx]);
            }
        });
        return ret.reverse();
    }

    nextDataPage(): DataPage<T> {
        return {
            list: this.nextData()
        };
    }

}