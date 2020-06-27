import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from "./home/home.component";
import { ParkingComponent } from "./parking/parking.component";

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'parking', component: ParkingComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}
