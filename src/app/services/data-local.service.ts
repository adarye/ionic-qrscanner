import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';

import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File as FileIonic } from '@ionic-native/file/ngx';

import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = []
  constructor(private storage: Storage, private navCtrl: NavController, private iab: InAppBrowser, private file: FileIonic, private emailComposer: EmailComposer) {
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
  enviarCorreo() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    arrTemp.push(titulos)
    this.guardados.forEach(registro => {
      const linea = `${registro.type}, ${registro.format},${registro.created}, ${registro.text.replace(',', ' ')} \n`
      arrTemp.push(linea);
    })
    this.crearArchivoFisico(arrTemp.join(''));
  }

  crearArchivoFisico(text: string) {
    this.file.checkFile(this.file.dataDirectory, 'registros.csv').then(existe => {
      return this.escribirEnArchivo(text);
    })
      .catch(err => {
        return this.file.createFile(this.file.dataDirectory, 'registros.csv', false)
          .then(res => {
            this.escribirEnArchivo(text)
          })
          .catch(err2 => {
            console.log(err2);
          })
      })
  }
  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);
    const archivo = this.file.dataDirectory + 'registros.csv';
    const email = {
      to: 'adavidparra0412@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo

      ],
      subject: 'Backup de scans',
      body: 'Aqu?? tiene sus backups de los scans',
      isHtml: false
    }

    // Send a text message using default options
    this.emailComposer.open(email);
  }
}
