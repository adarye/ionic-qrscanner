import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';

import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = []
  constructor(private storage: Storage, private navCtrl: NavController, private iab: InAppBrowser) {
    this.init();
  }
  async init() {
    const storage = await this.storage.create();
    this.cargarStorage();

  }
  guardarRegistro(format: string, text: string) {
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
  }
  async cargarStorage() {
    this.guardados = await this.storage.get('registros') || [];

  }
  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');
    console.log(registro.type);
    switch (registro.type) {
      case 'Pagina Web':
        const browser = this.iab.create(registro.text, '_system');
        break;
      case 'Maps':
        this.navCtrl.navigateForward('/tabs/tab2/mapa:' + registro.text);
        break;
    }
  }
}
