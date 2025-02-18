import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {

  private _storage: Storage | null = null;

  constructor(private storage: Storage) { }

  async Init(){
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async Set(key: string, value: any) {
    if(this._storage == null)
      await this.Init();
    await this._storage?.set(key, value);
  }

  public async Get(key: string) {
    if(this._storage == null)
      await this.Init();
    return await this._storage?.get(key);
  }

  public async Delete(key: string) {
    if(this._storage == null)
      await this.Init();
    await this._storage?.remove(key);
  }

}
