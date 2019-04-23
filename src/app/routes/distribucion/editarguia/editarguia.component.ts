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
import { SucursalService } from '../../../services/sucursal.service';
import { DownloadService } from '../../../services/download.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forEach } from '@angular/router/src/utils/collection';
import { eventNames } from 'cluster';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
    selector: 'editar-guia',
    templateUrl: './editarguia.component.html'
})
export class EditarGuiaComponent implements OnInit {
    private sesion: any;
    private emp_id_user: any;
    private frmmodo: string;
    public loading:boolean = false;
    public loading2:boolean = false;
	public formLoading:boolean = false;
    public processRest;
    public panelBusqSeleccionado: number = 0;
    frmEditar: FormGroup;
    frmEntrega: FormGroup;
    frmAgregarRemover: FormGroup;
    listestados:any = [];
    listdistritos:any = [];
    listmensajeros:any = [];
    listcuadrantes:any = [];
    idguia: number = 0;
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
    flag:boolean=false;
    countPendientes:number = 0;
    countErrores:number = 0;
    countCorrectos:number = 0;
    sender:any=null;
    control:any;
    nuevo:boolean = false;
    consultafiltro=[];
    /*Grilla 1*/
    columns=[];
    rows=[];
    limit=10;
    limit2=0;
    count=0;
    order:string;
    selected = [];
    sucursal: number;
    nroguia=0;

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
        url: GLOBAL.url+"guias/asignarDocumentosFile" ,
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
        private _guiaService: GuiaService,
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _sucursalService: SucursalService,
        private _userService: UserService,
        private _downloadService:DownloadService
    ){
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.frmEditar = fb.group({
            'Distrito': ['',Validators.compose([Validators.required])],
            'Mansajero': ['',Validators.compose([Validators.required])],
            'NroGuia': ['',Validators.compose([])],
            'Despachador': ['',Validators.compose([])],
            'FechaGuia': ['',Validators.compose([])],
            'FechaEntrgaMensajero': ['', Validators.compose([])],
            'Pasaje': ['',Validators.compose([])],
            'FechaCierre': ['', Validators.compose([])],
            'Estado': ['', Validators.compose([])],
            'Cerrados': ['', Validators.compose([])],
            'Pendiente': ['', Validators.compose([])],
            'TotalDocumentos': ['', Validators.compose([])]
        });
        this.frmEntrega = fb.group({
            'editPasaje': ['',Validators.compose([Validators.required])]
        });
        this.frmAgregarRemover = fb.group({
            'cuadrante': ['',Validators.compose([Validators.required])],
            'cuadranteDesc': [{ value:'', disabled: true},Validators.compose([])],
            'cuadrante2': ['',Validators.compose([Validators.required])],
            'cuadranteDesc2': [{ value:'', disabled: true},Validators.compose([])],
            'Opcion': [''],
            'archivo': [{ value:'', disabled: true},Validators.compose([])],
            'rangoDesde': [{ value:'', disabled: true},Validators.compose([])],
            'rangoHasta': [{ value:'', disabled: true},Validators.compose([])],
            'codigoBarra': [{ value:'', disabled: true},Validators.compose([])],
            'codigoBarraAutomatico': ['',Validators.compose([])]
        });
        this.sucursal = this._authService.getIdentity().suc_id;
        this.emp_id_user = this._authService.getIdentity().emp_id;
        /*if(this.sucursal == null){
            this._userService.logout();  
            this._authService.logout();        
            localStorage.removeItem('identity');
            localStorage.removeItem('token');
            localStorage.clear();     
            this.router.navigate(['login']);
        }*/
        /*this._userService.find({ id : this.sesion.userId },
            data=>{ */
                
                this._empresaService.mensajero(
                    { 'emp_id':this.emp_id_user},
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
                this._sucursalService.distritos(
                { 'suc_id':this.sucursal },
                data=>{ this.listdistritos = data; },
                error=>{                
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading=false;
                });
                
            /*},
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );*/
        if(this.activateRoute.snapshot.params['idguia']){
            this.idguia = this.activateRoute.snapshot.params['idguia'];
            this.recuperarDatos(this.idguia);
            //this.recuperarDatos(+this.activateRoute.snapshot.params['idguia']);
        } else {
            this.idguia = 0;
            this.idestadoguia = 1;
        }
    }   
    ngOnInit(){
        
    }
    Distrito_change(e){
        this._sucursalService.cuadrantes(
            { 'sam_id': this.frmEditar.controls['Distrito'].value },
            cuadrantes=>{
                let arraycuadrantes = [];
                let nombre = '';
                let descrip = '';
                for(let i = 0; i < cuadrantes.length; i++){
                    if(cuadrantes[i].sac_nombre != '' && cuadrantes[i].sac_nombre != null){
                        nombre = cuadrantes[i].sac_nombre;
                    }
                    if(cuadrantes[i].sac_descripcion != '' && cuadrantes[i].sac_descripcion != null){
                        if(nombre != '' && nombre != null){
                            descrip = ' - '+cuadrantes[i].sac_descripcion;
                        }else{
                            descrip = cuadrantes[i].sac_descripcion;
                        }
                    }
                    if( (nombre != '' && nombre != null) || (descrip != '' && descrip != null) ){
                        arraycuadrantes.push({ sac_id: cuadrantes[i].sac_id, sac_nombre:nombre+descrip});
                    }
                    /*arraycuadrantes.push({ sac_id: cuadrantes[i].sac_id, sac_nombre:
                        (cuadrantes[i].sac_nombre != '' || cuadrantes[i].sac_nombre != null ? cuadrantes[i].sac_nombre :'') + (cuadrantes[i].sac_descripcion != '' || cuadrantes[i].sac_descripcion != null ? ' - '+cuadrantes[i].sac_descripcion :'')});*/
                }
                this.listcuadrantes = arraycuadrantes;//cuadrantes;
            },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
        });
    }
    recuperarDatos(pidguia:number, pblistadetalle:boolean=true, pblistacuradrantes:boolean=true){
        this.idguia = pidguia;
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        this._guiaService.buscar({ gui_id : this.idguia }, 
        data=>{ 
            this.idestadoguia = data[0]['gue_id'];
            this.frmEditar.controls['Distrito'].setValue(data[0]['sam_id']);
            if(this.idestadoguia == 1 && this.idguia == 0){ this.frmEditar.controls['Distrito'].enable(); }
            else { this.frmEditar.controls['Distrito'].disable(); }
            this.frmEditar.controls['Mansajero'].setValue(data[0]['men_id']);
            if(this.idestadoguia == 1){ this.frmEditar.controls['Mansajero'].enable(); }
            else { this.frmEditar.controls['Mansajero'].disable(); }
            this.frmEditar.controls['NroGuia'].setValue(data[0]['gui_numero']);
            document.getElementById('lbltitguia').innerHTML=data[0]['gui_numero'];//this.nroguia=data[0]['gui_numero'];
            this.frmEditar.controls['Despachador'].setValue(data[0]['despachador']);
            this.frmEditar.controls['FechaGuia'].setValue(data[0]['fecha_creacion']);
            this.frmEditar.controls['FechaEntrgaMensajero'].setValue(data[0]['fecha_entrega']);
            this.frmEditar.controls['Pasaje'].setValue(data[0]['gui_pasaje']);
            this.frmEditar.controls['FechaCierre'].setValue(data[0]['fecha_cierre']);
            this.frmEditar.controls['Estado'].setValue(data[0]['gue_descripcion']);
            this.frmEditar.controls['Cerrados'].setValue(data[0]['gui_nro_docs_cerrado']);
            this.frmEditar.controls['Pendiente'].setValue(data[0]['gui_nro_docs_pendiente']);
            this.frmEditar.controls['TotalDocumentos'].setValue(data[0]['gui_nro_docs']);
            if(pblistacuradrantes){
                this._sucursalService.cuadrantes(
                    { 'sam_id':data[0]['sam_id'] },
                    cuadrantes=>{
                        let arraycuadrantes = [];
                        for(let i = 0; i < cuadrantes.length; i++){
                            arraycuadrantes.push({ sac_id: cuadrantes[i].sac_id, sac_nombre:
                                (cuadrantes[i].sac_nombre != '' ? cuadrantes[i].sac_nombre :'') + (cuadrantes[i].sac_descripcion != '' ? ' - '+cuadrantes[i].sac_descripcion :'')});
                        }
                        this.listcuadrantes = arraycuadrantes;//cuadrantes; 
                    },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                });
            }
        }, error=>{                
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
            this.loading=false;
        });
        if(pblistadetalle){ this.recuperar_detalle(0); }
    }
    recuperar_detalle(page:number){
        this.loading=true;
        this.formLoading=true;
        this.count = 0;
        this.rows = [...[]];
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        this._guiaService.consultaFiltro({ gui_id : this.idguia, emp_id_user: this.emp_id_user }, 
            data=>{
                this.loading=false;
                this.formLoading=false;console.log("data rows: ",data);
                if(data !== undefined && data.length > 0) { 
                    this.limit2 = this.limit2+10;
                    this.consultafiltro = data;
                    this.consultafiltro = [...this.consultafiltro];
                    this.count = data[0]['nro_docs'];
                    this.frmEditar.controls['TotalDocumentos'].setValue(data[0]['nro_docs']);
                    this.rows = this.consultafiltro.slice(page * this.limit, this.limit2);
                    this.rows = [...this.rows];
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
    recuperar_detalle0(page:number){ //viejo
        this.loading=true;
        this.formLoading=true;
        this.count = 0;
        this.rows = [...[]];
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        this._guiaService.consultaDetalle({ gui_id : this.idguia, desde_fila: (page * this.limit), limite_filas: this.limit  }, 
            data=>{
                this.loading=false;
                this.formLoading=false;console.log("data rows: ",data);
                if(data !== undefined && data.length > 0) { 
                    this.rows = data; 
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
        /*this._guiaService.consultaFiltro({ gui_id : this.idguia},
            data=>{
                if(data !== undefined && data.length > 0) {
                    this.consultafiltro = data;
                    this.consultafiltro = [...this.consultafiltro];
                }
            });*/
    }
    /*eventos formularios*/
    registrar_guia(bGuardarDocumentos: boolean = false, alertaSonidoControl:HTMLAudioElement = null, inputSender:any = null, pscodigoBarra:string=null){
        this.loading=true;
        this.formLoading = true;
        let values = this.frmEditar.value;
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        for (let c in this.frmEditar.controls) {
            this.frmEditar.controls[c].markAsTouched();
        }
        if (this.frmEditar.valid) {  
            this._guiaService.guardar({ 
                'guia_id': this.idguia, 'sam_id': this.frmEditar.controls['Distrito'].value, 'men_id': values['Mansajero']
            }, data=>{
                //console.log("this.idguia = "+this.idguia);
                console.log("data = ",data);
                this.loading=false;
                this.formLoading = false;
                if(data['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    //this.showMessage('success', data[0]['mensaje'], '');
                    if(bGuardarDocumentos){
                        this.recuperarDatos(data[0]['id'],false,false); 
                        this.idguia = data[0]['id'];
                        console.log("guia creada2  ="+data[0]['id']);
                        this.registrar_documentos(inputSender, alertaSonidoControl, pscodigoBarra);
                    } else { 
                        if(this.idguia > 0){ /*Edición*/this.btnCerrar_click(''); } 
                        else { /*Nuevo*/this.recuperarDatos(data[0]['id']); }
                    }
                }            
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.idguia = 0;
                this.loading=false;
                this.formLoading = false;
            });
        }else{
    		this.formLoading = false;
        }
    }
    registrar_guiaAuto(bGuardarDocumentos: boolean = false, alertaSonidoControl:HTMLAudioElement = null, inputSender:any = null, pscodigoBarra:string=null){
        let values = this.frmEditar.value;
        for (let c in this.frmEditar.controls) {
            this.frmEditar.controls[c].markAsTouched();
        }
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        if (this.frmEditar.valid && this.idguia == 0) {  
            this._guiaService.guardar({ 
                'guia_id': this.idguia, 'sam_id': this.frmEditar.controls['Distrito'].value, 'men_id': values['Mansajero']
            }, data=>{
                this.flag =true;
                this.loading=false;
                this.formLoading = false;
                if(data['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    //this.showMessage('success', data[0]['mensaje'], '');
                    if(bGuardarDocumentos){
                        this.recuperarDatos(data[0]['id'],false,false); 
                        this.idguia = data[0]['id'];
                        console.log("guia creada ="+data[0]['id']);
                        //this.registrar_documentos(inputSender, alertaSonidoControl, pscodigoBarra);
                    } else { 
                        if(this.idguia > 0){ /*Edición*/this.btnCerrar_click(''); } 
                        else { /*Nuevo*/this.recuperarDatos(data[0]['id']); }
                    }
                }            
            }, error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.idguia = 0;
                this.loading=false;
                this.formLoading = false;
            });
        }else{
    		this.formLoading = false;
        }
    }
    frmEditar_submit(ev) {
        ev.preventDefault();
        this.registrar_guia(false, null);
    }
    registrar_documentos(inputSender:any = null, alertaSonidoControl:HTMLAudioElement = null, pscodigoBarra:string=null){
        let values = this.frmAgregarRemover.value;
            //emp_id_user
        this.count_rango = 0;
        this.rows_rango = [];
        if(!this.buscarCodigBarraOnline){
        this.formLoading = true;
        this.loading = true;}
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        if(this.buscarCodigBarraOnline){
            this.loading2 = true;
            //let codigosBarra:string = '';
            // for (let index = this.listcodigosbarra.length; index > 0; index--) {
            //     codigosBarra = codigosBarra + (codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
            // }      
            this.listcodigosbarra = [];console.log("pscodigoBarra: ",pscodigoBarra);
            if(pscodigoBarra != ''){
                this._guiaService.asignarDocumentos({ 
                    'gui_id': this.idguia, 'sac_id': values['cuadrante'], 'agregar': true
                    , 'cod_barra': pscodigoBarra
                }, data=>{console.log("data2 = ",data);
                    this.formLoading = false;
                    this.loading = false;
                    this.loading2 = false;
                    //this.msgagregardocumento = data[0]['mensaje'];
                    //console.log("d: ",data.length);
                    if(data.length > 0){ //&& data[0]['error'] == true
                        alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                        this.mostrar_error_alerta(data[0]['observacion']);
                        this.frmAgregarRemover.controls['codigoBarraAutomatico'].disable();
                    } else {
                        this.showMessage('success', 'Documentos grabados', '');
                        inputSender.value='';
                        inputSender.focus();
                    }
                    let index 
                    let array = pscodigoBarra.split(",");
                    for (index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                        for(let i = 0; i < array.length; i++){                        
                            if(this.listAutomaticocodigosbarra[index].codigo_barra==array[i]){
                                //console.log(i,"=",this.listAutomaticocodigosbarra[index]);
                                this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':array[i], 'estado':'Correcto', 'mensaje':'Documento agregado'});
                                this.actualiza_cantidades_automatico();
                            }
                            /*if(this.listAutomaticocodigosbarra[index].codigo_barra==data[0]['codigo_barra']){ 
                                this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':data[0]['codigo_barra'], 'estado':(data[0]['error'] == true ? 'Error':'Correcto'), 'mensaje':data[0]['observacion']});
                                this.actualiza_cantidades_automatico();
                            }*/
                        }
                    }
                    //this.recuperar_detalle(0);              
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
            this._guiaService.asignarRango({ 
                'gui_id': this.idguia, 'sac_id': values['cuadrante'], 'agregar': true
                , 'cod_barra_inicial': values['rangoDesde'], 'cod_barra_final': values['rangoHasta']
                , 'usu_id': this.sesion.userId 
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
            this.listcodigosbarra = [];
            //this._guiaService.asignarDocumentosVarios({
            if(typeof this.idguia == 'string'){
                let gui_string='';                    
                gui_string = this.idguia;
                let gui_id = parseInt(gui_string,10);
                this.idguia = gui_id;
            }
            this._guiaService.asignarDocumentos({
                'gui_id': this.idguia, 'sac_id': values['cuadrante'], 'agregar': true
                , 'cod_barra': codigosBarra 
            }, data=>{ 
                this.formLoading = false;
                this.loading = false;
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
                    this.showMessage('success', 'Documentos grabados'/*data[0]['mensaje']*/, '');
                }   
                                
            }, error=>{
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
        }
    }
    hiddenAgregarRemover(){ /*this.recuperar_detalle(0); */}
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
            //emp_id_user
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
                if(this.idguia == 0) { 
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
            //emp_id_user
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
        this.modalCerrar.hide();
        //console.log("lista1: ",this.listAutomaticocodigosbarra,this.listAutomaticocodigosbarra[0].codigo_barra,this.listAutomaticocodigosbarra[0].mensaje);
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
            console.log("codigos!: ",codigosBarra);
            if(this.idguia == 0) { 
                this.registrar_guia(true, alertaSonido,this.sender,codigosBarra); 
            } else { 
                this.registrar_documentos(this.sender, alertaSonido, codigosBarra); 
            }
            /*if(this.idguia == 0 && this.buscarCodigBarraOnline == true && this.flag == false) {
                //this.flag = true; 
                this.registrar_guiaAuto(true, alertaSonido, sender); 
            } */
            
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
    hiddenQuitarDocumento(){ this.eliminardocid=0; this.eliminardocdescripcion='';/*this.recuperar_detalle(0);*/ }
    quitarDocumento(row) {
        /*console.dir(row);*/
        this.eliminardocdescripcion = row['codigo_barra'];
        this.eliminardocid = row['doc_id'];
        this.modalQuitarDocumento.show();
    }
    submitQuitarDocumento(){
        if(this.eliminardocid != 0){
            if(typeof this.idguia == 'string'){
                let gui_string='';                    
                gui_string = this.idguia;
                let gui_id = parseInt(gui_string,10);
                this.idguia = gui_id;
            }
            this._guiaService.quitarDocumento({ 
                'gui_id': this.idguia, 'doc_id': this.eliminardocid
            }, data=>{ 
                if(data[0]['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    this.recuperar_detalle(0);
                    this.showMessage('success', data[0]['mensaje'], '');
                    this.modalQuitarDocumento.hide();
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
    }
    /*bototnes*/
    btnAddRemoveDocumento_click(sender,alertaSonidoControl:HTMLAudioElement){
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
                url: GLOBAL.url+"guias/asignarDocumentosFile" ,
                headers: [{ 
                        name:'Authorization',
                        value:localStorage.getItem('token')
                    }]
            });
            this.uploader.onBuildItemForm = (fileItem: any, form: any) => {   
                this.formLoading = true;
                this.loading = true;
                form.append('gui_id', this.idguia.toString());
                form.append('sac_id', this.frmAgregarRemover.controls['cuadrante'].value.toString());
                form.append('agregar', (this.EsAgregarDocumento ? 'true' : 'false'));
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
                        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
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
            /*if(this.idguia == 0 && this.buscarCodigBarraOnline == true && this.flag == false) {
                //this.flag = true; 
                this.registrar_guiaAuto(true, alertaSonidoControl, sender); 
            }*/   
            this.ppAgregarRemover.show();
            if(this.listcuadrantes.length == 1){ 
                this.frmAgregarRemover.controls['cuadrante'].setValue(this.listcuadrantes[0]['sac_id']); 
                this.Selecciona_cuadrante('');
            }
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
        this.router.navigate(['/distribucion/asignaciondocumentos']);
    }
    frmEntrega_submit(ev, values: any) {
        //this.formLoading = true;
        ev.preventDefault();
        for (let c in this.frmEntrega.controls) {
            this.frmEntrega.controls[c].markAsTouched();
        }
        if (this.frmEntrega.valid) {  
            this.loading = true;
            this.formLoading = true;
            if(typeof this.idguia == 'string'){
                let gui_string='';                    
                gui_string = this.idguia;
                let gui_id = parseInt(gui_string,10);
                this.idguia = gui_id;
            }
            this._guiaService.entregar({ 
                'gui_id': this.idguia, 'men_id':this.frmEditar.controls['Mansajero'].value, 'pasaje':values['editPasaje'] 
            }, data=>{ 
                this.ppEntregaMensajero.hide();
                this.loading=false;
                if(data['error'] == true){
                    this.showMessage('error', data[0]['mensaje'], '');
                } else {
                    this.showMessage('success', data[0]['mensaje'], '');
                    this.imprimir();
                    this.recuperarDatos(this.idguia);                                        
                }                 
            }, error=>{ 
                this.ppEntregaMensajero.hide();               
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
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
    Selecciona_cuadrante(event){
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
                //this.listcodigosbarra.splice(0,0,sender.value); 
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
                // VALIDA SI EL CODIGO DE BARRA YA FUE INGRESADO
                for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                    if(this.listAutomaticocodigosbarra[index].codigo_barra==value){ lbExiste = true; }
                }
                if(!lbExiste){
                    lbExiste = false;//console.log("sender: ",sender);
                        this.listAutomaticocodigosbarra.splice(0,0,{'codigo_barra':value, 'estado':'Procesando', 'mensaje':''});
                        this.actualiza_cantidades_automatico(); //SE ACTUALIZAN LOS ESTADOS DEL CODIGO DE BARRA
                        this.validar(value, sender, alertaSonidoControl);
                        /*Aqui iba todo lo que esta dentro del validar*/
                } else {
                    this.showMessage('warning', 'El código de barras ya fue agregado', '');
                    this.formLoading = false;
                    this.loading = false;
                    this.loading2 = false
                    sender.value = '';
                    sender.focus();
                }                
            } else { return false; }
        }
    }
    validar(value,sender,alertaSonidoControl:HTMLAudioElement){
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        } 
        this._guiaService.asignarDocumentosValidar({ 
            'gui_id': this.idguia,
            'sac_id': this.frmAgregarRemover.controls['cuadrante'].value,
            'agregar': true,
            'cod_barra': value,
            'suc_id': this.sucursal,
            'emp_id': this.emp_id_user
        }, data=>{
            //this.formLoading = false;
            //this.loading = false;
            this.loading2 = false;
            if(data[0]['error'] == true){
                this.frmAgregarRemover.controls['codigoBarraAutomatico'].disable();
                let message = data[0]['codigo_barra']+'<br>'+data[0]['observacion'];
                this.mostrar_error_alerta(message);
                this.msgagregardocumento = data[0]['observacion'];
                this.control = sender;console.log("this.control: ",this.control);
                for (let index = 0; index < this.listAutomaticocodigosbarra.length; index++) {
                    if(this.listAutomaticocodigosbarra[index].codigo_barra==data[0]['codigo_barra']){ 
                        this.listAutomaticocodigosbarra.splice(index,1,{'codigo_barra':data[0]['codigo_barra'], 'estado':'Error', 'mensaje':data[0]['observacion']});
                        this.actualiza_cantidades_automatico();
                    }
                }
                alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                //this.frmAgregarRemover.controls['codigoBarraAutomatico'].disable();
            } else {
                /*if(this.idguia == 0) { 
                    this.registrar_guia(true, alertaSonidoControl, sender, data[0]['codigo_barra']); 
                } else { */
                    //this.registrar_documentos(sender, alertaSonidoControl, data[0]['codigo_barra']); 
                //}
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
        document.getElementById('lblPendientes').innerHTML = 'Por Asignar: ' + this.countPendientes.toString() + '<i class="icon icon-clock text-warning" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblErrores').innerHTML = 'Error: ' + this.countErrores.toString() + '<i class="icon icon-exclamation text-danger" style="margin-left: 15px;" title="Error"></i>';
        document.getElementById('lblCorrectos').innerHTML = 'Asignado: ' + this.countCorrectos.toString() + '<i class="icon icon-check text-success" style="margin-left: 15px;" title="Error"></i>';
    }
    buscarcodigobarra_online(bestado: boolean){
        this.buscarCodigBarraOnline = bestado;
    }
    hiddenRemoverDocumentos(){  }
    submitRemoverDocumentos(alertaSonidoControl:HTMLAudioElement){
        this.modalRemoverDocumentos.hide(); 
        this.formLoading = true;
        this.loading = true;
        this.EsAgregarDocumento = false;
        let values = this.frmAgregarRemover.value;
        this.count_rango = 0;
        this.rows_rango = [];
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        if(values['Opcion']=='1'){    
            this.uploader.queue.forEach(element => {
                element.upload();
                this.loading = true;
                this.formLoading = true;
                this.lbltituloprocesados='N° No Removidos';
            });
        } else if(values['Opcion']=='2'){
            this._guiaService.asignarRango({ 
                'gui_id': this.idguia, 'sac_id': values['cuadrante'], 'agregar': false
                , 'cod_barra_inicial': values['rangoDesde'], 'cod_barra_final': values['rangoHasta'] 
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
            for (let index = this.listcodigosbarra.length; index > 0; index--) {
                codigosBarra = codigosBarra + (codigosBarra != '' ? ',' : '') + this.listcodigosbarra[(index-1)];
            }
            this._guiaService.asignarDocumentos({ 
                'gui_id': this.idguia, 'sac_id': values['cuadrante'], 'agregar': false
                , 'cod_barra': codigosBarra
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
                    this.showMessage('success', 'Documentos removidos'/*data[0]['mensaje']*/, '');
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
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        this._guiaService.eliminar({ 
            'gui_id': this.idguia
        }, data=>{ 
            if(data['error'] == true){
                this.showMessage('error', data[0]['mensaje'], '');
            } else {
                this.router.navigate(['/distribucion/asignaciondocumentos']);
                this.showMessage('success', data[0]['mensaje'], '');
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
    eliminarCodigoLista(index){
        this.listcodigosbarra.splice(index,1);
    }
    hiddenResetearGuia(){  }
    submitResetarGuia(){
        this.loading = true
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        this._guiaService.resetear({ 
            'gui_id': this.idguia 
        }, data=>{ 
            this.loading = false;
            if(data['error'] == true){
                this.showMessage('error', data[0]['mensaje'], '');
            } else {
                this.recuperarDatos(this.idguia);
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
    cerrar(){
        console.log("lista: ",this.listAutomaticocodigosbarra,
                    "correctos: ",this.countCorrectos,
                    "rows: ",this.rows.length);
        if(this.countPendientes > 0){//(this.listAutomaticocodigosbarra.length > 0 && this.countCorrectos == 0) 
            //Modal para certificar cerrar sin guardar
            console.log("modal1");
            this.modalCerrar.show();
        }else{
            this.ppAgregarRemover.hide();
            this.recuperar_detalle(0);
        }
        /*if((this.listAutomaticocodigosbarra.length > 0 && this.countCorrectos == 0 && this.rows.length == 0) || (this.listAutomaticocodigosbarra.length == 0 && this.rows.length == 0)){
            if(this.countPendientes > 0){//(this.listAutomaticocodigosbarra.length > 0 && this.countCorrectos == 0) 
                //Modal para certificar cerrar sin guardar
                console.log("modal1");
                this.modalCerrar.show();
            }
            else{
                this.submitEliminarGuia();
                this.ppAgregarRemover.hide();
            }
            
        }else{
            if(this.listAutomaticocodigosbarra.length > 0 && this.countCorrectos == 0){
                //Modal para certificar cerrar sin guardar
                console.log("modal2");
                this.modalCerrar.show();            
            }else{
                if(this.countCorrectos > 0 || this.rows.length > 0){
                    this.ppAgregarRemover.hide();
                    this.recuperar_detalle(0);
                }
            }
        }*/
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
            this.recuperarDatos(this.idguia);//this.table.offset = 0;
        } 
    }

    btnActualizar(){
        this.loading = true;
        this.loading2 = true;
        if(typeof this.idguia == 'string'){
            let gui_string='';                    
            gui_string = this.idguia;
            let gui_id = parseInt(gui_string,10);
            this.idguia = gui_id;
        }
        this._guiaService.guardar(
        {
            'guia_id': this.idguia,
            'sam_id': this.frmEditar.controls['Distrito'].value,
            'men_id': this.frmEditar.controls['Mansajero'].value
        }, data=>{ 
            this.loading=false;
            this.formLoading = false;
            if(data['error'] == true){
                this.showMessage('error', data[0]['mensaje'], '');
            } else {
                this.showMessage('success', 'Mensajero Actualizado', '');
                this.recuperarDatos(this.idguia); 
                
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
    submitCerrar(){
        /*if(this.rows.length == 0){
            this.submitEliminarGuia();
        }else{*/
            this.recuperar_detalle(0);
        //}
        this.modalCerrar.hide();
        this.ppAgregarRemover.hide();
    }
    btnNuevo_click(sender){
        this.nuevo = true;
        this.idestadoguia = 1;
        this.idguia = 0
        this.frmEditar.reset('');
        this.frmEditar.controls['Distrito'].enable();
        this.frmEditar.controls['Mansajero'].enable();
        document.getElementById('lbltitguia').innerHTML='';
        this.rows = [];
        this.count = 0;
        this.router.navigate(['/distribucion/editarguia']);
    }
    imprimir(){
        this._guiaService.ImpimirGuiaDetalle(
            { gui_id:this.idguia, men_id:this.frmEditar.controls['Mansajero'].value },
            gendata=>{ 
                this._downloadService.token(
                    {id:0,tipo:9},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading=false;
                        }else{
                            this.loading=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+9+"&extra="+gendata.archivo;
                            url = url;
                            window.open(url);
                        }
                    },
                    error=>{              
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        this.loading=false;
                    }
                );
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
    /*alerta*/
    hiddenalertDocumentos(){ }
    Aceptar_alertDocumentos(){ 
        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        alertaSonidoControl.loop = false; alertaSonidoControl.pause(); 
        this.alertDocumentos.hide();
        this.msgagregardocumento='';
        this.msgagregardocumentoestado='';
        if(this.buscarCodigBarraOnline){
        this.frmAgregarRemover.controls['codigoBarraAutomatico'].enable();
        console.log("control = ", this.control);
        this.control.value='';
        this.control.focus();}
    }
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje; }
}