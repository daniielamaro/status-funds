import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppStorageService } from './app-storage.service'
import { Asset } from './asset';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { AppComponent } from 'src/app/app.component';
import { filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

export class UserData {

    todayDay: Date;
    monthNames: string[] = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    constructor(public appStorageService: AppStorageService, public http: HttpClient, public router: Router){
        this.todayDay = new Date();
        this.todayDay.setHours(0, 0, 0, 0);
    }

    getAssets(){
        return AppComponent.assets;
    }

    async loadData(forceUpdate: boolean = false){

        let assetsRaw = await this.appStorageService.Get("assets");

        if(assetsRaw){
            AppComponent.assets = JSON.parse(assetsRaw);

            this.reorderAssets();

            let lastUpdated = await this.appStorageService.Get("lastUpdated");
            let lastUpdatedDate = new Date();

            if(lastUpdated){
                lastUpdatedDate = new Date(lastUpdated);
                lastUpdatedDate.setHours(19,0,0,0);
            }

            if(new Date() > lastUpdatedDate || forceUpdate){

                AppComponent.isLoading = true;

                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 1);
                lastUpdatedDate = newDate;
                await this.appStorageService.Set("lastUpdated", lastUpdatedDate.toDateString());

                await this.updateAssetApi(AppComponent.assets.length - 1);
                await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));

                AppComponent.isLoading = false;

            }

        }
    }

    async updateAssetApi(index: number){
        if(index < 0) return;

        let searchCotation: boolean = true;
        let searchDividends: boolean = true;

        let delayBetweenSearchies = 100;

        let asset = AppComponent.assets[index];

        do{
          try{
            const url = 'https://corsproxy.io/?' + 'https://statusinvest.com.br/home/mainsearchquery?q='+asset.code;

            let respQuotationStatusInvest = (<any>(await firstValueFrom(this.http.get(url))));

            let item = respQuotationStatusInvest.find((itemResp: any) => itemResp.code.toUpperCase() == asset.code.toUpperCase());

            asset.lastQuotation = Number(item.price.replaceAll('.', '').replaceAll(',', '.'));
            asset.percentVariation = Number(item.variation.replaceAll('.', '').replaceAll(',', '.'));

            searchCotation = false;

          }catch(error: any){
              await new Promise(resolve => setTimeout(resolve, delayBetweenSearchies));
              delayBetweenSearchies = delayBetweenSearchies * 2;
          }
        }while(searchCotation);

        delayBetweenSearchies= 100;

        do{
            try{
                asset.paymentDate = "";
                asset.lastDividend = 0;

                const url = 'https://corsproxy.io/?' + 'https://statusinvest.com.br/fii/companytickerprovents?ticker='+asset.code;

                let resp = (<any>(await firstValueFrom(this.http.get(url))));

                if(resp && resp.assetEarningsModels.length > 0){
                    let dividend = resp.assetEarningsModels.find((assetEarning: any) => {
                        let dateString = assetEarning.pd;
                        let partsDateString = dateString.split("/");

                        let dateProvision = new Date(partsDateString[2], partsDateString[1] - 1, partsDateString[0]);

                        return this.todayDay.getFullYear() == dateProvision.getFullYear() && this.todayDay.getMonth() == dateProvision.getMonth()
                    });

                    if(dividend){
                        let dateString = dividend.pd;
                        let partsDateString = dateString.split("/");

                        let dateProvision = new Date(partsDateString[2], partsDateString[1] - 1, partsDateString[0]);

                        asset.paymentDate = dateProvision.toDateString();
                        asset.lastDividend = dividend.v;
                    }
                }

                searchDividends = false;

            }catch(error: any){
                await new Promise(resolve => setTimeout(resolve, delayBetweenSearchies));
                delayBetweenSearchies = delayBetweenSearchies * 2;
            }
        }while(searchDividends);

        AppComponent.assets[index] = asset;

        await this.updateAssetApi(index - 1);
    }

    async updateAssetByCode(code: string){
        let assetsRaw = await this.appStorageService.Get("assets");

        if(assetsRaw)
            AppComponent.assets = JSON.parse(assetsRaw);

        let index = AppComponent.assets.findIndex(assetFind => assetFind.code == code);

        if(index < 0) return;

        let searchCotation: boolean = true;
        let searchDividends: boolean = true;

        let delayBetweenSearchies = 100;

        let asset = AppComponent.assets[index];

        do{
          try{
            const url = 'https://corsproxy.io/?' + 'https://statusinvest.com.br/home/mainsearchquery?q='+asset.code;

            let respQuotationStatusInvest = (<any>(await firstValueFrom(this.http.get(url))));

            let item = respQuotationStatusInvest.find((itemResp: any) => itemResp.code.toUpperCase() == asset.code.toUpperCase());

            asset.lastQuotation = Number(item.price.replaceAll('.', '').replaceAll(',', '.'));
            asset.percentVariation = Number(item.variation.replaceAll('.', '').replaceAll(',', '.'));

            searchCotation = false;

          }catch(error: any){
              await new Promise(resolve => setTimeout(resolve, delayBetweenSearchies));
              delayBetweenSearchies = delayBetweenSearchies * 2;
          }
        }while(searchCotation);

        delayBetweenSearchies= 100;

        do{
            try{
                asset.paymentDate = "";
                asset.lastDividend = 0;

                const url = 'https://corsproxy.io/?' + 'https://statusinvest.com.br/fii/companytickerprovents?ticker='+asset.code;

                let resp = (<any>(await firstValueFrom(this.http.get(url))));

                if(resp && resp.assetEarningsModels.length > 0){
                    let dividend = resp.assetEarningsModels.find((assetEarning: any) => {
                        let dateString = assetEarning.pd;
                        let partsDateString = dateString.split("/");

                        let dateProvision = new Date(partsDateString[2], partsDateString[1] - 1, partsDateString[0]);

                        return this.todayDay.getFullYear() == dateProvision.getFullYear() && this.todayDay.getMonth() == dateProvision.getMonth()
                    });

                    if(dividend){
                        let dateString = dividend.pd;
                        let partsDateString = dateString.split("/");

                        let dateProvision = new Date(partsDateString[2], partsDateString[1] - 1, partsDateString[0]);

                        asset.paymentDate = dateProvision.toDateString();
                        asset.lastDividend = dividend.v;
                    }
                }

                searchDividends = false;

            }catch(error: any){
                await new Promise(resolve => setTimeout(resolve, delayBetweenSearchies));
                delayBetweenSearchies = delayBetweenSearchies * 2;
            }
        }while(searchDividends);

        AppComponent.assets[index] = asset;

        await this.appStorageService.Set("assets", JSON.stringify(AppComponent.assets));

        this.reorderAssets();
    }

    reorderAssets(){
        AppComponent.assets = AppComponent.assets.sort((a, b) => {
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
    }

    getValueFormated(value: number) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    getCurrentMonthName(){
        return this.monthNames[this.todayDay.getMonth()];
    }

    getPerformanceTotal(){
        let percent = (this.getTotalDividends() * 100) / this.getTotalBalance();

        if(isNaN(percent) || !isFinite(percent))
            return '0.00%'

        return percent.toFixed(2) + "%";
    }

    getPercentTotalDividendsReceived(){
        let percent = (this.getDividendsReceived() * 100) / this.getTotalDividends();

        if(isNaN(percent) || !isFinite(percent))
            return '0%'

        return percent.toFixed(0) + "%";
    }

    getTotalBalance(){
        return AppComponent.assets.reduce((total, asset) => total + this.getBalanceTotal(asset), 0);
    }

    getTotalDividends(){
        let assetsForThismonth = AppComponent.assets.filter(asset => {
            if(!asset.paymentDate)
                return false;

            let date = new Date(asset.paymentDate);

            return  date.getFullYear() == this.todayDay.getFullYear() &&
                    date.getMonth() == this.todayDay.getMonth()
        });
        return assetsForThismonth.reduce((total, asset) => total + this.getPaymentTotal(asset), 0);
    }

    getDividendsReceived(){
        let assetsReceived = AppComponent.assets.filter(asset => {
            if(!asset.paymentDate)
                return false;

            let date = new Date(asset.paymentDate);

            return  date.getFullYear() == this.todayDay.getFullYear() &&
                    date.getMonth() == this.todayDay.getMonth() &&
                    date.getDate() <= this.todayDay.getDate();
        });
        return assetsReceived.reduce((total, asset) => total + this.getPaymentTotal(asset), 0);
    }

    getDividendsReceivable(){
        let assetsForReceive = AppComponent.assets.filter(asset => {
            if(!asset.paymentDate)
                return false;

            let date = new Date(asset.paymentDate);

            return  date.getFullYear() == this.todayDay.getFullYear() &&
                    date.getMonth() == this.todayDay.getMonth() &&
                    date.getDate() > this.todayDay.getDate();
        });
        return assetsForReceive.reduce((total, asset) => total + this.getPaymentTotal(asset), 0);
    }

    getPercentVariationFormated(asset: Asset){
        return asset.percentVariation.toFixed(2) + "%";
    }

    calculatePerformance(asset: Asset){
        let percent = (this.getPaymentTotal(asset) * 100) / this.getBalanceTotal(asset);

        if(isNaN(percent) || !isFinite(percent))
            return '0.00%'

        return percent.toFixed(2) + "%";
    }

    getBalanceTotal(asset: Asset){
        return asset.amount * asset.lastQuotation;
    }

    getPaymentTotal(asset: Asset){
        return asset.amount * asset.lastDividend;
    }

    getRemainingDaysForPayment(asset: Asset){
        if(!asset.paymentDate) return -999;

        let date = new Date(asset.paymentDate);

        return date.getDate() - this.todayDay.getDate();
    }
}
