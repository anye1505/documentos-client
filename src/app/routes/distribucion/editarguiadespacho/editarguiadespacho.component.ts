import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';
import { FileUploader } from 'ng2-file-upload';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { GuiaService } from '../../../services/guia.service';
import { GuiaDespachoService } from '../../../services/guia-despacho.service';
import { SucursalService } from '../../../services/sucursal.service';
import { DownloadService } from '../../../services/download.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forEach } from '@angular/router/src/utils/collection';
import { eventNames } from 'cluster';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { AgenteService } from '../../../services/agente.service';

@Component({
    selector: 'editar-guia-despacho',
    templateUrl: './editarguiadespacho.component.html'
})
export class EditarGuiaDespachoComponent implements OnInit {
    private sesion: any;
    private sesionAdicional: any;
    private frmmodo: string;
    public loading:boolean = false;
    public loading2:boolean = false;
	public formLoading:boolean = false;
    public processRest;
    public panelBusqSeleccionado: number = 0;
    frmEditar: FormGroup;
    frmDespachar: FormGroup;
    //frmEntrega: FormGroup;
    frmAgregarRemover: FormGroup;
    listestados:any = [];
    //listdistritos:any = [];
    listsucursales:any = [];
    listsucursales2:any = [];
    //listcuadrantes:any = [];
    listtransportistas:any = [];
    idguiadespacho: number = 0;
    idestadoguia: number = 1;
    EsAgregarDocumento: boolean = false;
    buscarCodigBarraOnline: boolean = false;
    eliminardocdescripcion:string='';
    eliminardocid:number=0;
    listcodigosbarra:any=[];
    listAutomaticocodigosbarra:any=[];
    msgagregardocumento: string = ''; 
    msgagregardocumentoestado: string = '';
    lbltituloprocesados:string='';
    mostrarsuc: boolean = false;
    despachado: boolean = false;
    flag:boolean=false;
    editar: boolean = true;
    control:any;
    countPendientes:number = 0;
    countErrores:number = 0;
    countCorrectos:number = 0;
    sender:any=null;
    nuevo:boolean = false;
    consultafiltro=[];
    deleteloading:boolean=false;

    /*Grilla 1*/
    columns=[];
    rows=[];
    limit=10;
    limit2=0;
    count=0;
    order:string;
    selected = [];
    rows2=[];

    /*Grilla 2*/
    rows_rango=[...[]];
    count_rango=0;
    
	/*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    public empresas:any[];

    public formOperador;
    public uploader: FileUploader = new FileUploader({ 
        queueLimit: 1,
        url: GLOBAL.url+"guiasDespacho/asignarDocumentosFile" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });

    @ViewChild('ppEntregaMensajero') ppEntregaMensajero: ModalDirective;
    @ViewChild('ppAgregarRemover') ppAgregarRemover: ModalDirective; 
    @ViewChild('modalQuitarDocumento') modalQuitarDocumento: ModalDirective;
    @ViewChild('modalRemoverDocumentos') modalRemoverDocumentos: ModalDirective;
    @ViewChild('modalEliminarGuia') modalEliminarGuia: ModalDirective;
    @ViewChild('modalResetearGuia') modalResetearGuia: ModalDirective;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;
    @ViewChild('modalCerrar') modalCerrar: ModalDirective;    
    @ViewChild(DatatableComponent) table: DatatableComponent;
    constructor(
        fb: FormBuilder,
        private router: Router,
        private activateRoute: ActivatedRoute,
        private _authService: AuthService,
        private _guiaDespachoService: GuiaDespachoService,
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _sucursalService: SucursalService,
        private _userService: UserService,
        public _agenteService:AgenteService
    ){
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.frmEditar = fb.group({
            'Sucursal': ['',Validators.compose([Validators.required])],
            'Transportista': ['',Validators.compose([Validators.required])],
            'NroGuia': ['',Validators.compose([])],
            'Despachador': ['',Validators.compose([])],
            'FechaGuia': ['',Validators.compose([])],
            'FechaDespacho': ['', Validators.compose([])],
            'GuiaTrans': ['',Validators.compose([])],
            'FechaRecepcion': ['', Validators.compose([])],
            'Estado': ['', Validators.compose([])],
            'Recepcionados': ['', Validators.compose([])],
            'Pendiente': ['', Validators.compose([])],
            'TotalDocumentos': ['', Validators.compose([])]
        });
        /*this.frmEntrega = fb.group({
            'editPasaje': ['',Validators.compose([Validators.required])]
        });*/
        this.frmDespachar = fb.group({
            'Transport': ['',Validators.compose([Validators.required])],
            'GuiaTransp': ['',Validators.compose([])],
            'FechaDespacho': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])]
        });
        this.frmAgregarRemover = fb.group({
            //'cuadrante': ['',Validators.compose([Validators.required])],
            //'cuadranteDesc': [{ value:'', disabled: true},Validators.compose([])],
            //'cuadrante2': ['',Validators.compose([Validators.required])],
            //'cuadranteDesc2': [{ value:'', disabled: true},Validators.compose([])],
            'Opcion': [''],
            'archivo': [{ value:'', disabled: true},Validators.compose([])],
            'rangoDesde': [{ value:'', disabled: true},Validators.compose([])],
            'rangoHasta': [{ value:'', disabled: true},Validators.compose([])],
            'codigoBarra': [{ value:'', disabled: true},Validators.compose([])],
            'codigoBarraAutomatico': ['',Validators.compose([])]
        });
        this._userService.find({ id : this.sesion.userId },
            data=>{ 
                this.sesionAdicional = data;
                this._sucursalService.sucursales(
                    { 'suc_id':data['suc_id'] },
                    data=>{ this.listsucursales = data;},
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                this._agenteService.agentes({},//this._sucursalService.sucursalseleccionada(
                    //{ 'suc_id':data['suc_id'] },
                    data=>{ this.listsucursales2 = data; console.log("sucs:",data)},
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                /*this._sucursalService.distritos(
                { 'suc_id':data['suc_id'] },
                data=>{ this.listdistritos = data;},
                error=>{                
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading=false;
                });*/
                this._sucursalService.transportista(
                    { 'suc_id':data['suc_id'] },
                    data=>{ this.listtransportistas = data;},
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                
            },
            error=>{  console.log("Error")              
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );
        if(this.activateRoute.snapshot.params['idguiadespacho']){
            this.idguiadespacho = this.activateRoute.snapshot.params['idguiadespacho'];
            this.recuperarDatos(this.idguiadespacho)//this.recuperarDatos(+this.activateRoute.snapshot.params['idguiadespacho']);
        } else {
            this.idguiadespacho = 0;
            this.idestadoguia = 1;
        }
    }   
    ngOnInit(){
    }
    Distrito_change(e){
        /*this._sucursalService.cuadrantes(
            { 'sam_id': this.frmEditar.controls['Sucursal'].value },
            cuadrantes=>{ this.listcuadrantes = cuadrantes; },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
        });*/
    }
    recuperarDatos(pidguia:number, pblistadetalle:boolean=true){
        this.idguiadespacho = pidguia;
        // Esto es para el filtro de codigo de barra
        
        this._guiaDespachoService.buscar({ gud_id : this.idguiadespacho }, 
        data=>{ console.log("suc_value:",data);
            this.idestadoguia = data[0]['gde_id'];
            this.frmEditar.controls['Sucursal'].setValue(data[0]['suc_destino_id']);
            if(this.idestadoguia == 1 && this.idguiadespacho == 0){ this.frmEditar.controls['Sucursal'].enable(); }
            else { this.frmEditar.controls['Sucursal'].disable();  }console.log("Sucursal:",this.frmEditar.controls['Sucursal'].value);
            this.frmEditar.controls['Transportista'].setValue(data[0]['tra_id']);
            this.frmDespachar.controls['Transport'].setValue(data[0]['tra_id']);
            if(this.idestadoguia == 1){ this.frmEditar.controls['Transportista'].enable(); }
            else { this.frmEditar.controls['Transportista'].disable(); }
            this.frmEditar.controls['NroGuia'].setValue(data[0]['gud_numero']);
            document.getElementById('lbltitguia').innerHTML=data[0]['gud_numero'];
            this.frmEditar.controls['Despachador'].setValue(data[0]['despachador']);
            this.frmEditar.controls['FechaGuia'].setValue(data[0]['fecha_creacion']);
            this.frmEditar.controls['FechaDespacho'].setValue(data[0]['fecha_despacho']);
            this.frmEditar.controls['GuiaTrans'].setValue(data[0]['gud_guia_transportista']);
            if(this.despachado || (this.frmEditar.controls['GuiaTrans'].value != '' && this.frmEditar.controls['GuiaTrans'].value != null)){
                this.frmEditar.controls['GuiaTrans'].disable();
                this.despachado=true;
            }
            else{this.frmEditar.controls['GuiaTrans'].enable();}
            this.frmEditar.controls['FechaRecepcion'].setValue(data[0]['fecha_recepcion']);
            this.frmEditar.controls['Estado'].setValue(data[0]['gde_descripcion']);
            this.frmEditar.controls['Recepcionados'].setValue(data[0]['gud_nro_docs_recibido']);
            this.frmEditar.controls['Pendiente'].setValue(data[0]['gud_nro_docs_pendiente']);
            this.frmEditar.controls['TotalDocumentos'].setValue(data[0]['gud_nro_docs']);
        }, error=>{                
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
            this.loading=false;
            this.loading2=false;
        });
        if(pblistadetalle){ this.recuperar_detalle(0); }
    }
    recuperar_detalle0(page:number){//el viejo
        this.loading=true;
        this.formLoading=true;
        this.count = 0;
        this.rows = [...[]];
        this._guiaDespachoService.consultaDetalle({ gud_id : this.idguiadespacho, desde_fila: (page * this.limit), limite_filas: this.limit  }, 
            data=>{
                this.loading=false;
                this.formLoading=false;
                if(data !== undefined && data.length > 0) { 
                    this.rows = data; console.log("data:",data);
                    this.rows = [...this.rows];
                    this.count = data[0]['nro_docs']; 
                    this.frmEditar.controls['TotalDocumentos'].setValue(data[0]['nro_docs']); 
                } else { 
                    this.frmEditar.controls['TotalDocumentos'].setValue(0); 
                }
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
                this.formLoading=false;
        });
        // Esto es para el filtro de codigo de barra
        /*this._guiaDespachoService.consultaFiltro({ gui_id : this.idguiadespacho},
            data=>{
                if(data !== undefined && data.length > 0) {
                    this.consultafiltro = data;
                    this.consultafiltro = [...this.consultafiltro];
                }
            });*/
    }
    recuperar_detalle(page:number){
        this.loading=true;
        this.formLoading=true;
        this.count = 0;
        this.rows = [...[]];
        this._guiaDespachoService.consultaFiltro({ gui_id : this.idguiadespacho},
            data=>{
                this.loading=false;
                this.formLoading=false;
                if(data !== undefined && data.length > 0) {
                    this.limit2 = this.limit2+10;
                    this.consultafiltro = data;
                    this.consultafiltro = [...this.consultafiltro];
                    this.count = data[0]['nro_docs'];
                    this.frmEditar.controls['TotalDocumentos'].setValue(data[0]['nro_docs']);
                    this.rows = this.consultafiltro.slice(page * this.limit, this.limit2);
                    this.rows = [...this.rows];
                }else{
                    this.frmEditar.controls['TotalDocumentos'].setValue(0);
                }
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
                this.formLoading=false;
            }
        );
    }
    recuperar_detalle2(page:number){
        this.loading=true;
        this.formLoading=true;
        this.rows = [...[]];
        this.limit2 = this.limit2+10;
        this.loading=false;
        this.formLoading=false;
        this.rows = this.consultafiltro.slice(page * this.limit, this.limit2);
        this.rows = [...this.rows];
        
    }
    /*eventos formularios*/
    registrar_guia(bGuardarDocumentos: boolean = false, alertaSonidoControl:HTMLAudioElement = null, inputSender:any = null, pscodigoBarra:string=null){
        let values = this.frmEditar.value;
        this.loading=true;
        this.loading2=true;
        this.formLoading = true;
        for (let c in this.frmEditar.controls) {
            this.frmEditar.controls[c].markAsTouched();
        }
        if (this.frmEditar.valid) { 
            if(typeof this.frmEditar.controls['GuiaTrans'].value === 'number'){
                let gui_trans=0;
                gui_trans = this.frmEditar.controls['GuiaTrans'].value;
                let trans = gui_trans.toString();
                this.frmEditar.controls['GuiaTrans'].setValue(trans);
            } 
            if(this.frmEditar.controls['GuiaTrans'].value == null){
                this.frmEditar.controls['GuiaTrans'].setValue('');
            }
            this._guiaDespachoService.guardar({ 
                'gud_id': this.idguiadespacho, 
                'suc_id': this.frmEditar.controls['Sucursal'].value, 
                'tra_id': this.frmEditar.controls['Transportista'].value,
                'gui_trans': this.frmEditar.controls['GuiaTrans'].value
            }, data=>{
                this.loading=false;
                this.loading2=false;
                this.formLoading = false;
                if(data['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    //this.showMessage('success', data[0]['mensaje'], '');
                    if(bGuardarDocumentos){
                        this.recuperarDatos(data[0]['id'],false); 
                        this.idguiadespacho = data[0]['id'];
                        console.log("guia creada2  ="+data[0]['id']);
                        this.registrar_documentos(inputSender, alertaSonidoControl, pscodigoBarra);
                    } else { 
                        if(this.idguiadespacho > 0){ /*Edición*/this.btnCerrar_click(''); } 
                        else { /*Nuevo*/this.recuperarDatos(data[0]['id']); }
                    }
                }            
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
                this.formLoading = false;
            });
        }else{
    		this.formLoading = false;
        }
    }
    /*registrar_guiaAuto(bGuardarDocumentos: boolean = false, alertaSonidoControl:HTMLAudioElement = null, inputSender:any = null, pscodigoBarra:string=null){
        let values = this.frmEditar.value;
        for (let c in this.frmEditar.controls) {
            this.frmEditar.controls[c].markAsTouched();
        }console.log(this.idguiadespacho);
        if (this.frmEditar.valid && this.idguiadespacho == 0) {  
            this._guiaDespachoService.guardar({ 
                'gud_id': this.idguiadespacho, 
                'suc_id': this.frmEditar.controls['Sucursal'].value, 
                'tra_id': this.frmEditar.controls['Transportista'].value,
                'gui_trans': this.frmEditar.controls['GuiaTrans'].value
            }, data=>{
                this.flag =true;
                console.log("this.idguiadespacho = "+this.idguiadespacho);
                this.loading=false;
                this.formLoading = false;
                if(data['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    //this.showMessage('success', data[0]['mensaje'], '');
                    if(bGuardarDocumentos){
                        this.recuperarDatos(data[0]['id'],false); 
                        this.idguiadespacho = data[0]['id'];
                        console.log("guia creada ="+data[0]['id']);
                        //this.registrar_documentos(inputSender, alertaSonidoControl, pscodigoBarra);
                    } else { 
                        if(this.idguiadespacho > 0){ this.btnCerrar_click(''); } 
                        else { this.recuperarDatos(data[0]['id']); }
                    }
                }            
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.idguiadespacho = 0;
                this.loading=false;
                this.formLoading = false;
            });
        }else{
    		this.formLoading = false;
        }
    }*/
    /*frmEditar_submit(ev) {
        ev.preventDefault();
        this.registrar_guia(false, null);
    }*/
    registrar_documentos(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null, pscodigoBarra:string=null){
        let values = this.frmAgregarRemover.value;
            //sesionAdicional
        this.count_rango = 0;
        this.rows_rango = [];
        //this.formLoading = true;
        //this.loading = true;
        if(typeof this.idguiadespacho == 'string'){
            let gui_string='';                    
            gui_string = this.idguiadespacho;
            let gui_id = parseInt(gui_string,10);
            this.idguiadespacho = gui_id;
            //console.log("gui=",typeof this.idguiadespacho);
        }
        if(!this.buscarCodigBarraOnline){
            this.formLoading = true;
            this.loading = true;}
        if(this.buscarCodigBarraOnline){
            this.loading2 = true;
            //let codigosBarra:string = '';
            // for (let index = this.listcodigosbarra.length; index > 0; index--) {
            //     codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
            // }      
            this.listcodigosbarra = [];
            if(pscodigoBarra != ''){               
                
                this._guiaDespachoService.asignarDocumentosVarios({ 
                    'gud_id':this.idguiadespacho,
                    'suc_id': this.frmEditar.controls['Sucursal'].value,
                    'agregar': true,
                    'cod_barra': pscodigoBarra
                }, data=>{ 
                    this.formLoading = false;
                    this.loading = false;
                    this.loading2 = false;
                    //this.msgagregardocumento = data[0]['mensaje'];
                    //if(data[0]['error'] == true){
                    if(data.length > 0){
                        alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                        this.mostrar_error_alerta(data[0]['mensaje']);
                        this.frmAgregarRemover.controls['codigoBarraAutomatico'].disable();
                    } else {
                        this.showMessage('success', 'Documentos grabados', '');
                        inputSender.value='';
                        inputSender.focus();
                    }
                    let array = pscodigoBarra.split(",");console.log("array: ",array, this.listAutomaticocodigosbarra); 
                    for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                        for(let i = 0; i < array.length; i++){
                            if(this.listAutomaticocodigosbarra[index].codigo_barra==array[i]){ 
                                this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':array[i], 'estado':'Correcto', 'mensaje':'Documento agregado'});
                                this.actualiza_cantidades_automatico();
                            }
                        }
                    }                
                }, error=>{       
                    this.formLoading = false;
                    this.loading = false;
                    this.loading2 = false;
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                });
            }else{
                this.formLoading = false;
                this.loading = false;  
                this.loading2 = false; 
                this.showMessage('error', 'No hay documentos por asignar', '');
            }
        } else if(values['Opcion']=='1' && (this.buscarCodigBarraOnline==false)){    
            this.uploader.queue.forEach(element => {
                element.upload();
                this.loading = true;
                this.formLoading = true;
                this.lbltituloprocesados='N° No Asignados';
            });
        } else if(values['Opcion']=='2' && (this.buscarCodigBarraOnline==false)){                
            this._guiaDespachoService.asignarRango({ 
                'gud_id': this.idguiadespacho,
                'suc_id': this.frmEditar.controls['Sucursal'].value,
                'agregar': true,
                'cod_barra_inicial': values['rangoDesde'],
                'cod_barra_final': values['rangoHasta'],
                'usu_id': this.sesion.userId 
            }, data=>{ 
                this.formLoading = false;
                this.loading = false;
                this.frmAgregarRemover.controls['rangoDesde'].setValue('');
                this.frmAgregarRemover.controls['rangoHasta'].setValue('');
                if(data.length > 0){
                    this.lbltituloprocesados='N° No Asignados';
                    this.rows_rango = data;
                    this.count_rango = data.length; 
                    alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                    this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron asignarse, revise la lista.');                 
                } 
                //this.recuperar_detalle(0);                
            }, error=>{  
                this.lbltituloprocesados=''; 
                this.formLoading = false;
                this.loading = false;             
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            });
        } else if(values['Opcion']=='3' && (this.buscarCodigBarraOnline==false)){
            let codigosBarra:string = '';
            codigosBarra = this.listcodigosbarra.join();
            /*for (let index = this.listcodigosbarra.length; index > 0; index--) {
                codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
            } */  

            this.listcodigosbarra = [];console.log("suc: ",this.frmEditar.controls['Sucursal'].value);
            this._guiaDespachoService.asignarDocumentosVarios({ 
                'gud_id': this.idguiadespacho,
                'suc_id': this.frmEditar.controls['Sucursal'].value,
                'agregar': true,
                'cod_barra': codigosBarra 
            }, data=>{ 
                this.formLoading = false;
                this.loading = false;
                this.loading2 = false;
                document.getElementById('lblManualTotal').innerHTML='';
                if(data.length > 0){
                    this.rows_rango = data;
                    this.count_rango = data.length;
                    alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                    this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron asignarse, revise la lista.');
                    this.lbltituloprocesados='N° No Asignados';
                } else {
                    this.lbltituloprocesados='';
                    //this.recuperar_detalle(0);
                    this.showMessage('success', 'Se ha cargado la información', '');
                    //this.showMessage('success', data[0]['mensaje'], '');'Se ha cargado la información', ''
                }   
                                
            }, error=>{    
                document.getElementById('lblManualTotal').innerHTML='';   
                this.lbltituloprocesados='';
                this.formLoading = false;
                this.loading = false;
                this.loading2 = false;       
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            });
        }
    }
    hiddenAgregarRemover(){ /*this.recuperar_detalle(0);*/ }
    frmAgregarRemover_Agregar(sender, alertaSonido:HTMLAudioElement) {
        this.formLoading = true;
        this.loading = true;
        this.EsAgregarDocumento = true;
        /*Verifico si se genero id guia*/
        let values = this.frmAgregarRemover.value;
        for (let c in this.frmAgregarRemover.controls) {
            this.frmAgregarRemover.controls[c].markAsTouched();
        }
        if (this.frmAgregarRemover.valid) {  
            //sesionAdicional
            this.count_rango = 0;
            this.rows_rango = [];
            if((values['Opcion']=='3' || this.buscarCodigBarraOnline==true) && (this.listcodigosbarra.length==0)){ 
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
            } else if(values['Opcion']=='1' && this.buscarCodigBarraOnline==false && this.uploader.queue.length == 0){
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el archivo a procesar', '');
            } else if(values['Opcion']=='2' && (this.frmAgregarRemover.controls['rangoDesde'].value=='' || this.frmAgregarRemover.controls['rangoHasta'].value=='')){
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el valor inicial y final', '');
            }
            else { 
                if(this.idguiadespacho == 0) { 
                    this.registrar_guia(true, alertaSonido); 
                } else { 
                    this.registrar_documentos(null, alertaSonido); 
                }
            }            
        }else{
            this.formLoading = false;
            this.loading = false;
        }
    }
    frmAgregarRemover_Remover(sender, values: any, alertaSonido:HTMLAudioElement) {
        //ev.preventDefault();
        for (let c in this.frmAgregarRemover.controls) {
            this.frmAgregarRemover.controls[c].markAsTouched();
        }
        if (this.frmAgregarRemover.valid) {  
            this.count_rango = 0;
            this.rows_rango = [];
            //sesionAdicional
            if(values['Opcion']=='3' && this.listcodigosbarra.length==0){ 
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
            } else if(values['Opcion']=='1' && this.uploader.queue.length==0){ 
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el archivo a procesar', '');
            } else if(values['Opcion']=='2' && (this.frmAgregarRemover.controls['rangoDesde'].value=='' || this.frmAgregarRemover.controls['rangoHasta'].value=='')){ 
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el valor inicial y final', '');
            }
            else { this.modalRemoverDocumentos.show(); }         
        }else{
            this.formLoading = false;
            this.loading = false; 
        }    
    }
    frmAgregarAuto(sender, alertaSonido:HTMLAudioElement) {
        //console.log("lista1: ",this.listAutomaticocodigosbarra,this.listAutomaticocodigosbarra[0].codigo_barra,this.listAutomaticocodigosbarra[0].mensaje);
        this.modalCerrar.hide();console.log("aqui");
        if(this.listAutomaticocodigosbarra.length==0){ 
            alertaSonido.play();
            this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
        }else{
            let codigosBarra = '';console.log(this.listAutomaticocodigosbarra);
            //for(let i=0; i<this.listAutomaticocodigosbarra.length; i++){
            for (let i = this.listAutomaticocodigosbarra.length; i > 0; i--) {
                console.log(this.listAutomaticocodigosbarra[i-1]);
                if(this.listAutomaticocodigosbarra[i-1].estado == "Procesando"){
                    if(this.listAutomaticocodigosbarra[i-1].codigo_barra != ''){
                        codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listAutomaticocodigosbarra[i-1].codigo_barra;
                    }
                    //this.registrar_documentos(this.sender,null,this.listAutomaticocodigosbarra[i].codigo_barra);
                } 
            }
            console.log("cod: ",codigosBarra);
            if(this.idguiadespacho == 0) { 
                this.registrar_guia(true, alertaSonido,this.sender,codigosBarra); 
            } else { 
                this.registrar_documentos(this.sender, alertaSonido, codigosBarra); 
            }
            /*this.registrar_documentos(this.sender,null,codigosBarra);
            this.loading2=false;
            this.loading=false;*/
        }
    }
    updateRows(){
        this.rows = [...this.rows];
        this.count = 1;
        this.loading=false;
    }
    /*grilla*/
    onPage(event){ this.recuperar_detalle2(event.offset); }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {  }

    allCheckbox(event){  }
    onCheckboxChangeFn(event,row){  }

    /*grilla eventos*/
    hiddenQuitarDocumento(){ this.eliminardocid=0; this.eliminardocdescripcion='';/*this.recuperar_detalle(0); */}
    quitarDocumento(row) {
        /*console.dir(row);*/
        this.eliminardocdescripcion = row['codigo_barra'];
        this.eliminardocid = row['doc_id'];
        this.modalQuitarDocumento.show();
    }
    submitQuitarDocumento(){
        console.log("this.eliminardocid",this.eliminardocid)
        if(this.eliminardocid != 0){
            //this._guiaDespachoService.quitarDocumento({ 
                if(typeof this.idguiadespacho === 'string'){
                    let gui_string='';                    
                    gui_string = this.idguiadespacho;
                    let gui_id = parseInt(gui_string,10);
                    this.idguiadespacho = gui_id;
                    //console.log("gui=",typeof this.idguiadespacho);
                }
            this._guiaDespachoService.asignarDocumentosVarios({ 
                'gud_id': this.idguiadespacho,
                'suc_id': this.frmEditar.controls['Sucursal'].value,
                'agregar': false,
                'cod_barra': this.eliminardocdescripcion
                //'gud_id': this.idguiadespacho, 'doc_id': this.eliminardocid
            }, data=>{ 
                if(data.length > 0){
                    this.showMessage('error', data[0]['observacion'], '');
                    this.modalQuitarDocumento.hide();
                } else {
                    this.recuperar_detalle(0);
                    this.showMessage('success', 'Documento eliminado con éxito', '');
                    this.modalQuitarDocumento.hide();
                }   
                this.modalQuitarDocumento.hide();              
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
            });
        }
    }
    imprimir(row) {}
    /*bototnes*/
    btnAddRemoveDocumento_click(sender,alertaSonidoControl:HTMLAudioElement){
        //let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        for (let c in this.frmEditar.controls) {
            this.frmEditar.controls[c].markAsTouched();
        }
        if (this.frmEditar.valid == false) {  
            this.formLoading = false;
            this.showMessage('error', 'Debe completar la información necesaria', '');
        }else{
            this.msgagregardocumento=''; this.msgagregardocumentoestado='';
            this.count_rango = 0; this.rows_rango = [];
            var opc = (<HTMLInputElement>document.getElementById('Opcion3'));
            opc.checked = true;
            this.Opcion_click(opc.value);
            this.uploader = new FileUploader({ 
                queueLimit: 1,
                url: GLOBAL.url+"guiasDespacho/asignarDocumentosFile" ,
                headers: [{ 
                        name:'Authorization',
                        value:localStorage.getItem('token')
                    }]
            });
            this.uploader.onBuildItemForm = (fileItem: any, form: any) => {   
                this.formLoading = true;
                this.loading = true;
                
                form.append('gud_id', this.idguiadespacho.toString());
                form.append('suc_id', this.frmEditar.controls['Sucursal'].value.toString()); 
                form.append('agregar', (this.EsAgregarDocumento ? 'true' : 'false'));

                console.log("form: ", form);
            };
            /*this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
                //console.log("ImageUpload:uploaded:", item, status);
            };
            */
            this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
                this.loading = false;
                this.formLoading = false;
                item.remove();
                if(response) { //parse your response. 
                    let data = JSON.parse(response);
                    if(data.length > 0){
                        if(data.length > 0){
                            this.rows_rango = data;
                            this.count_rango = data.length; 
                        } 
                        if(this.EsAgregarDocumento==false){
                            this.modalRemoverDocumentos.hide();
                            this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron removerse, revise la lista.');
                        }else {
                            this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron asignarse, revise la lista.');
                        }
                        //let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
                        alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                        
                    } else { this.showMessage('success', 'Se ha cargado la información', ''); }
                    //this.recuperar_detalle(0);
                }
            }
            this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => { 
                this.loading = false;
                this.formLoading = false;
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
            this.msgagregardocumento='';
            this.msgagregardocumentoestado='';
            this.frmAgregarRemover.controls['codigoBarraAutomatico'].setValue('');
            this.frmAgregarRemover.controls['codigoBarraAutomatico'].enable();
            this.listAutomaticocodigosbarra = [];
            this.actualiza_cantidades_automatico();   
            document.getElementById('lblManualTotal').innerHTML='';   
            this.buscarCodigBarraOnline = true;
            /*if(this.idguiadespacho == 0 && this.buscarCodigBarraOnline == true && this.flag == false) {
                //this.flag = true; 
                this.registrar_guiaAuto(true, alertaSonidoControl, sender); 
            }  */
            this.ppAgregarRemover.show();
        }
    }
    Opcion_click(opcion_value){
        this.frmAgregarRemover.controls['Opcion'].setValue(opcion_value);
        this.habilita_opciones(opcion_value);
        
    }
    habilita_opciones(opcion_selected){
        this.frmAgregarRemover.controls['archivo'].setValue('');
        this.frmAgregarRemover.controls['rangoDesde'].reset();
        this.frmAgregarRemover.controls['rangoHasta'].reset();
        this.frmAgregarRemover.controls['codigoBarra'].reset();
        this.listcodigosbarra = [];
        
        switch (opcion_selected) {
            case '1':
                this.frmAgregarRemover.controls['archivo'].enable();
                this.frmAgregarRemover.controls['rangoDesde'].disable();
                this.frmAgregarRemover.controls['rangoHasta'].disable();
                this.frmAgregarRemover.controls['codigoBarra'].disable();
                break;
            case '2':
                this.frmAgregarRemover.controls['archivo'].disable();
                this.frmAgregarRemover.controls['rangoDesde'].enable();
                this.frmAgregarRemover.controls['rangoDesde'].setValue('');
                this.frmAgregarRemover.controls['rangoHasta'].enable();
                this.frmAgregarRemover.controls['rangoHasta'].setValue('');
                this.frmAgregarRemover.controls['codigoBarra'].disable();
                break;
            case '3':
                this.frmAgregarRemover.controls['archivo'].disable();
                this.frmAgregarRemover.controls['rangoDesde'].disable();
                this.frmAgregarRemover.controls['rangoHasta'].disable();
                this.frmAgregarRemover.controls['codigoBarra'].enable();
                break;
            default:
                break;
        }
    }
    btnEliminar_click(sender){
        this.modalEliminarGuia.show();
    }
    btnResetear_click(sender){
        this.modalResetearGuia.show();
    }
    btnCerrar_click(sender){
        this.router.navigate(['/distribucion/despachos']);
    }
    frmDespacho_submit(ev, values: any) {
        //this.formLoading = true;
        ev.preventDefault();
        for (let c in this.frmDespachar.controls) {
            this.frmDespachar.controls[c].markAsTouched();
        }
        if (this.frmDespachar.valid) {  
            this.formLoading = true;
            this._guiaDespachoService.despachar({ 
                'gud_id': this.idguiadespacho,
                'tra_id':this.frmEditar.controls['Transportista'].value,//this.frmDespachar.controls['Transport'].value,
                'gui_trans':this.frmDespachar.controls['GuiaTransp'].value,
                'fechadesp':this.frmDespachar.controls['FechaDespacho'].value 
            }, data=>{ 
                this.ppEntregaMensajero.hide();
                this.loading=false;
                this.formLoading = false;
                if(data['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    this.despachado = true;
                    this.recuperarDatos(this.idguiadespacho);
                    this.showMessage('success', data[0]['mensaje'], '');
                }                 
            }, error=>{ 
                this.ppEntregaMensajero.hide();               
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
                this.formLoading = false;
            });
        }else{
    		this.formLoading = false;
        }
    }
    btnEntregaMensajero_click(sender){        
        this.ppEntregaMensajero.show();
    }
    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }
    }
    /*Selecciona_cuadrante(event){
        this.frmAgregarRemover.controls['cuadrante2'].setValue(this.frmAgregarRemover.controls['cuadrante'].value);
        if(this.frmAgregarRemover.controls['cuadrante'].value == null || this.frmAgregarRemover.controls['cuadrante'].value == ''){
            this.frmAgregarRemover.controls['cuadranteDesc'].setValue('');
            this.frmAgregarRemover.controls['cuadranteDesc2'].setValue('');
        } else {
            var cdteSeleccionado = this.listcuadrantes.filter(cuadrante => cuadrante.sac_id == this.frmAgregarRemover.controls['cuadrante'].value);
            this.frmAgregarRemover.controls['cuadranteDesc'].setValue(cdteSeleccionado[0]['sac_descripcion']);
            this.frmAgregarRemover.controls['cuadranteDesc2'].setValue(cdteSeleccionado[0]['sac_descripcion']);
        }
    }
    Selecciona_cuadrante2(event){
        this.frmAgregarRemover.controls['cuadrante'].setValue(this.frmAgregarRemover.controls['cuadrante2'].value);
        if(this.frmAgregarRemover.controls['cuadrante2'].value == null || this.frmAgregarRemover.controls['cuadrante2'].value == ''){
            this.frmAgregarRemover.controls['cuadranteDesc'].setValue('');
            this.frmAgregarRemover.controls['cuadranteDesc2'].setValue('');
        } else {
            var cdteSeleccionado = this.listcuadrantes.filter(cuadrante => cuadrante.sac_id == this.frmAgregarRemover.controls['cuadrante'].value);
            this.frmAgregarRemover.controls['cuadranteDesc'].setValue(cdteSeleccionado[0]['sac_descripcion']);
            this.frmAgregarRemover.controls['cuadranteDesc2'].setValue(cdteSeleccionado[0]['sac_descripcion']);
        }
    }*/
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
            }
            else { this.showMessage('error', 'El código: '+sender.value+', ya ha sido agregado a la lista', ''); }
            sender.value='';
            sender.focus();
        }
    }
    codigoBarra2_keyup(sender:HTMLInputElement, event, alertaSonidoControl:HTMLAudioElement){
        if(sender.value == '') { this.msgagregardocumento = ''; this.msgagregardocumentoestado = ''; }
        if (event.which == 13 && sender.value != '') {
            this.msgagregardocumento = ''; this.msgagregardocumentoestado = '';
            for (let c in this.frmAgregarRemover.controls) {
                this.frmAgregarRemover.controls[c].markAsTouched();
            }
            if (this.frmAgregarRemover.valid) {
                let value = sender.value;
                this.sender = sender;
                sender.value = '';
                //this.formLoading = true;
                //this.loading = true;
                this.loading2 = true;
                let lbExiste: boolean = false;
                for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                    if(this.listAutomaticocodigosbarra[index].codigo_barra==value){ lbExiste = true; }
                }
                if(!lbExiste){
                    lbExiste = false;
                        this.listAutomaticocodigosbarra.splice(0,0,{'codigo_barra':value, 'estado':'Procesando', 'mensaje':''});
                        this.actualiza_cantidades_automatico();
                        this.validar(value, sender, alertaSonidoControl);
                } else {
                    this.showMessage('warning', 'El código de barras ya fue agregado', '');
                    this.formLoading = false;
                    this.loading = false;
                    this.loading2 = false;
                    sender.value = '';
                    sender.focus();
                }
                
            } else { return false; }
        }
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
        document.getElementById('lblCorrectos').innerHTML = 'Asignado: ' + this.countCorrectos.toString() + '<i class="icon icon-check text-success" style="margin-left: 15px;" title="Error"></i>';
        //let countPendientes:number = 0;
        //let countErrores:number = 0;
        //let countCorrectos:number = 0;
        /*document.getElementById('lblTotal').innerHTML = 'Total: ' + this.listAutomaticocodigosbarra.length.toString();
        for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
            switch (this.listAutomaticocodigosbarra[index].estado) {
                case 'Procesando':
                    countPendientes++;
                    break;
                case 'Error':
                    countErrores++;
                    break;
                case 'Correcto':
                    countCorrectos++;
                    break;
                default:
                    break;
            }
            
        }
        document.getElementById('lblPendientes').innerHTML = 'Pendientes: ' + countPendientes.toString() + '<i class="icon icon-clock text-warning" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblErrores').innerHTML = 'Error: ' + countErrores.toString() + '<i class="icon icon-exclamation text-danger" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblCorrectos').innerHTML = 'Asignado: ' + countCorrectos.toString() + '<i class="icon icon-check text-success" style="margin-left: 15px;" title="Error"></i>';*/
    }
    validar(value,sender,alertaSonidoControl:HTMLAudioElement){
        this.loading2 = true; 
        this._guiaDespachoService.asignarDocumentosValidar({ 
            'gud_id': 0,
            'suc_id': this.frmEditar.controls['Sucursal'].value,
            'agregar': true,
            'cod_barra': value,
            'emp_id': this.sesionAdicional['emp_id']
        }, data=>{ 
            /*this.formLoading = false;
            this.loading = false;*/
            this.loading2 = false; 
            if(data[0]['error'] == true){
                this.frmAgregarRemover.controls['codigoBarraAutomatico'].disable();
                let message = data[0]['codigo_barra']+'<br>'+data[0]['observacion'];
                this.mostrar_error_alerta(message);
                this.msgagregardocumento = data[0]['observacion'];
                this.control = sender;
                //this.msgagregardocumentoestado='alert-danger'; 
                //this.showMessage('warning', data[0]['observacion'], '');
                for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                    if(this.listAutomaticocodigosbarra[index].codigo_barra==data[0]['codigo_barra']){ 
                        this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':data[0]['codigo_barra'], 'estado':'Error', 'mensaje':data[0]['observacion']});
                        this.actualiza_cantidades_automatico();
                    }
                }
                alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                //this.frmAgregarRemover.controls['codigoBarraAutomatico'].disable();
            } else {
                /*if(this.idguiadespacho == 0) { 
                    this.registrar_guia(true, alertaSonidoControl, sender, data[0]['codigo_barra']); 
                } else { 
                    this.registrar_documentos(sender, alertaSonidoControl, data[0]['codigo_barra']); 
                }*/
            } 
        }, error=>{   
            sender.value = '';    
            this.formLoading = false;
            this.loading = false;
            this.loading2 = false;       
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
        });
    }
    buscarcodigobarra_online(bestado: boolean){
        this.buscarCodigBarraOnline = bestado;
    }
    hiddenRemoverDocumentos(){  }
    submitRemoverDocumentos(alertaSonidoControl:HTMLAudioElement){
        if(typeof this.idguiadespacho == 'string'){
            let gui_string='';                    
            gui_string = this.idguiadespacho;
            let gui_id = parseInt(gui_string,10);
            this.idguiadespacho = gui_id;
        }
        this.modalRemoverDocumentos.hide(); 
        this.formLoading = true;
        this.loading = true;
        this.EsAgregarDocumento = false;
        let values = this.frmAgregarRemover.value;
        this.count_rango = 0;
        this.rows_rango = [];
        if(values['Opcion']=='1'){    
            this.uploader.queue.forEach(element => {
                element.upload();
                this.loading = true;
                this.formLoading = true;
                this.lbltituloprocesados='N° No Removidos';
            });
        } else if(values['Opcion']=='2'){
            this._guiaDespachoService.asignarRango({ 
                'gud_id': this.idguiadespacho,
                'suc_id': this.frmEditar.controls['Sucursal'].value,
                'agregar': false,
                'cod_barra_inicial': values['rangoDesde'],
                'cod_barra_final': values['rangoHasta'] 
            }, data=>{ 
                this.formLoading = false;
                this.loading = false;
                this.frmAgregarRemover.controls['rangoDesde'].setValue('');
                this.frmAgregarRemover.controls['rangoHasta'].setValue('');
                if(data.length > 0){
                    this.lbltituloprocesados='N° No Removidos';
                    this.rows_rango = data; 
                    this.count_rango = data.length; 
                    alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                    this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron removerse, revise la lista.');
                } else {
                    this.lbltituloprocesados='';
                    this.showMessage('success', 'Se elimino el/los documento/s correctamente', ''); 
                }
                //this.modalRemoverDocumentos.hide(); 
                //this.recuperar_detalle(0);
            }, error=>{ 
                this.lbltituloprocesados=''; 
                this.formLoading = false;
                this.loading = false;
                this.modalRemoverDocumentos.hide();
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
            });
        } else if(values['Opcion']=='3'){
            let codigosBarra:string = '';
            codigosBarra = this.listcodigosbarra.join();
            /*for (let index = this.listcodigosbarra.length; index > 0; index--) {
                codigosBarra = codigosBarra + (codigosBarra != '' ? ',' : '') + this.listcodigosbarra[(index-1)];
            }*/
            this.listcodigosbarra = [];
            this._guiaDespachoService.asignarDocumentosVarios({ 
                'gud_id': this.idguiadespacho, /*'sac_id': values['cuadrante'],*/ 
                'suc_id': this.frmEditar.controls['Sucursal'].value,
                'agregar': false,
                'cod_barra': codigosBarra
            }, data=>{ 
                this.formLoading = false;
                this.loading = false;
                this.listcodigosbarra = [];
                document.getElementById('lblManualTotal').innerHTML='';
                if(data.length > 0){
                    this.lbltituloprocesados='N° No Removidos';
                    this.rows_rango = data;
                    this.count_rango = data.length;
                    alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                    this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron removerse, revise la lista.');
                } else {
                    this.lbltituloprocesados='';
                    //this.recuperar_detalle(0);
                    this.showMessage('success', 'Se han removido los documentos', '');
                }   
                this.modalRemoverDocumentos.hide();                
            }, error=>{  
                this.lbltituloprocesados='';     
                this.formLoading = false;
                this.loading = false;    
                this.modalRemoverDocumentos.hide();     
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
            });
        }
    }
    hiddenEliminarGuia(){  }
    hiddenCerrar(){  }
    submitEliminarGuia(){ 
        this.deleteloading = true;
        this._guiaDespachoService.eliminar({ 
            'gud_id': this.idguiadespacho
        }, data=>{ 
            this.deleteloading = false;
            if(data['error'] == true){
                this.editar = false;
                this.showMessage('error', data[0]['mensaje'], '');
            } else {
                this.router.navigate(['/distribucion/despachos']);
                this.showMessage('success', data[0]['mensaje'], '');
            }                 
        }, error=>{                
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
            this.deleteloading = false;
            this.loading=false;
        });
    }
    eliminarCodigoLista(index){
        this.listcodigosbarra.splice(index,1);
    }
    hiddenResetearGuia(){  }
    submitResetarGuia(){
        this.loading=true;
        this._guiaDespachoService.resetear({ 
            'gud_id': this.idguiadespacho 
        }, data=>{ 
            this.loading=false;
            if(data['error'] == true){
                this.showMessage('error', data[0]['mensaje'], '');
            } else {
                this.recuperarDatos(this.idguiadespacho);
                this.showMessage('success', data[0]['mensaje'], '');
                this.modalResetearGuia.hide();
            }                 
        }, error=>{                
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
            this.loading=false;
        });
    }
    btnLimpiarAutomaticoCodigoBarras_click(sender, control:HTMLInputElement){
        //control.readOnly=false;
        this.msgagregardocumento='';
        this.msgagregardocumentoestado='';
        this.frmAgregarRemover.controls['codigoBarraAutomatico'].enable();
        control.value='';
        //control.focus();
    }
    cerrar(){console.log("lista: ",this.listAutomaticocodigosbarra,this.rows.length);
        if(this.countPendientes > 0){
            this.modalCerrar.show();
        }else{
            this.ppAgregarRemover.hide();
            this.recuperar_detalle(0);
        }       
    }
    updateFilter(event){
        let val = event.target.value;
        if(this.consultafiltro.length > 0){
            const temp = this.consultafiltro.filter(d => d.codigo_barra.indexOf(val) !== -1 || !val );
            this.rows = temp;console.log("e:",event);
        }
        //const temp = this.rows.filter(d => d.codigo_barra.indexOf(val) !== -1 || !val );
        //this.rows = temp;console.log("e:",event);
        if(event.target.value == ""){
            this.recuperarDatos(this.idguiadespacho);//this.table.offset = 0;
        }
    }
    submitCerrar(){
        this.recuperar_detalle(0);
        this.modalCerrar.hide();
        this.ppAgregarRemover.hide();
    }
    btnNuevo_click(sender){
        this.nuevo = true;
        console.log("hola");
        this.idestadoguia = 1;
        this.idguiadespacho = 0
        this.frmEditar.reset('');
        this.frmEditar.controls['Sucursal'].enable();
        this.frmEditar.controls['Transportista'].enable();
        document.getElementById('lbltitguia').innerHTML='';
        this.rows = [];
        this.count = 0;
        this.router.navigate(['/distribucion/editarguiadespacho']);
    }
    /*alerta*/
    hiddenalertDocumentos(){ }
    Aceptar_alertDocumentos(){ 
        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        alertaSonidoControl.loop = false; alertaSonidoControl.pause(); 
        this.alertDocumentos.hide();
        this.msgagregardocumento='';
        this.msgagregardocumentoestado='';
        this.frmAgregarRemover.controls['codigoBarraAutomatico'].enable();
        if(this.control){this.control.value='';this.control.focus();}
        
    }
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje; }
}