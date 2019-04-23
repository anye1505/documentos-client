import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NoClasificadoService } from '../../../services/no-clasificado.service';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
    selector: 'noclasificadoeditar',
    templateUrl: './noclasificadoeditar.component.html'
})
export class NoClasificadoEditarComponent implements OnInit {
    public loading:boolean = false;
    public loading2:boolean = false;
    public formLoading:boolean = false;
    public asignado:boolean = false;
    msgagregardocumento: string = ''; 
    frmbusqueda: FormGroup;
    frmAgregar: FormGroup;
    frmCodigo: FormGroup;
    navigator: any = navigator;
    listagregarcodigos:any = [];
    listagregarcodigos2:any = [];
    listdistritos:any = [];
    codigosbarra: string = ''; 
    cla_id: number; 
    ind=0;
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
    @ViewChild('modalAsignar') modalAsignar: ModalDirective;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;
    constructor(
        fb: FormBuilder,
        private _noClasificadoService: NoClasificadoService,
        private _empresaService: EmpresaService,
        private toasterService: ToasterService,
        private router: Router
    ){
        this.frmbusqueda = fb.group({
            'motivo': ['',Validators.compose([Validators.required])]
        });
        this.frmCodigo = fb.group({
            'codigobarra': ['',Validators.compose([Validators.required])]
        });
        this.frmAgregar = fb.group({
            'distrito': ['',Validators.compose([Validators.required])]
        });
        this._empresaService.distrito(
            {mod:'noclass'},
            data=>{
                this.listdistritos=data;
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
    ngOnInit(){
        
    }
    //eventos formulario
    codigoBarra_keyup(sender:HTMLInputElement, event, alertaSonido:HTMLAudioElement){
        if(sender.value == '') { this.msgagregardocumento = ''; }
        
        /*if (event.which == 13 && sender.value != '') {
            for (let c in this.frmCodigo.controls) {
                this.frmCodigo.controls[c].markAsTouched();
            }
            if (this.frmCodigo.valid) {
                if(this.listagregarcodigos.indexOf(sender.value) == -1){
                    if(sender.value.split(" ").length == 1){
                        this.listagregarcodigos.splice(0,0,sender.value); 
                    }else {
                        if(this.listagregarcodigos.length == 0){
                            this.listagregarcodigos = sender.value.split(" ");
                        }else{
                            for(let i=0;i<sender.value.split(" ").length;i++){
                                this.listagregarcodigos.push(sender.value.split(" ")[i]);
                            }
                            
                        }
                    }
                    //this.listagregarcodigos.splice(0,0,sender.value); 
                    //document.getElementById('lblManualTotal').innerHTML="Total: " + this.listagregarcodigos.length; 
                }
                else { this.showMessage('error', 'El código: '+sender.value+', ya ha sido agregado a la lista', ''); }
                sender.value='';
                sender.focus();
            }
        }*/
        if (event.which == 13 && sender.value != '') {
            this.msgagregardocumento = '';
            for (let c in this.frmCodigo.controls) {
                this.frmCodigo.controls[c].markAsTouched();
            }
            if (this.frmCodigo.valid) {
                let value = sender.value;
                sender.value = '';
                //this.formLoading = true;
                this.loading2 = true;
                let lbExiste: boolean = false;
                /*for (let index = 0; index < this.listagregarcodigos.length; index++) {
                    if(this.listagregarcodigos[index].codigo_barra==value){
                        lbExiste = true;
                    }
                }*/
                for(let i=0;i<value.split(" ").length;i++){
                    if(this.listagregarcodigos2.indexOf(value.split(" ")[i]) != -1){
                        lbExiste = true;
                    }
                }
                if(!lbExiste){
                    lbExiste = false;
                    //this.listagregarcodigos2 = [];
                    //listagregarcodigos2.splice(0,0,{'codigo_barra':value, 'destino': '', 'direccion': ''});

                    //if(this.listagregarcodigos2.indexOf(value) == -1){
                        if(value.split(" ").length == 1){
                            this.listagregarcodigos2.push(value);
                        }else {
                            if(this.listagregarcodigos2.length == 0){
                                this.listagregarcodigos2 = value.split(" ");
                            }else{
                                for(let i=0;i<value.split(" ").length;i++){
                                    this.listagregarcodigos2.push(value.split(" ")[i]);
                                }
                                
                            }
                        } 
                    //}
                    console.log("cons1",this.listagregarcodigos2);
                    this.ind =  this.listagregarcodigos.length;
                    for(let i = this.ind; i < this.listagregarcodigos2.length; i++){  
                        console.log("1=",this.listagregarcodigos2[i])                  
                        this._noClasificadoService.consultarCodigoBarra({
                            'cod_barra': this.listagregarcodigos2[i]//value
                        }, data=>{
                            //this.formLoading = false;
                            this.loading2 = false;
                            if(data[0]){console.log(this.listagregarcodigos2, data[0]['codigo_barra']);
                                if(this.listagregarcodigos2.indexOf(data[0]['codigo_barra']) != -1 ){ 
                                    this.listagregarcodigos.push({'codigo_barra':data[0]['codigo_barra'], 'destino':data[0]['destino'], 'direccion':data[0]['direccion'], 'doc_id':data[0]['doc_id']});
                                }
                                if(data[0]['codigo_barra'] == 'error'){
                                    this.listagregarcodigos2.splice(this.listagregarcodigos2.indexOf(data[0]['codigo_barra']),1);
                                    this.showMessage('warning', data[0]['direccion'], '');
                                }
                            }
                        }, error=>{   
                            sender.value = '';    
                            //this.formLoading = false;
                            this.loading2 = false;         
                            if(error.status===401){
                                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                            }else{                  
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            }
                        });
                    }                      
                } else {
                    this.showMessage('warning', 'El código de barras ya fue agregado', '');
                    //this.formLoading = false;
                    this.loading2 = false;
                    sender.value = '';
                    sender.focus();
                }                
            } else { return false; }
        }
    }

    eliminarCodigoLista(index){
        this.listagregarcodigos2.splice(this.listagregarcodigos2.indexOf(this.listagregarcodigos[index].codigo_barra),1);
        this.listagregarcodigos.splice(index,1);
        
    }
    
    frmAgregar_submit(alertaSonido:HTMLAudioElement){
        this.formLoading = true;
        this.loading = true;
        this.codigosbarra = '';
        for (let c in this.frmAgregar.controls) {
            this.frmAgregar.controls[c].markAsTouched();
        }
        if (this.frmAgregar.valid) {
            for(let i = 0; i < this.listagregarcodigos.length; i++)
            {
                if(i == this.listagregarcodigos.length-1){
                    this.codigosbarra = this.codigosbarra + this.listagregarcodigos[i].codigo_barra;
                }
                else{
                    this.codigosbarra = this.codigosbarra + this.listagregarcodigos[i].codigo_barra + ',';
                }
            };
            this._noClasificadoService.grabarCabecera({
                'cla_id': 0,
                'cod_barra': '',
                'cla_motivo': this.frmbusqueda.controls['motivo'].value == null || this.frmbusqueda.controls['motivo'].value == '' ? '  ' : this.frmbusqueda.controls['motivo'].value,
                },data=>{
                    this.cla_id = data[0].id;
                    this._noClasificadoService.grabarDetalle({
                        'cla_id': this.cla_id,
                        'cod_barra': this.codigosbarra,
                        'distrito': this.frmAgregar.controls['distrito'].value
                        },data=>{
                            for(let i=0; i<data.length; i++){
                                if(data[i]['observacion'] != '' || data[i]['observacion'] != null){
                                    if(this.listagregarcodigos.indexOf(data[i]['codigo_barra']) == -1){ 
                                        this.listagregarcodigos.splice(0,0,data[i]['codigo_barra']); 
                                    }
                                    if(i<data.length-1){
                                        this.msgagregardocumento = this.msgagregardocumento + data[i]['codigo_barra'] + ', ';
                                    }else{
                                        this.msgagregardocumento = this.msgagregardocumento + data[i]['codigo_barra'];
                                    }
                                }
                            }
                            if(this.msgagregardocumento != ''){
                                this.msgagregardocumento = this.msgagregardocumento + ', ' + data[0]['observacion'];
                                alertaSonido.play(); alertaSonido.loop = true;
                                this.mostrar_error_alerta(this.msgagregardocumento);
                                this.modalAsignar.hide();
                                this.msgagregardocumento = '';
                            }
                            this.listagregarcodigos = [];
                            this._noClasificadoService.consultaDetalle({
                                'cla_id': this.cla_id
                            }, data=>{
                                this.modalAsignar.hide();
                                this.rows = data;
                                this.rows = [...this.rows];
                                this.formLoading = false;
                                this.loading = false;
                                this.count = data.length;
                                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                            });
                            
                        }, error=>{        
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }                        
                    });
                }, error=>{        
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }                
            });                   
        }else{
            this.formLoading = false;
            this.loading = false;
            this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
        }
    }
    submitAsignar(alertaSonido:HTMLAudioElement) {
        this.formLoading = true;
        this.loading = true;
        for (let c in this.frmbusqueda.controls) {
            this.frmbusqueda.controls[c].markAsTouched();
        }
        if (this.frmbusqueda.valid == false) {  
            this.formLoading = false;
            this.loading = false;
            this.showMessage('error', 'Debe completar la información necesaria', '');
        }
        else {
            this._noClasificadoService.grabarCabecera({
                'cla_id': this.cla_id,
                'cod_barra': this.codigosbarra,
                'cla_motivo': this.frmbusqueda.controls['motivo'].value,
                },data=>{
                    this.formLoading = false;
                    this.loading = false;
                    this.asignado = true;
                    this.frmbusqueda.controls['motivo'].enable();
                    this.showMessage('success', data[0].mensaje, '');
                }, error=>{        
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            });
        }
    }
    btnAgregar_click(sender){
        this.ppAgregarDocumentos.show();
    }
    btnNuevo_click(sender){
        if (this.frmAgregar.valid == false) {  
            this.formLoading = false;
            this.showMessage('error', 'Debe completar la información necesaria', '');
        }else{
            this.modalAsignar.show();
        }
    }
    btnCerrar_click(sender){
        this.router.navigate(['/distribucion/noclasificadolista']);
    }
    hiddenAsignar(){}
    Distrito_change($event){
        if(this.listagregarcodigos.length == 0){
            this.formLoading = false;
            this.loading = false;
            this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
        }
    }

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }
    }

    btnLimpiarCodigoBarras_click(sender, control:HTMLInputElement){
        this.msgagregardocumento='';
    }
    /*alerta*/
    hiddenalertDocumentos(){ }
    Aceptar_alertDocumentos(){ 
        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        alertaSonidoControl.loop = false; alertaSonidoControl.pause(); 
        this.alertDocumentos.hide(); 
        this.formLoading = false;
    }
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje;this.formLoading = false;this.loading = false; }

    /*grilla*/
    onPage(event){  }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {  }
}