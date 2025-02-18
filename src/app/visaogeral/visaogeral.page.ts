import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sync } from 'ionicons/icons';
import { AppStorageService } from 'src/shared/app-storage.service';
import { UserData } from 'src/shared/user-data';

@Component({
  selector: 'app-visaogeral',
  templateUrl: 'visaogeral.page.html',
  styleUrls: ['visaogeral.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, HttpClientModule, IonIcon],
})
export class VisaoGeralPage extends UserData implements OnInit {

  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    public override appStorageService: AppStorageService, 
    public override http: HttpClient,
    public override router: Router
  ) {
    super(appStorageService, http, router);
    addIcons({ sync });
  }

  async ngOnInit() {
  }

}
