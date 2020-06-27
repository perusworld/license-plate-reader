import { OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MonitorService } from './monitor.service';

export class DemoAwareComponent implements OnInit, OnDestroy {

    private demoModeRef: Subscription = null
    private resetDemoRef: Subscription = null
    _title: string = null;
    _demoDataSet: any = null;
  
    constructor(public monitorSvc: MonitorService) {
    }

    ngOnInit() {
        this.demoModeRef = this.monitorSvc.demoMode$.subscribe(mode => {
            this.onDemoMode(mode);
        });
        this.resetDemoRef = this.monitorSvc.resetDemo$.subscribe(() => {
            this.onResetDemo();
        });
    }

    ngOnDestroy() {
        this.demoModeRef.unsubscribe();
        this.resetDemoRef.unsubscribe();
    }

    toggleDemo() {
        this.monitorSvc.toggleDemo();
    }

    resetDemo() {
        this.beforeResetDemo();
        this.monitorSvc.resetDemo();
    }

    onInit() {

    }

    onDestroy() {

    }

    beforeResetDemo() {

    }

    onDemoMode(isDemo: boolean) {

    }

    onResetDemo() {

    }

    @Input()
    set demoDataSet(dataSet: any) {
      this._demoDataSet = dataSet;
    }
  
    @Input()
    set title(title: string) {
      this._title = title;
    }
  
  
}