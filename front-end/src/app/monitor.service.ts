import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

const LIVE = 'Live Mode';
const DEMO = 'Demo Mode';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  public demoMode = environment.demoMode;
  mode = DEMO;

  private demoModeSource = new BehaviorSubject<boolean>(this.demoMode);
  private resetDemoSource = new Subject<void>();
  public demoMode$ = this.demoModeSource.asObservable();
  public resetDemo$ = this.resetDemoSource.asObservable();

  constructor() { }

  toggleDemo() {
    this.demoMode = !this.demoMode;
    this.demoModeSource.next(this.demoMode)
    this.mode = this.demoMode ? DEMO : LIVE;
  }

  resetDemo() {
    if (this.demoModeSource.value) {
      this.resetDemoSource.next();
    }
  }
}
