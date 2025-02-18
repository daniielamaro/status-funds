import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonInput } from '@ionic/angular/standalone';
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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, CommonModule, HttpClientModule, IonInput, FormsModule]
})
export class AportePage extends UserData implements OnInit {

  nextSell: Asset[] = [];
  nextBuy: Asset[] = [];

  criarNovoAporte: boolean = false;

  valorAporte: number | undefined;

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

    let nextSellRaw = await this.appStorageService.Get("nextSell");
    let nextBuyRaw = await this.appStorageService.Get("nextBuy");

    if(nextSellRaw)
      this.nextSell = JSON.parse(nextSellRaw);

    if(nextBuyRaw)
      this.nextBuy = JSON.parse(nextBuyRaw);
  }

  async cancelarAporte(){
    await this.appStorageService.Set("nextSell", "[]");
    await this.appStorageService.Set("nextBuy", "[]");
    this.nextSell = [];
    this.nextBuy = [];
  }

  async confirmarAporte(){
    this.nextSell.forEach(assetForSell => {
      let index = AppComponent.assets.findIndex(asset => asset.code == assetForSell.code);

      if (index !== -1){
        AppComponent.assets[index].amount -= assetForSell.amount;
        
        if(AppComponent.assets[index].amount <= 0)
          AppComponent.assets.splice(index, 1);
      }
    });

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
  }

  async salvarConfiguracaoAporte(){
    if(!this.canSaveConfiguracao()) return;

    let totalBalanceAvaliable = (this.getTotalBalance() ?? 0) + (this.valorAporte ?? 0);

    let listAssetsForBuyAndSell: any[] = [];

    AppComponent.assets.forEach(asset => {

      let amount = Math.round((totalBalanceAvaliable * ((asset.percentWallet ?? 0)/100)) / asset.lastQuotation);
      let amountDif = amount - asset.amount;

      listAssetsForBuyAndSell.push({
        code: asset.code,
        amount: amount,
        amountDif: amountDif,
        lastQuotation: asset.lastQuotation,
        percentWallet: asset.percentWallet
      });
    });

    let totalBalanceFuture = listAssetsForBuyAndSell.reduce((total, asset) => total + asset.amount * asset.lastQuotation, 0);

    if(totalBalanceFuture > totalBalanceAvaliable){
      let listforBuy: any[] = [];

      listforBuy = [...listAssetsForBuyAndSell].map(item => {
        return {...item};
      });

      listforBuy = listforBuy.filter(asset => asset.amountDif > 0).sort((a, b) => {
        if (a.lastQuotation < b.lastQuotation) {
            return -1;
        }

        if (a.lastQuotation > b.lastQuotation) {
            return 1;
        }
        
        return 0;
      });

      listAssetsForBuyAndSell.forEach(item => {
        if(item.amountDif > 0){
          item.amount -= item.amountDif;
          item.amountDif = 0;
        }
      });

      listforBuy.forEach(itemBuy => {
        totalBalanceFuture = listAssetsForBuyAndSell.reduce((total, asset) => total + asset.amount * asset.lastQuotation, 0);
        let cont = 0;

        while(totalBalanceFuture < totalBalanceAvaliable && cont < itemBuy.amountDif){

          totalBalanceFuture = listAssetsForBuyAndSell.reduce((total, asset) => total + asset.amount * asset.lastQuotation, 0);
          
          let index = listAssetsForBuyAndSell.findIndex(item => item.code == itemBuy.code);

          if(index !== -1){
            let listAssetsForBuyAndSellBackup = [...listAssetsForBuyAndSell].map(item => {
              return {...item};
            });
            listAssetsForBuyAndSell[index].amount++;
            listAssetsForBuyAndSell[index].amountDif++;

            totalBalanceFuture = listAssetsForBuyAndSell.reduce((total, asset) => total + asset.amount * asset.lastQuotation, 0);

            if(totalBalanceFuture > totalBalanceAvaliable)
              listAssetsForBuyAndSell = [...listAssetsForBuyAndSellBackup].map(item => {
                return {...item};
              });
          }

          cont++;
        }

      });
    }

    let listTemp = listAssetsForBuyAndSell.filter(item => (item.percentWallet ?? 0) > 0).sort((a, b) => {
      if (a.lastQuotation < b.lastQuotation) {
          return -1;
      }

      if (a.lastQuotation > b.lastQuotation) {
          return 1;
      }
      
      return 0;
    });

    let contBreak = 0;

    do{

      for(let i = 0; i < listTemp.length; i++){
        
        let index = listAssetsForBuyAndSell.findIndex(item => item.code == listTemp[i].code);

        if(index !== -1){
          let listAssetsForBuyAndSellBackup = [...listAssetsForBuyAndSell].map(item => {
            return {...item};
          });
          listAssetsForBuyAndSell[index].amount++;
          listAssetsForBuyAndSell[index].amountDif++;

          totalBalanceFuture = listAssetsForBuyAndSell.reduce((total, asset) => total + asset.amount * asset.lastQuotation, 0);

          if(totalBalanceFuture > totalBalanceAvaliable){
            listAssetsForBuyAndSell = [...listAssetsForBuyAndSellBackup].map(item => {
              return {...item};
            });
            contBreak++;
            break;
          }
            
        }
        
      }
      
    }while(contBreak !== listTemp.length);

    this.nextSell = [...listAssetsForBuyAndSell].filter(item => item.amountDif < 0).map(item => {
      return new Asset(item.code, "", item.amountDif * -1);
    });

    this.nextBuy = [...listAssetsForBuyAndSell].filter(item => item.amountDif > 0).map(item => {
      return new Asset(item.code, "", item.amountDif);
    });

    await this.appStorageService.Set("nextSell", JSON.stringify(this.nextSell));
    await this.appStorageService.Set("nextBuy", JSON.stringify(this.nextBuy));
    await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));

    this.cancelarConfiguracaoAporte();
  }

  canSaveConfiguracao(){
    return !AppComponent.assets.some(asset => asset.percentWallet == undefined) && AppComponent.assets.reduce((total, asset) => total + (asset.percentWallet ?? 0), 0) == 100;
  }

}
