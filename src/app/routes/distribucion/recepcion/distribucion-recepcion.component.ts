import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { FileUploader } from 'ng2-file-upload';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

import { EmpresaService } from '../../../services/empresa.service';
import { DownloadService } from '../../../services/download.service';

import { GuiaDespachoEstadoService } from '../../../services/guia-despacho-estado.service';
import { SucursalService } from '../../../services/sucursal.service';
import { GuiaDespachoService } from '../../../services/guia-despacho.service';


import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'cargo',
    templateUrl: './distribucion-recepcion.component.html'
})
export class DistribucionRecepcionComponent implements OnInit {
    public loading:boolean = false;
    public loading1:boolean = false;
    public loading2:boolean = false;
	public formLoading:boolean = false;
    public processRest;
    public panelBusqSeleccionado: number = 0;
    public panelBusqSeleccionado2: number = 0;
    private sesion: any;
    public row:number;

    valfrmbusqmultiple: FormGroup;
    valfrmbusqguia: FormGroup;
    valfrmbusqos: FormGroup;
    frmRecepcion: FormGroup;

    listestadosguia:any = [];
    listoperadores:any = [];
    listsucursales:any = [];
    listtransportistas:any = [];
    msgagregardocumento: string = ''; 
    sucursal_id:number;
    max;
    editarGuia:boolean=false;

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

    public empresas:any[];

    public formFecha;
    public formOperador = 0;
    public uploader: FileUploader = new FileUploader({ 
        queueLimit: 1,
        url: GLOBAL.url+"ordenes/recepcionArchivo" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });

    @ViewChild('ppBsqGuiaxCodigo') ppBsqGuiaxCodigo: ModalDirective;
    @ViewChild('recepcionarModal') recepcionarModal: ModalDirective;
    @ViewChild('confirmarRecepcion') confirmarRecepcion: ModalDirective;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;
    @ViewChild('receplista') receplista: ModalDirective;

    constructor(
    	fb: FormBuilder,
        public toasterService: ToasterService,        
        public _empresaService:EmpresaService,
        private _downloadService:DownloadService,
        private _authService: AuthService,
        private _estadoguiadepachosvc: GuiaDespachoEstadoService,
        private _userService: UserService,
        private _sucursalService: SucursalService,
        private _guiaDespachoService: GuiaDespachoService
    ){
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.max = now.toISOString().substring(0, 10);
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        let fechadesde: Date = new Date();
        fechadesde.setDate(fechadesde.getDate() - 15);
        this.valfrmbusqmultiple = fb.group({
            //'Asignaciondesde': [fechadesde.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'Asignaciondesde': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'Asignacionhasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'EstadoGuia': ['',Validators.compose([])],
            'Operador': ['',Validators.compose([])],
            'Sucursal': ['',Validators.compose([])],
            'Transportista': ['',Validators.compose([])]
        });
        this.valfrmbusqguia = fb.group({  'txtNroGuia': ['',Validators.compose([Validators.required])] });
        this.valfrmbusqos = fb.group({ 'txtNroOS': ['',Validators.compose([Validators.required])] });
        this.frmRecepcion = fb.group({
            'fecharecepcion': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date,Validators.required])],
        });

        this._estadoguiadepachosvc.find({},
            data=>{ this.listestadosguia=data;  },
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );

        this._userService.find({ id : this.sesion.userId },
            data=>{ 
                this.sucursal_id = data['suc_id'];
                this._empresaService.operador(
                    { 'emp_id':data['emp_id'] },
                    data=>{ this.listoperadores = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                this._sucursalService.sucursalseleccionada(
                    {'suc_id': data['suc_id']},
                    //{ 'emp_id':data['emp_id'] },
                    data=>{ this.listsucursales = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                this._sucursalService.transportista(
                    { 'suc_id':data['suc_id'] },
                    data=>{ this.listtransportistas = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                this.valfrmbusqmultiple.controls['EstadoGuia'].setValue(2); // EN PROCESO
                if(sessionStorage.getItem('recepcionBusqueda')!=undefined){
                    let dataBusqueda = JSON.parse(sessionStorage.getItem('recepcionBusqueda'));
                    switch (dataBusqueda['busqueda']) {
                        case 0:
                        this.panelBusqSeleccionado2=0;
                        this.valfrmbusqmultiple.controls['Asignaciondesde'].setValue(dataBusqueda['data']['Asignaciondesde']);
                        this.valfrmbusqmultiple.controls['Asignacionhasta'].setValue(dataBusqueda['data']['Asignacionhasta']);
                        this.valfrmbusqmultiple.controls['EstadoGuia'].setValue(dataBusqueda['data']['EstadoGuia']);
                        this.valfrmbusqmultiple.controls['Operador'].setValue(0);
                        this.valfrmbusqmultiple.controls['Sucursal'].setValue(dataBusqueda['data']['Sucursal']);
                        //this.valfrmbusqmultiple.controls['Mansajero'].setValue(dataBusqueda['data']['Mansajero']);
                        this.valfrmbusqmultiple.controls['Transportista'].setValue(dataBusqueda['data']['Transportista']);
                        
                        /*if(dataBusqueda['data']['EstadoGuia'] == null || dataBusqueda['data']['EstadoGuia'] == ''){
                            this.valfrmbusqmultiple.controls['EstadoGuia'].setValue(1);
                        }*/
                        //console.log(this.valfrmbusqmultiple.controls['EstadoGuia'].value);
                        this.fn_busquedamultiple(); 
                        break;
                        case 1:
                        this.panelBusqSeleccionado2=1;
                        this.valfrmbusqguia.controls['txtNroGuia'].setValue(dataBusqueda['data']['txtNroGuia']);
                        //this.fn_busquedaguia(); 
                        break;
                        case 2:
                        this.panelBusqSeleccionado2=2 ;
                        this.valfrmbusqos.controls['txtNroOS'].setValue(dataBusqueda['data']['txtNroOS']);
                        //this.fn_busquedaos(); 
                        break;
                        default:
                            break;
                    }   
                } else { this.fn_busquedamultiple(); }
            },
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );

        this.formFecha = now.toISOString().substring(0, 10);
        this._empresaService.operador(
            {},
            data=>{
                this.empresas = data;
            
                this.empresas.map(function(value,index){
                    if(value.emp_id === 2){
                        data.splice(index,1);
                    }
                })
                this.empresas = data;
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

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            if(this.formFecha > this.max){
                this.showMessage('warning', 'La fecha no puede ser mayor a la fecha actual', '');
            }else{
                /*if(this.formOperador!="" && this.formOperador!=null){
                    this.formLoading = true;      */
                    form.append('operador', this.formOperador);
                    form.append('fecharecep', this.formFecha);
                /*}else{
                    this.showMessage('warning', 'Seleccionar operador', '');
                    this.uploader[0].cancel();      
                    return false;                      
                }*/
            }
        };
        this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
            this.formLoading = false;
            item.remove();
            this.showMessage('success', 'Se ha cargado la base', '');
            if(response) { //parse your response. 
                response = JSON.parse(response);
                if(response.archivo){
                    var r = confirm("Desea descargar observación y SIM?");
                    if (r == true) {
                         this._downloadService.token(
                            {id:0,tipo:6},
                            data=>{
                                if(data.des_token_validation.length < 1){
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                    this.loading=false;
                                }else{
                                    this.loading=false;
                                    let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+6+"&extra="+response.archivo;
                                    url = url;
                                    window.open(url);
                                }
                            },
                            error=>{              
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                this.loading=false;
                            }
                        );
                         this._downloadService.token(
                            {id:0,tipo:7},
                            data=>{
                                if(data.des_token_validation.length < 1){
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                    this.loading=false;
                                }else{
                                    this.loading=false;
                                    let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+7+"&extra="+response.archivo;
                                    url = url;
                                    window.open(url);
                                }
                            },
                            error=>{              
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                this.loading=false;
                            }
                        );
                    } 
                }
            }
        }
        this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => {
            if(response){
                response = JSON.parse(response);                
                if(status ===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else if(response.error){
                    if(response.error.statusCode ==400){
                        this.showMessage('warning', 'Alguno de los datos que ingresó no es válido', '');
                    }else{
                        this.showMessage('warning', response.error.message, '');
                    }               
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
            this.formLoading = false;
            
        }

    }
    ngOnDestroy(){
        if(this.processRest!=null){
            this.processRest.$abortRequest();
        }     
    }

    cancelUpload(item,remove){
        this.showMessage('warning','Carga fue cancelada','');
        if(remove){
            item.remove();    
        }else{
            item.cancel();
        }
        
        this.formLoading =false;
    }

	ngOnInit() {

    }

    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
    }

    seleccionatab2(idpanel){
        this.panelBusqSeleccionado2 = idpanel;
    }

    frmBusquedaMultiple_submit($ev, value: any) {
        $ev.preventDefault();
        for (let c in this.valfrmbusqmultiple.controls) {
            this.valfrmbusqmultiple.controls[c].markAsTouched();
        }
        if (this.valfrmbusqmultiple.valid) {   
            this.fn_busquedamultiple();
        }else{
            this.formLoading = false;
            this.showMessage('warning', 'Debe completar los campos obligatorios', '');
        }
    }

    fn_busquedamultiple(ppage:number=0){
        this.fn_guardacriteriobusqueda();
        this.updateRows(1, { 
            fecha_desde:this.valfrmbusqmultiple.controls['Asignaciondesde'].value, 
            fecha_hasta:this.valfrmbusqmultiple.controls['Asignacionhasta'].value, 
            gde_id:(this.valfrmbusqmultiple.controls['EstadoGuia'].value == null || this.valfrmbusqmultiple.controls['EstadoGuia'].value == '' || !this.valfrmbusqmultiple.controls['EstadoGuia'].value ? 0 : this.valfrmbusqmultiple.controls['EstadoGuia'].value), 
            emp_id_operador:0, 
            suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
            transportista_id:(this.valfrmbusqmultiple.controls['Transportista'].value == null || this.valfrmbusqmultiple.controls['Transportista'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Transportista'].value),
            ordenado_por:'gud_id desc',
            desde_fila:( this.limit * ppage),
            limite_filas:this.limit
        });
    }

    fn_busquedaguia(){
        this.fn_guardacriteriobusqueda();  
        this.updateRows(2, {
            gud_numero: this.valfrmbusqguia.controls['txtNroGuia'].value,
            suc_id: this.sucursal_id
        });
    }

    fn_busquedaos(){
        this.fn_guardacriteriobusqueda();
        this.updateRows(3, {
            nro_orden_courier: this.valfrmbusqos.controls['txtNroOS'].value,
            suc_id: this.sucursal_id
        });
    }

    fn_guardacriteriobusqueda(){
        let data = {
            busqueda:this.panelBusqSeleccionado2,
            data: [] 
        };
        if(this.panelBusqSeleccionado2==0){
            data.data = this.valfrmbusqmultiple.value;
        } else if(this.panelBusqSeleccionado2==1) {
            data.data = this.valfrmbusqguia.value;
        } else if(this.panelBusqSeleccionado2==2) {
            data.data = this.valfrmbusqos.value;
        } 
        sessionStorage.setItem('recepcionBusqueda', JSON.stringify(data));
    }

    updateRows(ptipo: number, pdata){
        this.loading=true;
        this.count = 0;
        switch (ptipo) {
            case 1:
                this._guiaDespachoService.consultaMultipleRecep(
                    pdata,
                    data=>{ 
                        this.loading=false;
                        this.rows = data;
                        this.rows = [...this.rows];
                        for(let ind = 0; ind<this.rows.length; ind++){
                            if(this.rows[ind].estado === 'RECIBIDO'){
                                this.editarGuia = false;
                            }else{
                                this.editarGuia = true;
                            }
                        }
                        if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                        else { this.count = data.length; }
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
                break;
            case 2:
                this._guiaDespachoService.consultaNumeroRecep(
                    pdata,
                    data=>{ 
                        this.count = data.length;
                        this.loading=false;
                        this.rows = data; 
                        this.rows = [...this.rows];
                        if(this.count==0){ this.showMessage('info', 'No se encontraron datos', ''); }
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
                break;
            case 3:
                this._guiaDespachoService.consultaOrdenRecep(
                    pdata,
                    data=>{ 
                        this.count = data.length;
                        this.loading=false;
                        this.rows = data;
                        this.rows = [...this.rows];
                        if(this.count==0){ this.showMessage('info', 'No se encontraron datos', ''); }
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
                break;
            default:
                break;
        }
        
    }

    //grilla
    onPage(event){ 
        switch (this.panelBusqSeleccionado) {
            case 0:
                this.fn_busquedamultiple(event.offset); break;
            case 1:
                this.fn_busquedaguia(); break;
            case 2:
                this.fn_busquedaos(); break;
            default:
                break;
        }
    }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {  }

    allCheckbox(event){  }
    onCheckboxChangeFn(event,row){  }

    btnPpAceptar_click(sender, bisinput:boolean=false){
        this.loading=true;
        let codigoBarra = (<HTMLInputElement>document.getElementById('txtCodigoBarra')).value;
        if(codigoBarra != '') {
            this._guiaDespachoService.consultaCodigoBarraRecep(
                {
                    codigo_barra: codigoBarra
                },
                data=>{ 
                    this.loading=false;
                    if(data[0]['error'] == true){
                        this.showMessage('error', data[0]['mensaje'], '');
                    } else {
                        this.valfrmbusqguia.controls['txtNroGuia'].setValue(data[0]['mensaje']);
                        (<HTMLInputElement>document.getElementById('txtCodigoBarra')).value = '';
                        this.ppBsqGuiaxCodigo.hide();
                        this.frmBusquedaGuia_buscar(sender, this.valfrmbusqguia.value);
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
        } else { this.loading=false; if(!bisinput){ this.showMessage('warning', 'No se indico el codigo de barra a buscar', '');} }
    }

    frmBusquedaGuia_submit(sender, value: any) {
        sender.preventDefault();
        this.frmBusquedaGuia_buscar(sender, value);
    }

    frmBusquedaGuia_buscar(sender, value: any) {
        for (let c in this.valfrmbusqguia.controls) {
            this.valfrmbusqguia.controls[c].markAsTouched();
        }
        if (this.valfrmbusqguia.valid) { 
            this.fn_busquedaguia();
        }else{
            this.formLoading = false;
            this.showMessage('warning', 'No se indico el número de guía a buscar', '');
        }
    }

    frmBusquedaOS_submit($ev, value: any) {
        $ev.preventDefault();
        for (let c in this.valfrmbusqos.controls) {
            this.valfrmbusqos.controls[c].markAsTouched();
        }
        if (this.valfrmbusqos.valid) {   
            this.fn_busquedaos();
        }else{
            this.showMessage('warning', 'No se indico la orden de servicio a buscar', '');
            this.formLoading = false;
        }
    }

    btnExportarDetallado_click(sender){
        let fecha1 = new Date(this.valfrmbusqmultiple.controls['Asignaciondesde'].value);
        let fecha2 = new Date(this.valfrmbusqmultiple.controls['Asignacionhasta'].value);
        let diasDif = fecha2.getTime() - fecha1.getTime();
        let dias = Math.round(diasDif/(1000 * 60 * 60 * 24));
        //console.log("dias:",dias);
        if( dias < 31){
            this.loading1 = true;
            this._guiaDespachoService.exportarListaGuiasDetalleRecep(
                {
                    fecha_desde:this.valfrmbusqmultiple.controls['Asignaciondesde'].value, 
                    fecha_hasta:this.valfrmbusqmultiple.controls['Asignacionhasta'].value,
                    gde_id:(this.valfrmbusqmultiple.controls['EstadoGuia'].value == '' || !this.valfrmbusqmultiple.controls['EstadoGuia'].value ? 0 : this.valfrmbusqmultiple.controls['EstadoGuia'].value),
                    emp_id_operador:0, 
                    suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value),
                    tra_id:(this.valfrmbusqmultiple.controls['Transportista'].value == null || this.valfrmbusqmultiple.controls['Transportista'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Transportista'].value)
                    
                },
                gendata=>{ 
                    this._downloadService.token(
                        {id:0,tipo:18},
                        data=>{
                            if(data.des_token_validation.length < 1){
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                this.loading1=false;
                            }else{
                                this.loading1=false;
                                let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+18+"&extra="+gendata.archivo;
                                url = url;
                                window.open(url);
                            }
                        },
                        error=>{              
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading1=false;
                        }
                    );
                },
                error=>{                
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading1=false;
                }
            );
        }else{
            this.showMessage('warning', 'El rango de fechas no debe ser mayor a 30 días', '');
        }
    }
    btnExportar_click(sender){
        this.loading2 = true;
        this._guiaDespachoService.exportarListaGuiasRecep(
            {
                fecha_desde:this.valfrmbusqmultiple.controls['Asignaciondesde'].value, 
                fecha_hasta:this.valfrmbusqmultiple.controls['Asignacionhasta'].value, 
                gde_id:(this.valfrmbusqmultiple.controls['EstadoGuia'].value == '' || !this.valfrmbusqmultiple.controls['EstadoGuia'].value ? 0 : this.valfrmbusqmultiple.controls['EstadoGuia'].value), 
                emp_id_operador:0, 
                suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
                //men_id:(this.valfrmbusqmultiple.controls['Mansajero'].value == null || this.valfrmbusqmultiple.controls['Mansajero'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Mansajero'].value), 
                tra_id:(this.valfrmbusqmultiple.controls['Transportista'].value == null || this.valfrmbusqmultiple.controls['Transportista'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Transportista'].value)
            },
            gendata=>{ 
                this._downloadService.token(
                    {id:0,tipo:17},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading2=false;
                        }else{
                            this.loading2=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+17+"&extra="+gendata.archivo;
                            url = url;
                            window.open(url);
                        }
                    },
                    error=>{              
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        this.loading2=false;
                    }
                );
            },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading2=false;
            }
        );       
    }

    btnBusqGuiaPorCodigoBarra_click(sender){
        this.ppBsqGuiaxCodigo.show();
    }

    editar(row) {
        this.row = row['gud_id'];
        this.recepcionarModal.show();
        //this.router.navigate(['/distribucion/editarguiadespacho', row['gud_id']]);
    }

    recepcionar(alertaSonido:HTMLAudioElement) {
        this.msgagregardocumento = '';
        this._guiaDespachoService.recepcionar({
            guia_id:this.row,
            fecha:this.frmRecepcion.controls['fecharecepcion'].value
        },
        data=>{
            this.msgagregardocumento = '';
            console.log("data recepcionar: ",data);
            this.msgagregardocumento = data[0]['mensaje'];
            if(data[0]['error']){
                alertaSonido.play(); alertaSonido.loop = true;
                this.mostrar_error_alerta(this.msgagregardocumento);
            }else{
                if(this.msgagregardocumento != ''){
                    this.showMessage('success', this.msgagregardocumento, '');                  
                    //this.modalAsignar.hide();
                    this.msgagregardocumento = '';
                }
                this.confirmarRecepcion.hide();
                this.recepcionarModal.hide();                
            }
            this.fn_busquedamultiple();
        },
        error=>{   
            console.log("error: ",error);           
            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            this.loading=false;
        });
        //this.recepcionarModal.show();
    }

    btnNuevo_click(sender){
        if (this.frmRecepcion.valid == false) {  
            this.formLoading = false;
            this.showMessage('error', 'Debe completar la información necesaria', '');
        }else{
            //this.recepcionarModal.hide();
            if(this.frmRecepcion.controls['fecharecepcion'].value > this.max){
                this.showMessage('warning', 'La fecha no puede ser mayor a la fecha actual', '');
            }else{
                this.confirmarRecepcion.show();
            }
        }
    }

    imprimir(row){
        this._guiaDespachoService.ImpimirGuiaDetalle(
            { gud_id:row['gud_id'], suc_id:row['suc_id'] },
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

    hiddenRecepcionar(){}

    hiddenalertDocumentos(){ }
    Aceptar_alertDocumentos(){ 
        let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
        alertaSonidoControl.loop = false; alertaSonidoControl.pause(); 
        this.alertDocumentos.hide();
        this.confirmarRecepcion.hide();
        this.recepcionarModal.hide();
        this.formLoading = false;
    }
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje;this.formLoading = false;this.loading = false; }


    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }

    receporlista(){
        this.receplista.show();
    }
}