import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EnvironmentInjector, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, pencil, chevronForward } from 'ionicons/icons';
import { AppComponent } from 'src/app/app.component';
import { AppStorageService } from 'src/shared/app-storage.service';
import { Asset } from 'src/shared/asset';
import { UserData } from 'src/shared/user-data';

@Component({
  selector: 'app-edit-asset',
  templateUrl: 'edit-asset.page.html',
  styleUrls: ['edit-asset.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, CommonModule, HttpClientModule, IonInput, FormsModule],
})
export class EditAssetPage extends UserData implements OnInit  {

  asset: Asset | undefined;
  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    public override appStorageService: AppStorageService, 
    public override http: HttpClient, 
    public override router: Router,
    private routeActiveted: ActivatedRoute
  ) {
    super(appStorageService, http, router);
    addIcons({ add, trash, pencil, chevronForward });
  }

  async ngOnInit() {
    this.routeActiveted.paramMap.subscribe((params: ParamMap) => {
      this.asset = AppComponent.assets.find(asset => asset.code == params.get('code'));
    });
  }

  async saveAsset(){
    if(this.asset != undefined){
      let index = AppComponent.assets.findIndex(assetSearch => assetSearch.code == this.asset?.code);

      if(index !== -1){
        AppComponent.assets[index] = {...this.asset};
        await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));
      }
    }
    this.router.navigateByUrl("/tabs/carteira");
  }

  async deleteAsset(){
    if(this.asset != undefined){
      let index = AppComponent.assets.findIndex(asset => asset.code == this.asset?.code);

      if (index !== -1)
        AppComponent.assets.splice(index, 1);

      await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));
    }
    this.router.navigateByUrl("/tabs/carteira");
  }
}
