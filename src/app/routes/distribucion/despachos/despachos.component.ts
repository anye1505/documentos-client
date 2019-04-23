import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { GuiaEstadoService } from '../../../services/guia-estado.service';
import { GuiaDespachoEstadoService } from '../../../services/guia-despacho-estado.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SucursalService } from '../../../services/sucursal.service';
import { GuiaDespachoService } from '../../../services/guia-despacho.service';
import { DownloadService } from '../../../services/download.service';

@Component({
    selector: 'despachos',
    templateUrl: './despachos.component.html'
})
export class DespachosComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public loading2:boolean = false; //disable detail excel button
    public loading3:boolean = false; //disable excel button
    public sucloading:boolean = true; //it shows when courier dropdown is loading
    public formLoading:boolean = false;
    public processRest;
    public panelBusqSeleccionado: number = 0;
    valfrmbusqmultiple: FormGroup;
    valfrmbusqguia: FormGroup;
    valfrmbusqos: FormGroup;
    listestadosguia:any = [];
    listoperadores:any = [];
    listmensajeros:any = [];
    listtransportistas:any = [];
    listsucursales:any = [];
    modelfrmbusqbasica: any = {
        Asignaciondesde: '',
        Asignacionhasta: '',
        EstadoGuia: '',
        Operador: '',
        Sucursal: '',
        //Mansajero: '',
        Transportista: ''
    };
    txtCodigoBarra: any;
    navigator: any = navigator;
    listImpdetalle:any = [];
    listImpPendientes:any = [];
    listImpNoPermitida:any = [];
    impFechaHora: string = '';

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
    @ViewChild('ppBsqGuiaxCodigo') ppBsqGuiaxCodigo: ModalDirective;

    constructor(
        fb: FormBuilder,
        private router: Router,
        private _estadoguiasvc: GuiaEstadoService,
        private _estadoguiadepachosvc: GuiaDespachoEstadoService,
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _userService: UserService,
        private _authService: AuthService,
        private _sucursalService: SucursalService,
        private _guiaDespachoService: GuiaDespachoService,
        private _downloadService:DownloadService
    ){
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        let fechadesde: Date = new Date();
        fechadesde.setDate(fechadesde.getDate() - 15);

        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.valfrmbusqmultiple = fb.group({
            //'Asignaciondesde': [fechadesde.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'Asignaciondesde': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'Asignacionhasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'EstadoGuia': ['',Validators.compose([])],
            'Operador': ['',Validators.compose([])],
            'Sucursal': ['',Validators.compose([])],
            //'Mansajero': ['',Validators.compose([])],
            'Transportista': ['',Validators.compose([])]
        });
        this.valfrmbusqguia = fb.group({  'txtNroGuia': ['',Validators.compose([])] });
        this.valfrmbusqos = fb.group({ 'txtNroOS': ['',Validators.compose([])] });        
        /*Recupero data para las los combos*/
        /*this._estadoguiasvc.find({},
            data=>{ this.listestadosguia=data; },
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );*/        
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
                /*this._empresaService.mensajero(
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
                );*/
                
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
                this.valfrmbusqmultiple.controls['EstadoGuia'].setValue(1); // EN PROCESO
                if(sessionStorage.getItem('despachoBusqueda')!=undefined){
                    let dataBusqueda = JSON.parse(sessionStorage.getItem('despachoBusqueda'));
                    switch (dataBusqueda['busqueda']) {
                        case 0:
                        this.panelBusqSeleccionado=0;
                        this.valfrmbusqmultiple.controls['Asignaciondesde'].setValue(dataBusqueda['data']['Asignaciondesde']);
                        this.valfrmbusqmultiple.controls['Asignacionhasta'].setValue(dataBusqueda['data']['Asignacionhasta']);
                        this.valfrmbusqmultiple.controls['EstadoGuia'].setValue(dataBusqueda['data']['EstadoGuia']);
                        this.valfrmbusqmultiple.controls['Operador'].setValue(dataBusqueda['data']['Operador']);
                        this.valfrmbusqmultiple.controls['Sucursal'].setValue(dataBusqueda['data']['Sucursal']);
                        //this.valfrmbusqmultiple.controls['Mansajero'].setValue(dataBusqueda['data']['Mansajero']);
                        this.valfrmbusqmultiple.controls['Transportista'].setValue(dataBusqueda['data']['Transportista']);
                        this.fn_busquedamultiple();
                        /*if(dataBusqueda['data']['EstadoGuia'] == null || dataBusqueda['data']['EstadoGuia'] == ''){
                            this.valfrmbusqmultiple.controls['EstadoGuia'].setValue(1);
                        }*/
                        break;
                        case 1:
                        this.panelBusqSeleccionado=1;
                        this.valfrmbusqguia.controls['txtNroGuia'].setValue(dataBusqueda['data']['txtNroGuia']);
                        this.fn_busquedaguia(); 
                        break;
                        case 2:
                        this.panelBusqSeleccionado=2 ;
                        this.valfrmbusqos.controls['txtNroOS'].setValue(dataBusqueda['data']['txtNroOS']);
                        this.fn_busquedaos(); 
                        break;
                        default:
                            break;
                    }   
                }// else { this.fn_busquedamultiple(); }
                this.sucloading = true;
                this._sucursalService.sucursalseleccionada(
                    { 
                        'desde': this.valfrmbusqmultiple.controls['Asignaciondesde'].value,
                        'hasta': this.valfrmbusqmultiple.controls['Asignacionhasta'].value 
                    },
                    data=>{ this.listsucursales = data; this.sucloading = false;},
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
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );
        this.txtCodigoBarra = '';
    }
    ngOnInit(){
        
    }
    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
    }
    fn_guardacriteriobusqueda(){
        let data = {
            busqueda:this.panelBusqSeleccionado,
            data: [] 
        };
        if(this.panelBusqSeleccionado==0){
            data.data = this.valfrmbusqmultiple.value;
        } else if(this.panelBusqSeleccionado==1) {
            data.data = this.valfrmbusqguia.value;
        } else if(this.panelBusqSeleccionado==2) {
            data.data = this.valfrmbusqos.value;
        } 
        sessionStorage.setItem('despachoBusqueda', JSON.stringify(data));
    }
    //Form
    fn_busquedamultiple(ppage:number=0){
        this.fn_guardacriteriobusqueda();
        this.updateRows(1, { 
            fecha_desde:this.valfrmbusqmultiple.controls['Asignaciondesde'].value, 
            fecha_hasta:this.valfrmbusqmultiple.controls['Asignacionhasta'].value, 
            gde_id:(this.valfrmbusqmultiple.controls['EstadoGuia'].value == null || this.valfrmbusqmultiple.controls['EstadoGuia'].value == '' ? 0 : this.valfrmbusqmultiple.controls['EstadoGuia'].value), 
            emp_id_operador:(this.valfrmbusqmultiple.controls['Operador'].value == null || this.valfrmbusqmultiple.controls['Operador'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Operador'].value), 
            suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
            //men_id:(this.valfrmbusqmultiple.controls['Mansajero'].value == null || this.valfrmbusqmultiple.controls['Mansajero'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Mansajero'].value), 
            transportista_id:(this.valfrmbusqmultiple.controls['Transportista'].value == null || this.valfrmbusqmultiple.controls['Transportista'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Transportista'].value),
            ordenado_por:'gud_id desc',
            desde_fila:( this.limit * ppage),
            limite_filas:this.limit
        });
    }
    fn_busquedaguia(){
        this.fn_guardacriteriobusqueda();  
        this.updateRows(2, {
            gud_numero: this.valfrmbusqguia.controls['txtNroGuia'].value
        });
    }
    fn_busquedaos(){
        this.fn_guardacriteriobusqueda();
        this.updateRows(3, {
            nro_orden_courier: this.valfrmbusqos.controls['txtNroOS'].value
        });
    }
    frmBusquedaMultiple_submit($ev, value: any) {
        //this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valfrmbusqmultiple.controls) {
            this.valfrmbusqmultiple.controls[c].markAsTouched();
        }
        if (this.valfrmbusqmultiple.valid) {   
            this.fn_busquedamultiple();
        }else{
            this.formLoading = false;
        }
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
        }
    }
    frmBusquedaOS_submit($ev, value: any) {
        //this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valfrmbusqos.controls) {
            this.valfrmbusqos.controls[c].markAsTouched();
        }
        if (this.valfrmbusqos.valid) {   
            this.fn_busquedaos();
        }else{
            this.formLoading = false;
        }
    }
    updateRows(ptipo: number, pdata){
        this.loading=true;
        this.count = 0;
        switch (ptipo) {
            case 1:
                this._guiaDespachoService.consultaMultiple(
                    pdata,
                    data=>{
                        this.loading=false;
                        this.rows = data;
                        this.rows = [...this.rows];
                        if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                        else { this.count = data[0]['nro_guias']; }
                        //this.count = data.length;
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
                this._guiaDespachoService.consultaNumero(
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
                this._guiaDespachoService.consultaOrden(
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

    //eventos Grilla
    editar(row) {
        this.router.navigate(['/distribucion/editarguiadespacho', row['gud_id']]);
    }
    imprimir(row){
        //row['gui_id']
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
    //eventos formulario
    btnNuevo_click(sender){
        this.router.navigate(['/distribucion/editarguiadespacho']);
    }
    btnExportarDetallado_click(sender){
        let fecha1 = new Date(this.valfrmbusqmultiple.controls['Asignaciondesde'].value);
        let fecha2 = new Date(this.valfrmbusqmultiple.controls['Asignacionhasta'].value);
        let diasDif = fecha2.getTime() - fecha1.getTime();
        let dias = Math.round(diasDif/(1000 * 60 * 60 * 24));
        //console.log("dias:",dias);
        if( dias < 31){
            this.loading2=true;
            this._guiaDespachoService.exportarListaGuiasDetalle(
                {
                    fecha_desde:(this.valfrmbusqmultiple.controls['Asignaciondesde'].value == '' ? '' : this.valfrmbusqmultiple.controls['Asignaciondesde'].value), 
                    fecha_hasta:(this.valfrmbusqmultiple.controls['Asignacionhasta'].value == '' ? '' : this.valfrmbusqmultiple.controls['Asignacionhasta'].value),
                    gde_id:(this.valfrmbusqmultiple.controls['EstadoGuia'].value == '' || !this.valfrmbusqmultiple.controls['EstadoGuia'].value ? 0 : this.valfrmbusqmultiple.controls['EstadoGuia'].value),
                    emp_id_operador:(this.valfrmbusqmultiple.controls['Operador'].value == null || this.valfrmbusqmultiple.controls['Operador'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Operador'].value), 
                    suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value),
                    tra_id:(this.valfrmbusqmultiple.controls['Transportista'].value == null || this.valfrmbusqmultiple.controls['Transportista'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Transportista'].value)
                    
                },
                gendata=>{ 
                    this._downloadService.token(
                        {id:0,tipo:15},
                        data=>{console.log("dataexc:",data);
                            if(data.des_token_validation.length < 1){
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                this.loading2=false;
                            }else{
                                this.loading2=false;
                                /*console.log("url",this._downloadService.url({
                                    token:data.des_token_validation,
                                    tipo:15,
                                    extra:gendata.archivo
                                }))*/
                                let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+15+"&extra="+gendata.archivo;
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
        }else{
            this.showMessage('warning', 'El rango de fechas no debe ser mayor a 30 días', '');
        }               
    }
    btnExportar_click(sender){
        this.loading3=true;
        this._guiaDespachoService.exportarListaGuias(
            {
                fecha_desde:(this.valfrmbusqmultiple.controls['Asignaciondesde'].value == '' ? '' : this.valfrmbusqmultiple.controls['Asignaciondesde'].value), 
                fecha_hasta:(this.valfrmbusqmultiple.controls['Asignacionhasta'].value == '' ? '' : this.valfrmbusqmultiple.controls['Asignacionhasta'].value), 
                gde_id:(this.valfrmbusqmultiple.controls['EstadoGuia'].value == '' || !this.valfrmbusqmultiple.controls['EstadoGuia'].value ? 0 : this.valfrmbusqmultiple.controls['EstadoGuia'].value), 
                emp_id_operador:(this.valfrmbusqmultiple.controls['Operador'].value == null || this.valfrmbusqmultiple.controls['Operador'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Operador'].value), 
                suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
                //men_id:(this.valfrmbusqmultiple.controls['Mansajero'].value == null || this.valfrmbusqmultiple.controls['Mansajero'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Mansajero'].value), 
                tra_id:(this.valfrmbusqmultiple.controls['Transportista'].value == null || this.valfrmbusqmultiple.controls['Transportista'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Transportista'].value)
            },
            gendata=>{ 
                this._downloadService.token(
                    {id:0,tipo:14},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading3=false;
                        }else{
                            this.loading3=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+14+"&extra="+gendata.archivo;
                            url = url;
                            window.open(url);
                        }
                    },
                    error=>{              
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        this.loading3=false;
                    }
                );
            },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading3=false;
            }
        );       
    }
    //tab 2
    btnBusqGuiaPorCodigoBarra_click(sender){
        this.ppBsqGuiaxCodigo.show();
    }
    btnPpAceptar_click(sender, bisinput:boolean=false){
        this.loading=true;
        let codigoBarra = (<HTMLInputElement>document.getElementById('txtCodigoBarra')).value;
        if(codigoBarra != '') {
            this._guiaDespachoService.consultaCodigoBarra(
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
    excelguia(row){
        this._guiaDespachoService.DescargarExcelGuia(
            { gui_id:row['gud_id']},
            gendata=>{
                this._downloadService.token(
                    {id:0,tipo:22},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading=false;
                        }else{
                            this.loading=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+22+"&extra="+gendata.archivo;
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
    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }
    }

    searchSuc(){
        this.sucloading = true;
        this._sucursalService.sucursalseleccionada(
            { 
                'desde': this.valfrmbusqmultiple.controls['Asignaciondesde'].value,
                'hasta': this.valfrmbusqmultiple.controls['Asignacionhasta'].value 
            },
            data=>{ this.listsucursales = data; console.log(data, this.listsucursales); this.sucloading = false;},
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
}