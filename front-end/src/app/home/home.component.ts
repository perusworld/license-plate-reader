import { Component, OnInit } from '@angular/core';
import { DemoAwareComponent } from '../demo-aware-component';
import { MonitorService } from '../monitor.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends DemoAwareComponent {

  constructor(_monitorSvc: MonitorService) {
    super(_monitorSvc);
  }

  onDemoMode(isDemo: boolean) {
  }

  onResetDemo() {
  }
}
