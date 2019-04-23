import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { GLOBAL } from '../../../global';
import { TipoReseteoService } from '../../../services/tipo-reseteo.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DocumentoReseteoService  } from '../../../services/documento-reseteo.service';

@Component({
    selector: 'reseteoeditar',
    templateUrl: './reseteoeditar.component.html'
})
export class ReseteoEditarComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public formLoading:boolean = false;
    listusuarios:any = [];
    listtipos:any = [];
    frmbusqueda: FormGroup;
    frmAgregar: FormGroup;
    navigator: any = navigator;
    listagregar:any = [];
    listagregarcodigos:any = [];
    listcodigosbarra:any=[];

    /*Grilla*/
    columns=[];
    rows=[];
    limit=5;
    count=0;
    order:string;
    selected = [];
    /*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });
    @ViewChild('ppAgregarDocumentos') ppAgregarDocumentos: ModalDirective;
    @ViewChild('ppResetearDocumentos') ppResetearDocumentos: ModalDirective;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;

    constructor(
        fb: FormBuilder,
        private toasterService: ToasterService,
        private _tipoReseteoSrv: TipoReseteoService,
        private router: Router,
        private _documentoReseteoService: DocumentoReseteoService
    ){
        let fechadesde: Date = new Date();
        fechadesde.setDate(fechadesde.getDate() - 15);
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.frmbusqueda = fb.group({
            'tipo': ['',Validators.compose([Validators.required])],
            'toatldocumentoscampo': [{value:'', disabled:true},Validators.compose([])],
            'toatldocumentos': ['',Validators.compose([Validators.required])],
            'motivo': ['',Validators.compose([Validators.required])]
        });
        this.frmAgregar = fb.group({
            'codigobarra': ['',Validators.compose([Validators.required])]
        });
        this._tipoReseteoSrv.lista({},
            data=>{ this.listtipos = data; },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
            }
        );
    }
    ngOnInit(){
        
    }
    //eventos formulario
    frmbusqueda_submit(event, formValues){ 
        for (let c in this.frmbusqueda.controls) {
            this.frmbusqueda.controls[c].markAsTouched();
        }
        if (this.frmbusqueda.valid) {  
            this.ppResetearDocumentos.show();
        }
    }
    btnAgregar_click(sender){
        if(this.frmbusqueda.controls['tipo'].value === ''){
            this.showMessage('error', 'No ha especificado la acción a realizar', '');
        }else{
            this.ppAgregarDocumentos.show();
        }
    }
    /*grilla*/
    onPage(event){  }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {  }

    codigoBarra_keydown(event){
        let codigoBarra = event.target.value;
        if (event.which == 13 && codigoBarra!='') {
            this.consultarCodigoBarra(codigoBarra);
            event.target.value='';
            event.target.focus();
        }
    }
    btnAgregardocumento_click(event, alertaSonido:HTMLAudioElement){
        document.getElementById('lblManualTotal').innerHTML='';
        this.formLoading = true;
        this.loading = true;
        this.count = 0;
        for (let c in this.frmAgregar.controls) {
            this.frmAgregar.controls[c].markAsTouched();
        }
        if (this.frmAgregar.valid) {
            if(this.listcodigosbarra.length==0){ 
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
            }
            else {
                this.formLoading = true;
                this.loading = true;
                
                let codigosBarra:string = '';
                codigosBarra = this.listcodigosbarra.join();
                //for (let index = this.listcodigosbarra.length; index > 0; index--) {
                    //codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
                    
                //}
                this.listcodigosbarra = [];
                this.consultarCodigoBarra(codigosBarra);
            }            
        }else{
            this.formLoading = false;
            this.loading = false;
        }
    }
    /*btnAgregardocumento_click(event, campoCodigoBarra:HTMLInputElement){
        let codigoBarra = campoCodigoBarra.value; console.log("cod: ",codigoBarra);
        if (codigoBarra!='') {
            this.consultarCodigoBarra(codigoBarra);
            campoCodigoBarra.value='';
            campoCodigoBarra.focus();
        }
    }*/
    consultarCodigoBarra(codigobarra:string){
        if(codigobarra!=''){
            if(this.listagregarcodigos.indexOf(codigobarra) == -1){ 
                this.loading=true;
                for (let index = this.listcodigosbarra.length; index > 0; index--) {
                    codigobarra = codigobarra + (codigobarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
                }console.log("codigos:", codigobarra);
                this._documentoReseteoService.consultarCodigoBarras({
                        codigo_barra: codigobarra,
                        tipo: this.frmbusqueda.controls['tipo'].value
                    },
                    data=>{
                        this.loading = false;
                        if(data.length > 0){
                            console.log("this.listagregar:",this.listagregar);
                            //this.listagregarcodigos.splice(0,0,data[0].codigo_barra);
                            for(var i=0; i<data.length;i++){
                                this.listagregarcodigos.splice(0,0,data[i].codigo_barra);
                                this.listagregar.splice(i,0, data[i]);
                            }
                                                    
                            this.count =  this.listagregar.length;
                            if((this.frmbusqueda.controls['tipo'].value != '') && (this.listagregar.length > 0)) { 
                                this.frmbusqueda.controls['tipo'].disable(); 
                            }
                            this.frmbusqueda.controls['toatldocumentoscampo'].setValue(this.count);
                            this.frmbusqueda.controls['toatldocumentos'].setValue(this.count);
                            console.log("this.listagregar:",this.listagregar);
                            this.rows = this.listagregar; this.rows = [...this.listagregar]; 
                            this.showMessage('success', 'Se agregó el código: '+codigobarra+', correctamente', '');
                        } else {
                            this.showMessage('error', 'No se encontro el documento', '');
                        }
                    },
                    error=>{
                        document.getElementById('lblManualTotal').innerHTML='';
                        this.formLoading = false;
                        this.loading = false;         
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        /*if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;*/
                    }
                );
            }
            else { this.showMessage('warning', 'El código: '+codigobarra+', ya ha sido agregado a la lista', ''); }
        }
    }
    hiddenppResetearDocumentos(){}
    btnResetearDocumentos_click(){
        this.loading = true;
        this.ppResetearDocumentos.hide();
        //Registro la cabecera
        this._documentoReseteoService.registrarCabecera({
            dre_id: 0,
            tir_id: this.frmbusqueda.controls['tipo'].value,
            dre_motivo: this.frmbusqueda.controls['motivo'].value
            },
            data=>{
                this.loading = false;
                if(data[0].error == false){
                    //this.showMessage('success', 'Se registro el reseto de documentos correctamente', '');
                    //Registro el detalle
                    this.loading = true;
                    console.log("lista=",this.listagregarcodigos);
                    for (let index = 0; index < this.listagregarcodigos.length; index++) {
                        this._documentoReseteoService.registrarDetalle({
                                dre_id: data[0].id,
                                codigo_barra: this.listagregarcodigos[index]
                            },
                            detalle=>{
                                this.loading = false;
                                if(detalle){
                                    if(detalle.length > 0){
                                        this.showMessage('error', detalle[0].observacion, '');
                                        this.frmbusqueda.controls['tipo'].enable();
                                    }
                                    else{
                                        this.showMessage('success', 'Se registro el reseto de documentos correctamente', '');
                                        this.router.navigate(['/distribucion/reseteolista']);
                                    }
                                }
                            },
                            error=>{                
                                if(error.status===401){
                                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                                }else{                  
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                }
                                this.loading=false;
                            }
                        );                    
                    }
                } else {
                    this.frmbusqueda.controls['tipo'].enable();
                    this.mostrar_error_alerta('No se registro el reseto de documentos correctamente');
                }
            },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
            }
        );
    }
    hiddenppAgregarDocumentos(){}
    tipo_change(event){
        if(this.listagregarcodigos.length > 0){
            this.frmbusqueda.controls['tipo'].disable();
        }
    }
    quitarDocumento(row){
        console.dir(row);
        console.log('row.codigo_barra:',row.codigo_barra);
        for (let index = 0; index < this.listagregarcodigos.length; index++) {
            if(this.listagregarcodigos[index] == row.codigo_barra){
                this.listagregarcodigos.splice(index,1);
                this.listagregar.splice(index,1);
            }
        } 
        if(this.listagregar.length > 0){ this.frmbusqueda.controls['tipo'].enable(); }
        this.loading = true;
        this.rows = this.listagregar; this.rows = [...this.listagregar]; 
        this.loading = false;
    }
    btnSalir_click(event){ this.router.navigate(['/distribucion/reseteolista']); }
    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }
    }
    codigoBarra_keypress(sender:HTMLInputElement, event){
    
        if (event.which == 13) {
            if(this.listcodigosbarra.indexOf(sender.value) == -1){
                //this.listcodigosbarra.splice(0,0,sender.value); 
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
                this.formLoading = false;
                this.loading = false;
            }
            else { this.showMessage('warning', 'El código: '+sender.value+', ya ha sido agregado a la lista', ''); }
            sender.value='';
            sender.focus();
        }
    }
    eliminarCodigoLista(index){
        this.listcodigosbarra.splice(index,1);
        document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length;
    }
    /*alerta*/
    hiddenalertDocumentos(){ }
    Aceptar_alertDocumentos(){ 
        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        alertaSonidoControl.loop = false; alertaSonidoControl.pause(); 
        this.alertDocumentos.hide(); 
    }
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje; }
}