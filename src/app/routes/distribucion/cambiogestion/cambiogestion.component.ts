import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUploader } from 'ng2-file-upload';
import { CambioGestionService } from '../../../services/cambio-gestion.service';
import { DescargaGestionService } from '../../../services/descarga-gestion.service';

@Component({
    selector: 'cambiogestion',
    templateUrl: './cambiogestion.component.html'
})
export class CambioGestionComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public formLoading:boolean = false;
    public panelBusqSeleccionado: number = 0;

    frmindividual: FormGroup;
    frmasivo: FormGroup;
    listmensajeros:any = [];
    listmotivos:any = [];
    listdespachadores:any = [];
    listcodigosbarra:any=[];
    lbltituloprocesados:string='';
    lbltituloprocesadosmasivo:string='';
    max;
    observacion:string='';

    /*Grilla*/
    columns=[];
    rows=[];
    limit=5;
    count=0;
    order:string;
    selected = [];
    /*Grilla 2*/
    rows_rango=[...[]];
    count_rango=0;
    /*Grilla */
    rows_rango_masivo=[...[]];
    count_rango_masivo=0;
    /*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });
    public uploader: FileUploader = new FileUploader({ 
        queueLimit: 1,
        url: GLOBAL.url+"gestiones/descargarDocumentosFile" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });
    public uploader2: FileUploader = new FileUploader({ 
        queueLimit: 1,
        url: GLOBAL.url+"gestiones/actualizargestionFile" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });

    @ViewChild('ppBsqGuiaxCodigo') ppBsqGuiaxCodigo: ModalDirective;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;
    @ViewChild('modalDescargarGestion') modalDescargarGestion: ModalDirective;
    @ViewChild('modalDescargarMasivoGestion') modalDescargarMasivoGestion: ModalDirective;

    constructor(
        fb: FormBuilder,
        private router: Router,
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _userService: UserService,
        private _authService: AuthService,
        private _descargaGestionService: DescargaGestionService,
        private _cambioGestionService: CambioGestionService
    ){
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.max = now.toISOString().substring(0, 10);
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.frmindividual = fb.group({
            'FechaEntrega': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date,Validators.required])],
            'Motivo': ['',Validators.compose([Validators.required])],
            'codigoBarra': [{ value:'', disabled: false},Validators.compose([])]
        });
        this.frmasivo = fb.group({
            'Archivo': [{ value:'', disabled: false},Validators.compose([])]
        });
        this._userService.find({ id : this.sesion.userId },
            data=>{
                this._empresaService.mensajero(
                    { 'emp_id':data['emp_id'] },
                    data=>{ this.listmensajeros = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                this._descargaGestionService.motivo(
                    { },
                    data=>{ this.listmotivos = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                switch (this.panelBusqSeleccionado) {
                    case 0:
                    this.panelBusqSeleccionado=0;                   
                    document.getElementById('lblManualTotal').innerHTML='';
                    break;
                    case 1:
                    this.panelBusqSeleccionado=1;
                    this.frmasivo.controls['Archivo'].setValue('');                    
                    break;
                    default:
                        break;
                }
                this.uploader = new FileUploader({ 
                    queueLimit: 1,
                    url: GLOBAL.url+"gestiones/descargarDocumentosFile" ,
                    headers: [{ 
                            name:'Authorization',
                            value:localStorage.getItem('token')
                        }]
                });
                this.uploader.onBuildItemForm = (fileItem: any, form: any) => {   
                    this.formLoading = true;
                    this.loading = true;
                    form.append('fecha_entrega', this.frmindividual.controls['FechaEntrega'].value);
                    form.append('ges_id', this.frmindividual.controls['Motivo'].value.toString());
                };
                this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
                    this.loading = false;
                    this.formLoading = false;
                    this.modalDescargarGestion.hide();
                    item.remove();
                    if(response) { 
                        let data = JSON.parse(response);
                        if(data.length > 0){
                            this.rows_rango = data;
                            this.count_rango = data.length; 
                            this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron asignarse, revise la lista.');
                            
                            let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
                            alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                            
                        } else { this.showMessage('success', 'Se ha cargado la información', ''); }
                    }
                }
                this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => { 
                    this.loading = false;
                    this.formLoading = false;
                    this.modalDescargarGestion.hide();
                    if(response){
                        response = JSON.parse(response);
                            if(status ===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else if(response.error){             
                            this.showMessage('warning', response.error.message, '');               
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                    }
                }
                this.uploader2 = new FileUploader({ 
                    queueLimit: 1,
                    url: GLOBAL.url+"gestiones/actualizargestionFile" ,
                    headers: [{ 
                            name:'Authorization',
                            value:localStorage.getItem('token')
                        }]
                });
                this.uploader2.onBuildItemForm = (fileItem: any, form: any) => {                    
                    this.formLoading = true;
                    this.loading = true;
                    console.log("3");
                };
                this.uploader2.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
                    this.loading = false;
                    this.formLoading = false;
                    this.count_rango_masivo = 0;
                    item.remove();
                    if(response) {
                        let data = JSON.parse(response);
                        this.count_rango_masivo = data.length;
                        this.rows_rango_masivo = data;
                        this.observacion = this.rows_rango_masivo[0].observacion;
                        if(data.length > 1){
                            let errores = data.length - 1;
                            this.rows_rango_masivo.splice(0, 1);
                            this.mostrar_error_alerta(errores + ' documentos no pudieron asignarse, revise la lista.');
                            
                            let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
                            alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                            
                        } else { this.modalDescargarMasivoGestion.hide();this.showMessage('success', 'Se ha cargado la información', ''); }
                    }
                }
                this.uploader2.onErrorItem = (item:any, response:any, status:any, headers:any) => {
                    this.loading = false;
                    this.formLoading = false;
                    this.modalDescargarMasivoGestion.hide();
                    if(response){
                        response = JSON.parse(response);
                            if(status ===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else if(response.error){             
                            this.showMessage('warning', response.error.message, '');               
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                    }
                }                
            },
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );
    }
    ngOnInit(){  }
    codigoBarra_keypress(sender:HTMLInputElement, event){
        if (event.which == 13) {
            if(this.listcodigosbarra.indexOf(sender.value) == -1){
                if(sender.value.split(" ").length == 1){
                    this.listcodigosbarra.splice(0,0,sender.value); 
                }else {
                    if(this.listcodigosbarra.length == 0){
                        this.listcodigosbarra = sender.value.split(" ");
                    }else{
                        for(let i=0;i<sender.value.split(" ").length;i++){
                            this.listcodigosbarra.push(sender.value.split(" ")[i]);
                        }
                        
                    }
                }
                //this.listcodigosbarra.splice(0,0,sender.value); 
                document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length; 
            }
            else { this.showMessage('error', 'El código: '+sender.value+', ya ha sido agregado a la lista', ''); }
            sender.value='';
            sender.focus();
        }
    }
    eliminarCodigoLista(index){
        this.listcodigosbarra.splice(index,1);
        document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length;
    }
    actualizar(sender, alertaSonido:HTMLAudioElement) {
        this.registrar_documentos(null, alertaSonido);
    }
    registrar_documentos(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null){
        let values = this.frmindividual.value;
        this.count_rango = 0;
        this.rows_rango = [];
        this.formLoading = true;
        this.loading = true;
            let codigosBarra:string = '';
            for (let index = this.listcodigosbarra.length; index > 0; index--) {
                codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
            }      
            this.listcodigosbarra = [];
            this._cambioGestionService.actualizargestion({ 
                'fecha_entrega': this.frmindividual.controls['FechaEntrega'].value,
                'ges_id': this.frmindividual.controls['Motivo'].value,
                'cod_barra': codigosBarra
            }, data=>{
                this.formLoading = false;
                this.loading = false;
                document.getElementById('lblManualTotal').innerHTML='';
                if(data.length > 0){
                    this.rows_rango = data;
                    this.count_rango = data.length;
                    this.modalDescargarGestion.hide();
                    this.lbltituloprocesados='No Descargados';
                } else {
                    this.lbltituloprocesados='';
                    this.modalDescargarGestion.hide();
                    this.showMessage('success', 'Se ha cargado la información', '');
                }  
                                
            }, error=>{
                this.modalDescargarGestion.hide();
                document.getElementById('lblManualTotal').innerHTML='';   
                this.lbltituloprocesados='';
                this.formLoading = false;
                this.loading = false;         
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            });
        //}
    }
    actualizarMasivo(sender, alertaSonido:HTMLAudioElement) {
        this.registrar_documentos_masivo(null, alertaSonido);
    }
    registrar_documentos_masivo(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null){
        this.formLoading = true;
        this.loading = true;
        this.count_rango_masivo = 0;
        this.rows_rango_masivo = [];console.log("2");
        this.uploader2.queue.forEach(element => {
            element.upload();
            this.lbltituloprocesadosmasivo='No Descargados';
        });
    }
    file(){
        console.log("1");
        this.count_rango_masivo = 0;
    }
    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
    }
    btnActualizar_click(sender,alertaSonido:HTMLAudioElement){
        this.formLoading = true;
        this.loading = true;
        let values = this.frmindividual.value;
        for (let c in this.frmindividual.controls) {
            this.frmindividual.controls[c].markAsTouched();
        }
        if (this.frmindividual.valid) {
            if((this.frmindividual.controls['FechaEntrega'].value > this.max)){
                this.showMessage('warning', 'La fecha no puede ser mayor a la fecha actual', '');
            }else{
                this.count_rango = 0;
                this.rows_rango = [];
                if(/*(values['Opcion']=='2') &&*/ (this.listcodigosbarra.length==0)){ 
                    this.formLoading = false; this.loading = false;
                    alertaSonido.play();
                    this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
                }
                else { 
                    this.formLoading = false; this.loading = false;
                    this.modalDescargarGestion.show();
                }
            }            
        }else{
            this.formLoading = false;
            this.loading = false;
        }
        
    }
    btnActualizarMasivo_click(sender,alertaSonido:HTMLAudioElement){
        this.formLoading = true;
        this.loading = true;
        for (let c in this.frmasivo.controls) {
            this.frmasivo.controls[c].markAsTouched();
        }
        if (this.frmasivo.valid) {
            this.count_rango_masivo = 0;
            this.rows_rango_masivo = [];
            if(this.uploader2.queue.length == 0){
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el archivo a procesar', '');
            }
            else {
                this.count_rango_masivo = 0;
                this.formLoading = false; this.loading = false;
                this.modalDescargarMasivoGestion.show();
            }            
        }else{
            this.formLoading = false;
            this.loading = false;
        }        
    }
    btnVolver(event){
        this.router.navigate(['/distribucion/gestionclientes']);
    }
    hiddenDescargarGestion(){  }
    hiddenDescargarMasivoGestion(){  }
    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }
    }
    /*alerta*/
    hiddenalertDocumentos(){ }
    Aceptar_alertDocumentos(){ 
        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        alertaSonidoControl.loop = false; alertaSonidoControl.pause(); 
        this.alertDocumentos.hide(); 
        this.modalDescargarMasivoGestion.hide();
    }
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje; }
}