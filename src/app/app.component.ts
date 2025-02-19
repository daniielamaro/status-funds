import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonApp, IonLoading, IonRouterOutlet } from '@ionic/angular/standalone';
import { filter, firstValueFrom } from 'rxjs';
import { AppStorageService } from 'src/shared/app-storage.service';
import { Asset } from 'src/shared/asset';
import { UserData } from 'src/shared/user-data';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonLoading,
    CommonModule,
    HttpClientModule
  ],
})
export class AppComponent extends UserData   {

  static isLoading: boolean = false;
  static assets: Asset[] = [];

  constructor(
    public override appStorageService: AppStorageService,
    public override http: HttpClient,
    public override router: Router
  ) {
    super(appStorageService, http, router);
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(async () => {
        await this.loadData();
    });

  }

  getStatusLoading(){
    return AppComponent.isLoading;
  }
}
