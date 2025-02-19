import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { IonContent, IonList, IonItem, IonIcon } from '@ionic/angular/standalone';
import { UserData } from 'src/shared/user-data';
import { cash } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AppStorageService } from 'src/shared/app-storage.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dividendos',
  templateUrl: 'dividendos.page.html',
  styleUrls: ['dividendos.page.scss'],
  standalone: true,
  imports: [IonContent, IonList, IonItem, IonIcon, CommonModule, HttpClientModule, FormsModule]
})
export class DividendosPage extends UserData {

  public environmentInjector = inject(EnvironmentInjector);
  seeByTotalValue: boolean = true;

  constructor(
    public override appStorageService: AppStorageService,
    public override http: HttpClient,
    public override router: Router
  ) {
    super(appStorageService, http, router);
    addIcons({ cash });
  }

}
