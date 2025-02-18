import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { Router, RouterLinkWithHref } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, pencil, chevronForward } from 'ionicons/icons';
import { AppStorageService } from 'src/shared/app-storage.service';
import { UserData } from 'src/shared/user-data';

@Component({
  selector: 'app-carteira',
  templateUrl: 'carteira.page.html',
  styleUrls: ['carteira.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, CommonModule, HttpClientModule, RouterLinkWithHref],
})
export class CarteiraPage extends UserData implements OnInit  {

  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    public override appStorageService: AppStorageService, 
    public override http: HttpClient,
    public override router: Router
  ) {
    super(appStorageService, http, router);
    addIcons({ add, trash, pencil, chevronForward });
  }

  async ngOnInit() {
  }
}
