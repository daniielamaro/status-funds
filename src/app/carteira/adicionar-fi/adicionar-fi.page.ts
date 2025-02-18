import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, pencil, chevronForward, search } from 'ionicons/icons';
import { filter } from 'rxjs';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { AppComponent } from 'src/app/app.component';
import { AppStorageService } from 'src/shared/app-storage.service';
import { Asset } from 'src/shared/asset';
import { UserData } from 'src/shared/user-data';

@Component({
  selector: 'app-adicionar-fi',
  templateUrl: 'adicionar-fi.page.html',
  styleUrls: ['adicionar-fi.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, CommonModule, HttpClientModule, IonInput, FormsModule],
})
export class AdicionarFiPage extends UserData implements OnInit  {

  asset: Asset = {
    code: "",
    name: "",
    percentWallet: undefined,
    percentVariation: 0,
    amount: 0,
    lastQuotation: 0,
    lastDividend: 0,
    paymentDate: ""
  };

  itsInTimeoutForSearch: boolean = false;

  searchAssets: any[] = [];

  step: number = 1;
  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    public override appStorageService: AppStorageService,
    public override router: Router,
    public override http: HttpClient) {
    super(appStorageService, http, router);
    addIcons({ add, trash, pencil, chevronForward, search });
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(async (eventNav: any) => {
        if(eventNav.url.includes("adicionar-fi")){
          this.resetVariables();
        }
    });
  }

  async ngOnInit() {
    this.resetVariables();
  }

  resetVariables(){
    this.step = 1;
    this.asset = {
      code: "",
      name: "",
      percentWallet: undefined,
      percentVariation: 0,
      amount: 0,
      lastQuotation: 0,
      lastDividend: 0,
      paymentDate: ""
    };
  }

  async saveAsset(){
    if(!this.canSave()) return;
    AppComponent.isLoading = true;
    AppComponent.assets.push(this.asset);
    await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));
    await this.updateAssetByCode(this.asset.code);
    AppComponent.isLoading = false;
    this.router.navigateByUrl("/tabs/carteira");
  }

  canSave(){
    return this.asset.code && this.asset.name && this.asset.amount > -1;
  }

  canContinue(){
    return this.asset.code && this.asset.name;
  }

  async changeCodeAtivo(){

    console.log("Change 1");

    if(this.itsInTimeoutForSearch) return;

    this.itsInTimeoutForSearch = true;

    await new Promise(resolve => setTimeout(resolve, 2000));
    AppComponent.isLoading = true;

    const url = 'https://corsproxy.io/?' + 'https://statusinvest.com.br/home/mainsearchquery?q='+this.asset.code;

    let searchTemp = (<any>(await firstValueFrom(this.http.get(url))));

    this.searchAssets = searchTemp.map((searchAsset: any) => {
      return {
        code: searchAsset.code,
        name: searchAsset.name
      }
    });

    this.searchAssets = this.searchAssets.filter((searchAsset: any) => !AppComponent.assets.some(asset => asset.code == searchAsset.code));

    console.log();
    console.log(this.searchAssets);

    this.searchAssets = this.searchAssets.sort((a, b) => {
      const codeA = a.code.toLowerCase();
      const codeB = b.code.toLowerCase();

      if (codeA < codeB) {
          return -1;
      }

      if (codeA > codeB) {
          return 1;
      }

      return 0;
    });

    this.itsInTimeoutForSearch = false;

    AppComponent.isLoading = false;
  }

  selectSearchAsset(event: any){
    this.asset.code = event.code;
    this.asset.name = event.name;
    this.searchAssets = [];
  }
}
