import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUploader } from 'ng2-file-upload';
import { DescargaGestionService } from '../../../services/descarga-gestion.service';
import { MensajeroService } from '../../../services/mensajero.service';

@Component({
    selector: 'descargagestion',
    templateUrl: './descargagestion.component.html'
})
export class DescargaGestionComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public formLoading:boolean = false;
    public panelBusqSeleccionado: number = 0;

    frmanual: FormGroup;
    frmasivo: FormGroup;
    listmensajeros:any = [];
    listmotivos:any = [];
    listdespachadores:any = [];
    listcodigosbarra:any=[];
    listcodigosbarraobs:any=[];
    lbltituloprocesados:string='';
    lbltituloprocesadosmasivo:string='';
    sender:any=null;
    control:any;
    countPendientes:number=0;
    countErrores:number=0;
    countCorrectos:number=0;
    listAutomaticocodigosbarra:any=[];
    msgagregardocumento:string='';
    msgagregardocumentoestado:string='';
    max;
    datos:any={};
    codigosBarra='';
    arraydatos:any=[];
    mensajero='';
    motivo='';
    roleprod = false;

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
        url: GLOBAL.url+"gestiones/descargarMasivoDocumentosFile" ,
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
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _userService: UserService,
        private _authService: AuthService,
        private _descargaGestionService: DescargaGestionService,
        private _mensajeroService:MensajeroService
    ){
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.max = now.toISOString().substring(0, 10);
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.frmanual = fb.group({
            'Mensajero': ['',Validators.compose([Validators.required])],
            'FechaEntrega': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date,Validators.required])],
            'FechaEntregaCargo': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date,Validators.required])],
            'Motivo': ['',Validators.compose([Validators.required])],
            'Opcion': [''],
            'Archivo': [{ value:'', disabled: true},Validators.compose([])],
            'codigoBarra': [{ value:'', disabled: true},Validators.compose([])]
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
                    var opc = (<HTMLInputElement>document.getElementById('Opcion3'));
                    opc.checked = true;
                    this.Opcion_click(opc.value);                    
                    //document.getElementById('lblManualTotal').innerHTML='';
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
                    form.append('fecha_entrega', this.frmanual.controls['FechaEntrega'].value);                    
                    form.append('ges_id', this.frmanual.controls['Motivo'].value.toString());
                    form.append('men_id', this.frmanual.controls['Mensajero'].value.toString());
                    form.append('fecha_entrega_cargo', this.frmanual.controls['FechaEntregaCargo'].value);
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
                            this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron descargarse, revise la lista.');
                            
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
                    url: GLOBAL.url+"gestiones/descargarMasivoDocumentosFile" ,
                    headers: [{ 
                            name:'Authorization',
                            value:localStorage.getItem('token')
                        }]
                });
                this.uploader2.onBuildItemForm = (fileItem: any, form: any) => {                    
                    this.formLoading = true;
                    this.loading = true;
                };
                this.uploader2.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
                    this.loading = false;
                    this.formLoading = false;console.log("res",response);                    
                    item.remove();
                    if(response) {
                        let data = JSON.parse(response);
                        if(data.length > 0){
                            this.rows_rango_masivo = data;
                            this.count_rango_masivo = data.length; 
                            this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron descargarse, revise la lista.');
                            
                            let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
                            alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                            
                        } else {
                            this.showMessage('success', 'Se ha cargado la información', '');
                            this.modalDescargarMasivoGestion.hide();
                        }
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
    ngOnInit(){ 
        console.log(this._authService.getIdentity().roles);
        if(this._authService.getIdentity().roles.indexOf('produccion') != -1 && this._authService.getIdentity().roles.length == 1){
            this.roleprod = true;
            this.panelBusqSeleccionado = 1;
        }
     }
    buscarMensajero(){
        this._empresaService.mensajeroid(
            { 'men_id':this.frmanual.controls['Mensajero'].value },
            data=>{this.mensajero = data[0].men_nombre; },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );
    }
    buscarMotivo(){
        this._descargaGestionService.motivoid(
            { 'ges_id':this.frmanual.controls['Motivo'].value },
            data=>{ this.motivo = data[0].ges_nombre; },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );
    }
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
                document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length; 
            }
            else { this.showMessage('error', 'El código: '+sender.value+', ya ha sido agregado a la lista', ''); }
            sender.value='';
            sender.focus();
        }
    }
    codigoBarra2_keyup(sender:HTMLInputElement, event, alertaSonidoControl:HTMLAudioElement){
        if(sender.value == '') {
            this.msgagregardocumento = '';
            this.msgagregardocumentoestado = '';
        }
        if (event.which == 13 && sender.value != '') {
            this.msgagregardocumento = '';
            this.msgagregardocumentoestado = '';
            for (let c in this.frmanual.controls) {
                this.frmanual.controls[c].markAsTouched();
            }
            if (this.frmanual.valid) {
                if((this.frmanual.controls['FechaEntrega'].value > this.max) || (this.frmanual.controls['FechaEntregaCargo'].value > this.max)){
                    this.showMessage('warning', 'La fecha no puede ser mayor a la fecha actual', '');
                }else if( this.frmanual.controls['FechaEntrega'].value > this.frmanual.controls['FechaEntregaCargo'].value){
                    this.showMessage('warning', 'La FECHA DE ENTREGA no puede ser mayor a la FECHA DE DESCARGO', '');
                }else{
                    let value = sender.value;
                    this.sender = sender;
                    sender.value = '';
                    this.formLoading = true;
                    this.loading = true;
                    let lbExiste: boolean = false;
                    // VALIDA SI EL CODIGO DE BARRA YA FUE INGRESADO
                    for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                        if(this.listAutomaticocodigosbarra[index].codigo_barra==value){ lbExiste = true; }
                    }
                    if(!lbExiste){
                        lbExiste = false;console.log("this.mensajero:",this.mensajero);
                            this.listAutomaticocodigosbarra.splice(0,0,{'codigo_barra':value, 'estado':'Procesando', 'mensaje':'', 'mensajero':this.mensajero, 'fentrega':this.frmanual.controls['FechaEntrega'].value,'fcargo':this.frmanual.controls['FechaEntregaCargo'].value,'motivo':this.motivo});
                            this.actualiza_cantidades_automatico(); //SE ACTUALIZAN LOS ESTADOS DEL CODIGO DE BARRA
                            this.validar(value, sender, alertaSonidoControl);
                    } else {
                        this.showMessage('warning', 'El código de barras ya fue agregado', '');
                        this.formLoading = false;
                        this.loading = false;
                        sender.value = '';
                        sender.focus();
                    } 
                }              
            } else { return false; }
        }
    }
    validar(value,sender,alertaSonidoControl:HTMLAudioElement){
        this._descargaGestionService.descargaValidarMultiple({
            'cod_barra': value,
            'ges_id': this.frmanual.controls['Motivo'].value,
            'men_id': this.frmanual.controls['Mensajero'].value,
            'fecha_ent': this.frmanual.controls['FechaEntrega'].value
        }, data=>{
            this.formLoading = false;
            this.loading = false;
            if(data[0]['error'] == true || data[0]['observacion'] != ''){
                this.frmanual.controls['codigoBarra'].disable();
                let message = data[0]['codigo_barra']+'<br>'+data[0]['observacion'];
                this.mostrar_error_alerta(message);
                this.msgagregardocumento = data[0]['observacion'];
                this.control = sender;
                for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                    if(this.listAutomaticocodigosbarra[index].codigo_barra==data[0]['codigo_barra']){ 
                        /*this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':data[0]['codigo_barra'], 'estado':'Error', 'mensaje':data[0]['observacion'], 'mensajero':this.mensajero, 'fentrega':this.frmanual.controls['FechaEntrega'].value,'fcargo':this.frmanual.controls['FechaEntregaCargo'].value,'motivo':this.motivo});*/
                        this.listAutomaticocodigosbarra[index].estado = 'Error';
                        this.listAutomaticocodigosbarra[index].mensaje = data[0]['observacion'];
                    }
                }
                this.actualiza_cantidades_automatico();
                alertaSonidoControl.play(); alertaSonidoControl.loop = true;
            }else{
                //this.codigosBarra = this.codigosBarra + (this.codigosBarra != '' ? ',':'') + value;
                this.datos = {
                    'fecha_entrega': this.frmanual.controls['FechaEntrega'].value,
                    'ges_id': this.frmanual.controls['Motivo'].value,
                    'cod_barra': value,
                    'men_id': this.frmanual.controls['Mensajero'].value,
                    'fecha_entrega_cargo': this.frmanual.controls['FechaEntregaCargo'].value
                }
                this.arraydatos.push(this.datos);
            }
        }, error=>{   
            sender.value = '';    
            this.formLoading = false;
            this.loading = false;        
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
        });
    }
    actualiza_cantidades_automatico(){
        this.countPendientes = 0;
        this.countErrores = 0;
        this.countCorrectos = 0;
        document.getElementById('lblTotal').innerHTML = 'Total: ' + this.listAutomaticocodigosbarra.length.toString();
        for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
            switch (this.listAutomaticocodigosbarra[index].estado) {
                case 'Procesando':
                this.countPendientes++;
                    break;
                case 'Error':
                this.countErrores++;
                    break;
                case 'Correcto':
                this.countCorrectos++;
                    break;
                default:
                    break;
            }
            
        }
        document.getElementById('lblPendientes').innerHTML = 'Pendientes: ' + this.countPendientes.toString() + '<i class="icon icon-clock text-warning" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblErrores').innerHTML = 'Error: ' + this.countErrores.toString() + '<i class="icon icon-exclamation text-danger" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblCorrectos').innerHTML = 'Descargado: ' + this.countCorrectos.toString() + '<i class="icon icon-check text-success" style="margin-left: 15px;" title="Error"></i>';
    }
    eliminarCodigoLista(index){
        if(this.listAutomaticocodigosbarra[index].estado=='Error'){
            this.countErrores--;
            document.getElementById('lblErrores').innerHTML = 'Error: ' + this.countErrores.toString() + '<i class="icon icon-exclamation text-danger" style="margin-left: 15px;" title="Error"></i>';
        }
        if(this.listAutomaticocodigosbarra[index].estado=='Procesando'){
            this.countPendientes--;
            document.getElementById('lblPendientes').innerHTML = 'Pendientes: ' + this.countPendientes.toString() + '<i class="icon icon-clock text-warning" style="margin-left: 15px;" title="Error"></i>';
        }
        this.listAutomaticocodigosbarra.splice(index,1);
        
        document.getElementById('lblTotal').innerHTML = 'Total: ' + this.listAutomaticocodigosbarra.length.toString();
        //document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length;
    }
    descargar(sender, alertaSonido:HTMLAudioElement) {
        if(this.listAutomaticocodigosbarra)
        this.registrar_documentos(null, alertaSonido);
    }
    // registrar_documentos(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null){
    //     let values = this.frmanual.value;
    //     this.count_rango = 0;
    //     this.rows_rango = [];
    //     this.formLoading = true;
    //     this.loading = true;
    //     if(values['Opcion']=='1'){
    //         this.uploader.queue.forEach(element => {
    //             element.upload();
    //             this.lbltituloprocesados='No Descargados';
    //         });
    //     }else{
    //         let codigosBarra = '';
    //         for (let i = this.listAutomaticocodigosbarra.length; i > 0; i--) {
    //             if(this.listAutomaticocodigosbarra[i-1].estado == "Procesando"){
    //                 codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listAutomaticocodigosbarra[i-1].codigo_barra;
    //             } 
    //         }
    //         // for (let index = this.listcodigosbarra.length; index > 0; index--) {
    //         //     codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
    //         // }
    //         this.listcodigosbarra = [];
    //         if(codigosBarra != ''){
    //             this._descargaGestionService.descargardocumentos({ 
    //                 'fecha_entrega': this.frmanual.controls['FechaEntrega'].value,
    //                 'ges_id': this.frmanual.controls['Motivo'].value,
    //                 'cod_barra': codigosBarra ,
    //                 'men_id': this.frmanual.controls['Mensajero'].value,
    //                 'fecha_entrega_cargo': this.frmanual.controls['FechaEntregaCargo'].value,
    //             }, data=>{ 
    //                 this.formLoading = false;
    //                 this.loading = false;
    //                 //document.getElementById('lblManualTotal').innerHTML='';
                    
    //                 if(data.length > 0){
    //                     this.frmanual.controls['codigoBarra'].disable();
    //                     let message = data[0]['codigo_barra']+'<br>'+data[0]['observacion'];
    //                     this.mostrar_error_alerta(message);
    //                     this.msgagregardocumento = data[0]['observacion'];
    //                     //this.control = sender;
    //                     for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
    //                         if(this.listAutomaticocodigosbarra[index].codigo_barra==data[0]['codigo_barra']){ 
    //                             this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':data[0]['codigo_barra'], 'estado':'Error', 'mensaje':data[0]['observacion']});
    //                             this.actualiza_cantidades_automatico();
    //                         }
    //                     }
    //                     alertaSonidoControl.play(); alertaSonidoControl.loop = true;
    //                 } else {
    //                     //this.control.value='';
    //                     this.lbltituloprocesados='';
    //                     this.showMessage('success', 'Se ha cargado la información', '');
    //                     this.modalDescargarGestion.hide();
    //                 }
    //                 let index;
    //                 let array = codigosBarra.split(",");console.log("array: ",array, this.listAutomaticocodigosbarra);
    //                 for (index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
    //                     for(let i = 0; i < array.length; i++){
    //                         if(this.listAutomaticocodigosbarra[index].codigo_barra==array[i]){
    //                             this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':array[i], 'estado':'Correcto', 'mensaje':'Documento agregado'});
    //                             this.actualiza_cantidades_automatico();
    //                         }
    //                     }
    //                 }
                                    
    //             }, error=>{
    //                 this.modalDescargarGestion.hide();
    //                 //document.getElementById('lblManualTotal').innerHTML='';   
    //                 this.lbltituloprocesados='';
    //                 this.formLoading = false;
    //                 this.loading = false;         
    //                 if(error.status===401){
    //                     this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
    //                 }else{                  
    //                     this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
    //                 }
    //             });
    //         }else{
    //             this.showMessage('error', 'Ingrese documentos válidos', '');
    //         }
    //     }
    // }


    registrar_documentos(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null){
        let values = this.frmanual.value;
        this.count_rango = 0;
        this.rows_rango = [];
        this.formLoading = true;
        this.loading = true;
        if(values['Opcion']=='1'){
            this.uploader.queue.forEach(element => {
                element.upload();
                this.lbltituloprocesados='No Descargados';
            });
        }else{
            let codigosBarra = '';
            for (let i = this.listAutomaticocodigosbarra.length; i > 0; i--) {
                if(this.listAutomaticocodigosbarra[i-1].estado == "Procesando"){
                    codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listAutomaticocodigosbarra[i-1].codigo_barra;
                } 
            }
            var descarga = '';
            for (let i = 0; i < this.arraydatos.length; i++) {
                descarga = descarga + (descarga != '' ? ',':'') + this.arraydatos[i].cod_barra + ';' + this.arraydatos[i].men_id + ';' + this.arraydatos[i].fecha_entrega + ';' + this.arraydatos[i].fecha_entrega_cargo + ';' + this.arraydatos[i].ges_id;
            }
            console.log("descarga",descarga);
            this.listcodigosbarra = [];
            this.arraydatos = []
            if(descarga != ''){
                this._descargaGestionService.descargardocumentos({
                    'datosDescarga': descarga
                }, data=>{ 
                    this.formLoading = false;
                    this.loading = false;
                    
                    if(data.length > 0){
                        this.frmanual.controls['codigoBarra'].disable();
                        let message = data[0]['codigo_barra']+'<br>'+data[0]['observacion'];
                        this.mostrar_error_alerta(message);
                        this.msgagregardocumento = data[0]['observacion'];
                        let errores = [];
                        let posicion = 0;
                        for(let i in data){
                            errores.push(data[i]['codigo_barra']);
                        }
                        for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                            if(errores.indexOf(this.listAutomaticocodigosbarra[index].codigo_barra) != 1){
                            //if(this.listAutomaticocodigosbarra[index].codigo_barra==data[0]['codigo_barra']){ 
                                /*this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':data[0]['codigo_barra'], 'estado':'Error', 'mensaje':data[0]['observacion'],'mensajero':this.mensajero, 'fentrega':this.frmanual.controls['FechaEntrega'],'fcargo':this.frmanual.controls['FechaEntregaCargo'],'motivo':this.motivo});*/
                                posicion = errores.indexOf(this.listAutomaticocodigosbarra[index].codigo_barra);
                                this.listAutomaticocodigosbarra[index].estado = 'Error';
                                this.listAutomaticocodigosbarra[index].mensaje = data[posicion]['observacion'];
                            }
                        }
                        this.actualiza_cantidades_automatico();
                        alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                    } //else {
                        this.formLoading = false;
                        this.loading = false;
                        this.lbltituloprocesados='';
                        this.showMessage('success', 'Se ha cargado la información', '');
                        this.modalDescargarGestion.hide();
                        //let array = codigosBarra.split(",");console.log("array: ",array);
                        console.log("array ini=",this.listAutomaticocodigosbarra);
                        for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                            //for(let i = 0; i < array.length; i++){
                                //if(this.listAutomaticocodigosbarra[index].codigo_barra==array[index]){
                                //if(array.indexOf(this.listAutomaticocodigosbarra[index].codigo_barra) != 1){
                                if(this.listAutomaticocodigosbarra[index].estado != 'Error'){
                                    /*this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':array[index], 'estado':'Correcto', 'mensaje':'Documento agregado','mensajero':this.mensajero, 'fentrega':this.frmanual.controls['FechaEntrega'].value,'fcargo':this.frmanual.controls['FechaEntregaCargo'].value,'motivo':this.motivo});*/
                                    this.listAutomaticocodigosbarra[index].estado = 'Correcto';
                                    this.listAutomaticocodigosbarra[index].mensaje = 'Documento agregado';
                                }
                            //}
                        }
                        this.actualiza_cantidades_automatico();
                        console.log("array fin=",this.listAutomaticocodigosbarra);
                        //}
                    
                                    
                }, error=>{
                    this.modalDescargarGestion.hide(); 
                    this.lbltituloprocesados='';
                    this.formLoading = false;
                    this.loading = false;         
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                });
            }else{
                this.formLoading = false;
                this.loading = false;
                this.showMessage('error', 'Ingrese documentos válidos', '');
                this.modalDescargarGestion.hide();
            }
        }
    }
    descargarMasivo(sender, alertaSonido:HTMLAudioElement) {
        this.registrar_documentos_masivo(null, alertaSonido);
    }
    registrar_documentos_masivo(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null){
        this.formLoading = true;
        this.loading = true;
        this.count_rango_masivo = 0;
        this.rows_rango_masivo = [];
        this.uploader2.queue.forEach(element => {
            element.upload();
            this.lbltituloprocesadosmasivo='No Descargados';
        });
    }
    Opcion_click(opcion_value){
        this.frmanual.controls['Opcion'].setValue(opcion_value);
        this.habilita_opciones(opcion_value);        
    }
    habilita_opciones(opcion_selected){
        this.frmanual.controls['Archivo'].setValue('');
        this.frmanual.controls['codigoBarra'].reset();
        this.listcodigosbarra = [];
        
        switch (opcion_selected) {
            case '1':
                this.frmanual.controls['Archivo'].enable();
                this.frmanual.controls['codigoBarra'].disable();
                break;
            case '2':
                this.frmanual.controls['Archivo'].disable();
                this.frmanual.controls['codigoBarra'].enable();
                break;
            default:
                break;
        }
    }
    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
    }
    btnDescargar_click(sender,alertaSonido:HTMLAudioElement){
        this.formLoading = true;
        this.loading = true;
        let values = this.frmanual.value;
        for (let c in this.frmanual.controls) {
            this.frmanual.controls[c].markAsTouched();
        }
        if (this.frmanual.valid) {
            if(this.frmanual.controls['FechaEntrega'].value > this.max || this.frmanual.controls['FechaEntregaCargo'].value > this.max){
                this.showMessage('warning', 'La fecha no puede ser mayor a la fecha actual', '');
            }else{
                this.count_rango = 0;
                this.rows_rango = [];
                if((values['Opcion']=='2') && ((this.listAutomaticocodigosbarra.length==0) || this.countPendientes == 0)){ 
                    this.formLoading = false; this.loading = false;
                    alertaSonido.play();
                    this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
                } else if(values['Opcion']=='1'&& this.uploader.queue.length == 0){
                    this.formLoading = false; this.loading = false;
                    alertaSonido.play();
                    this.showMessage('error', 'No ha especificado el archivo a procesar', '');
                }
                else { 
                    this.formLoading = false; this.loading = false;
                    this.modalDescargarGestion.show();
                }
            }          
        }else{
            this.formLoading = false;
            this.loading = false;
            this.showMessage('error', 'Debe completar la información necesaria', '');
        }
        
    }
    btnDescargarMasivo_click(sender,alertaSonido:HTMLAudioElement){
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
                this.formLoading = false; this.loading = false;
                this.modalDescargarMasivoGestion.show();
            }            
        }else{
            this.formLoading = false;
            this.loading = false;
        }        
    }
    btnLimpiar(){
        this.listAutomaticocodigosbarra = [];
        this.countPendientes = 0;
        this.countErrores = 0;
        this.countCorrectos = 0;
        document.getElementById('lblTotal').innerHTML = 'Total: ' + this.listAutomaticocodigosbarra.length.toString();
        document.getElementById('lblPendientes').innerHTML = 'Pendientes: ' + this.countPendientes.toString() + '<i class="icon icon-clock text-warning" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblErrores').innerHTML = 'Error: ' + this.countErrores.toString() + '<i class="icon icon-exclamation text-danger" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblCorrectos').innerHTML = 'Descargado: ' + this.countCorrectos.toString() + '<i class="icon icon-check text-success" style="margin-left: 15px;" title="Error"></i>';
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
        this.modalDescargarGestion.hide();
        if(this.panelBusqSeleccionado == 0){
        this.frmanual.controls['codigoBarra'].enable();
        this.control.value='';
        this.control.focus();}
        else{
            this.modalDescargarMasivoGestion.hide();
        }
    }
    mostrar_error_alerta(sMensaje:string){        
        this.alertDocumentos.show();
        console.log("sMensaje",sMensaje);
        document.getElementById('alertDocumentos_msj').innerHTML=sMensaje;
    }

    selectElementContents() {
        let el = document.getElementById('tabletocopy');
        var body = document.body, range, sel;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
            document.execCommand("copy");
        }
    }
}