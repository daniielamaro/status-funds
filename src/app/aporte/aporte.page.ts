import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { IonContent, IonInput } from '@ionic/angular/standalone';
import { UserData } from 'src/shared/user-data';
import { cash } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AppStorageService } from 'src/shared/app-storage.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Asset } from 'src/shared/asset';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-aporte',
  templateUrl: 'aporte.page.html',
  styleUrls: ['aporte.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HttpClientModule, IonInput, FormsModule]
})
export class AportePage extends UserData implements OnInit {

  nextBuy: Asset[] = [];

  criarNovoAporte: boolean = false;

  valorAporte: number | undefined;
  lastTotalBalanceRemaining: number = 0;

  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    public override appStorageService: AppStorageService,
    public override http: HttpClient,
    public override router: Router
  ) {
    super(appStorageService, http, router);
    addIcons({ cash });
  }

  async ngOnInit() {
    this.criarNovoAporte = false;

    let nextBuyRaw = await this.appStorageService.Get("nextBuy");

    if(nextBuyRaw)
      this.nextBuy = JSON.parse(nextBuyRaw);
  }

  get getTotalNextBuy(){
    return this.nextBuy.reduce((total, asset) => total + asset.amount * asset.lastQuotation, 0);
  }

  async cancelarAporte(){
    await this.appStorageService.Set("nextBuy", "[]");
    this.nextBuy = [];
  }

  async confirmarAporte(){
    this.nextBuy.forEach(assetForBuy => {
      let index = AppComponent.assets.findIndex(asset => asset.code == assetForBuy.code);

      if (index !== -1)
        AppComponent.assets[index].amount += assetForBuy.amount;
    });

    await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));
    this.cancelarAporte();
    this.router.navigateByUrl("/tabs/carteira");
  }

  cancelarConfiguracaoAporte(){
    this.criarNovoAporte = false;
    this.valorAporte = undefined;
    this.lastTotalBalanceRemaining = 0;
  }

  async salvarConfiguracaoAporte(){
    let listAssetsForBuy = await this.calculateAporte([]);

    this.nextBuy = [...listAssetsForBuy].filter(item => item.amount > 0).map(item => {
      let asset = new Asset(item.code, "", item.amount);
      asset.lastQuotation = item.lastQuotation;
      return asset;
    });

    await this.appStorageService.Set("nextBuy", JSON.stringify(this.nextBuy));
    await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));

    this.cancelarConfiguracaoAporte();
  }

  async calculateAporte(listAssetsForBuy: any[]){
    let valorAporte = (this.valorAporte ?? 0);

    if(valorAporte ==  this.lastTotalBalanceRemaining || valorAporte <= 0) return listAssetsForBuy;
    if(!this.canSaveConfiguracao()) return listAssetsForBuy;

    this.lastTotalBalanceRemaining = valorAporte;

    let totalBalanceAvaliable = (this.getTotalBalance() ?? 0) + (this.valorAporte ?? 0);

    let totalValueBill = 0;

    AppComponent.assets.forEach(asset => {
      let amountNeeded = Math.round((totalBalanceAvaliable * ((asset.percentWallet ?? 0)/100)) / asset.lastQuotation);
      let valueByPercent = Math.round(valorAporte * (asset.percentWallet ?? 0)/100);
      let amountICanBuy = Math.floor(valueByPercent / asset.lastQuotation);

      if(asset.amount < amountNeeded && amountICanBuy > 0){
        let indexItem = listAssetsForBuy.findIndex(x => x.code == asset.code);

        if(indexItem > -1){
          listAssetsForBuy[indexItem].amount += amountICanBuy;
        }else{
          listAssetsForBuy.push({
            code: asset.code,
            amount: amountICanBuy,
            lastQuotation: asset.lastQuotation,
            percentWallet: asset.percentWallet
          });
        }

        totalValueBill += amountICanBuy*asset.lastQuotation;
      }
    });

    let totalBalanceRemaining = valorAporte - totalValueBill;

    AppComponent.assets.forEach(asset => {

      if(asset.lastQuotation <= totalBalanceRemaining){
        let indexItem = listAssetsForBuy.findIndex(x => x.code == asset.code);

        if(indexItem > -1){
          listAssetsForBuy[indexItem].amount++;
          totalBalanceRemaining -= asset.lastQuotation;
        }
      }
    });

    if(totalBalanceRemaining != 0){
      this.valorAporte = totalBalanceRemaining;
      listAssetsForBuy = await this.calculateAporte(listAssetsForBuy);
    }

    return listAssetsForBuy;
  }

  canSaveConfiguracao(){
    return !AppComponent.assets.some(asset => asset.percentWallet == undefined) && AppComponent.assets.reduce((total, asset) => total + (asset.percentWallet ?? 0), 0) == 100;
  }

}
