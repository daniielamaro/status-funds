import { enableProdMode, importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { IonicStorageModule } from '@ionic/storage-angular'
import { Drivers } from '@ionic/storage';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot({
      name: 'testdb',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    })),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],

});
