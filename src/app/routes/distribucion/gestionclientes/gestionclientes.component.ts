import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DownloadService } from '../../../services/download.service';

import { GLOBAL } from '../../../global';

import { Empresa } from '../../../models/empresa';

import { OrdenService } from '../../../services/orden.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ProductoService } from '../../../services/producto.service';
import { OrdenEstadoService } from '../../../services/orden-estado.service';
import { GestionClientesService } from '../../../services/gestion-clientes.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { SucursalService } from '../../../services/sucursal.service';

declare var $: any;

@Component({
    selector: 'gestionclientes',
    templateUrl:'./gestionclientes.component.html'
})

export class GestionClientesComponent implements OnInit {

    valFormSearch: FormGroup;

    public empresas:Empresa[];
    public toasActive;
    private sesion: any;
    public panelBusqSeleccionado: number = -1;

    orden: FormGroup;
    listclientes:any = [];
    listsucursales:any = [];
    clientesTotal:any = [];
    listestados:any = [];
    listproductos:any = [];
    listregional:any = [];
    listcourier:any = [];
    selectedOS:any = [];
    checkedOS:any = [];
    parameters:any = {};
    courier;
    click:boolean = false;
    corte:boolean = false;
    permiso:boolean = false;
    checksnivel1 = {
        selected: []
    }
    tiposreg = [{id:1,nombre:'Distribución'},{id:2,nombre:'Cliente'}];
    tiposProd: any = [{prd_tipo:'DOCUMENTO'},{prd_tipo:'VALORADO'}];
    tipostxt = [{id:1,nombre:'Exportar txt'},{id:2,nombre:'Exportar txt con ruta imagen'}]
    listordenes = [];
    expanded: any = {};
    suc_id

    /*Grilla*/
    columns=[];
    rows=[];
    limit=200;
    count=0;
    order:string;
    selected = [];

    formLoading:boolean;
    loading:boolean;
    loading1:boolean=false;
    loading2:boolean=false;
    loading3:boolean=false;
    loading4:boolean=false;
    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true,
        timeout: 0
    });

    @ViewChild('detailTable') detailTable: any;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;
    @ViewChild('detailModal') detailModal: ModalDirective;
    @ViewChild('toggelExpand') toggelExpand: ElementRef;

    constructor(
        fb: FormBuilder,
        private router: Router,    	
        public toasterService: ToasterService,
        public _ordenService:OrdenService,
        public _empresaService:EmpresaService,
        public _productoService:ProductoService,
        public _ordenEstadoService:OrdenEstadoService,
        public _gestionClientesService:GestionClientesService,
        private _downloadService:DownloadService,
        private _authService:AuthService,
        private _userService:UserService,
        private _sucursalService:SucursalService
    ) {
        this.sesion = this._authService.getIdentity();
        let now = new Date();
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        let user_id = this._authService.getIdentity().userId;
        let emp_id = this._authService.getIdentity().emp_id;
        this.suc_id = this._authService.getIdentity().suc_id;
        //console.log("now:",now);console.log("now:",now.toISOString());console.log("now:",now.toString());
        
        this.valFormSearch = fb.group({
            'desde': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'hasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'corte': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'tiposProd': ['',Validators.compose([])],
            'cliente': [[],Validators.compose([])],
            'producto': [[],Validators.compose([])],
            'operador': [2,Validators.compose([Validators.required])],
            'tipo': ['',Validators.compose([Validators.required])],
            'ordenes': [[],Validators.compose([])],
            'Opcion': [''],
            'sucursal': [this.suc_id,Validators.compose([Validators.required])],
            'regional': [[],Validators.compose([])],
            'courier': [[],Validators.compose([])]
        });

        this.orden = fb.group({
            'ordenes': ['',Validators.compose([Validators.required])],
            'tipo': [1,Validators.compose([Validators.required])],
            'sucursal': [this.suc_id,Validators.compose([Validators.required])]
        });
        //console.log("sucs:",this.valFormSearch.controls['sucursal'].value);

        /*this._userService.find({ id : user_id },
            data=>{
                this.courier = data['emp_id'];
            },
            error=>{
            }
        );   */     
        /*this._userService.getroles( //POST
            {},
            data=>{
                let perm = [];
                for(let i=0;i<data.length;i++){
                    perm.push(data[i].name);
                }
                if(perm.indexOf('administrador') != -1 || perm.indexOf('ejecutivo') != -1){
                    this.permiso = true;
                }
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para obtener los permisos', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );*/
        this._userService.roles( //GET
            {filter:{include:"role",where:{principalId:user_id}}},
            data=>{
                let perm = [];
                for(let i=0;i<data.length;i++){
                    perm.push(data[i]["role"].name);
                }
                if(perm.indexOf('administrador') != -1 || perm.indexOf('ejecutivo') != -1){
                    this.permiso = true;
                }
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para obtener los permisos', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );

        this._empresaService.operador(
            {},
            data=>{
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

        this._empresaService.cliente(
            {},
            data=>{
                this.clientesTotal=data;
                this.searchCliente({emp_id:this.valFormSearch.controls['operador'].value});
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
        this._ordenEstadoService.find(
            {
                filter: {
                    where: {
                        ode_id: {
                            between: [10,12]
                        }
                    }
                }
            },
            data=>{
                this.listestados = data;
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;                
        });

        this._sucursalService.query(
            {filter:{where:{emp_id:emp_id}}},
            data=>{
                this.listsucursales = data;
                //console.log("sucs:",this.listsucursales);
            },
            error=>{}
        );

        this._gestionClientesService.regional(
            {},
            data=>{
                this.listregional = data;
                console.log("reg:",this.listregional);
            },
            error=>{}
        );

        this._empresaService.courier(
            {},
            data=>{
                this.listcourier = data;
                console.log("cou:",this.listcourier);
            },
            error=>{}
        );
        
        switch (this.panelBusqSeleccionado) {
            case -1:
            this.panelBusqSeleccionado=-1;
            if(sessionStorage.getItem('gestionclientes')!=undefined){
                let dataBusqueda = JSON.parse(sessionStorage.getItem('gestionclientes'));
                this.valFormSearch.controls['desde'].setValue(dataBusqueda['data']['desde']);
                this.valFormSearch.controls['hasta'].setValue(dataBusqueda['data']['hasta']);
                this.valFormSearch.controls['corte'].setValue(dataBusqueda['data']['corte']);
                this.valFormSearch.controls['operador'].setValue(dataBusqueda['data']['operador']);
                this.valFormSearch.controls['tipo'].setValue(dataBusqueda['data']['tipo']);
                this.valFormSearch.controls['sucursal'].setValue(this.suc_id);
                this.valFormSearch.controls['regional'].setValue([]);
                this.valFormSearch.controls['courier'].setValue([]);
            }
            this.busqueda();
            this.searchCliente({emp_id:this.valFormSearch.controls['operador'].value});
            break;
            case 0:
            this.panelBusqSeleccionado=0;
            this.orden.controls['ordenes'].setValue('');
            this.orden.controls['tipo'].setValue(1);
            this.orden.controls['sucursal'].setValue(this.suc_id);
            break;
            default:
                break;
        }
    }
    ngOnInit() {
        var opc = (<HTMLInputElement>document.getElementById('opcion1'));
        opc.checked = true;
        this.corte = false;
        this.Opcion_click(opc.value);
    }

    busqueda(){
        this.fn_guardacriteriobusqueda();
        let fecha_corte;
        if(this.corte){
            fecha_corte = this.valFormSearch.controls['corte'].value;
        }else{
            fecha_corte = '';
        }
        if(this.panelBusqSeleccionado === -1){
            this.updateRows({ 
                desde:this.valFormSearch.controls['desde'].value, 
                hasta:this.valFormSearch.controls['hasta'].value, 
                ope:(this.valFormSearch.controls['operador'].value == null || this.valFormSearch.controls['operador'].value == '' ? 2 : this.valFormSearch.controls['operador'].value),
                cli: (this.valFormSearch.controls['cliente'].value == null || this.valFormSearch.controls['cliente'].value.length == 0 ? '' : this.valFormSearch.controls['cliente'].value.join()),
                pro:(this.valFormSearch.controls['producto'].value == null || this.valFormSearch.controls['producto'].value.length == 0 ? '' : this.valFormSearch.controls['producto'].value.join()), 
                tiposProd:(this.valFormSearch.controls['tiposProd'].value == null || this.valFormSearch.controls['tiposProd'].value == '' ? '' : this.valFormSearch.controls['tiposProd'].value), 
                corte:fecha_corte,
                tipo:(this.valFormSearch.controls['tipo'].value == null || this.valFormSearch.controls['tipo'].value == '' ? 1 : this.valFormSearch.controls['tipo'].value), 
                ordenes: (this.valFormSearch.controls['ordenes'].value == null || this.valFormSearch.controls['ordenes'].value.length == 0 ? '' : this.valFormSearch.controls['ordenes'].value.join()),
                suc_id:(this.valFormSearch.controls['sucursal'].value == null || this.valFormSearch.controls['sucursal'].value == '' ? this.suc_id : this.valFormSearch.controls['sucursal'].value),
                reg_id: (this.valFormSearch.controls['regional'].value == null || this.valFormSearch.controls['regional'].value.length == 0 ? '' : this.valFormSearch.controls['regional'].value.join()),
                courier_id: (this.valFormSearch.controls['courier'].value == null || this.valFormSearch.controls['courier'].value.length == 0 ? '' : this.valFormSearch.controls['courier'].value.join())
            });
        }else{
            this.updateRows({
                ordenes: (this.orden.controls['ordenes'].value == null || this.orden.controls['ordenes'].value.length == '' ? '' : this.orden.controls['ordenes'].value),
                tipo:(this.orden.controls['tipo'].value == null || this.orden.controls['tipo'].value == '' ? 1 : this.orden.controls['tipo'].value),
                suc_id:(this.orden.controls['sucursal'].value == null || this.orden.controls['sucursal'].value == '' ? this.suc_id : this.orden.controls['sucursal'].value)
            });
        }
    }

    fn_guardacriteriobusqueda(){
        let data = {
            data: [] 
        };
        let now = new Date();//console.log("log data=",this.valFormSearch.value);
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        if(this.valFormSearch.value.desde){
            this.valFormSearch.controls['corte'].setValue(now.toISOString().substring(0, 10));
        }else{       
            this.valFormSearch.controls['desde'].setValue(now.toISOString().substring(0, 10));
            this.valFormSearch.controls['hasta'].setValue(now.toISOString().substring(0, 10));        
        }
        data.data = this.valFormSearch.value;
        sessionStorage.setItem('gestionclientes', JSON.stringify(data));
    }

    updateRows(data){
        this.loading=true;
        this.loading1=true;
        this.loading3=true;
        this.count = 0;
        if(this.panelBusqSeleccionado === -1){
            this._gestionClientesService.getordenes(
                data,
                data=>{//console.log("rows:",data,data.length);
                    this.loading=false;
                    this.loading1=false;
                    this.loading3=false;
                    this.rows = data; 
                    this.rows = [...this.rows];
                    if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                    if(data.length<201){ this.count = data.length; }
                    else{ this.count = 200; }
                    
                },
                error=>{                
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading=false;
                    this.loading1=false;
                    this.loading3=false;
                }
            );
        }else{
            this._gestionClientesService.getordeneslista(
                data,
                data=>{//console.log("rows:",data,data.length);
                    this.loading=false;
                    this.loading1=false;
                    this.loading3=false;
                    this.rows = data; 
                    this.rows = [...this.rows];
                    if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                    if(data.length<201){ this.count = data.length; }
                    else{ this.count = 200; }
                    
                },
                error=>{                
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading=false;
                    this.loading1=false;
                    this.loading3=false;
                }
            );
        }
    }

    busqueda_submit($event){
        this.formLoading = true;
        $event.preventDefault();
        if(this.panelBusqSeleccionado === -1){
            for (let c in this.valFormSearch.controls) {
                this.valFormSearch.controls[c].markAsTouched();
            }
            if(!this.permiso){
                this.valFormSearch.controls['tipo'].setValue(1);
            }
            if (this.valFormSearch.valid) {   
                this.busqueda();
            }else{
                this.formLoading = false;
            }
        }else{
            for (let c in this.orden.controls) {
                this.orden.controls[c].markAsTouched();
            }
            if(!this.permiso){
                this.orden.controls['tipo'].setValue(1);
            }
            if (this.orden.valid) {   
                this.busqueda();
            }else{
                this.formLoading = false;
            }
        }
        
    }

    searchCliente(event){//console.log("operador:",event);
        this.ordenes();
        
        if(event!=1){
            this.listclientes = [];
            this.listproductos = [];
            this.valFormSearch.controls['cliente'].setValue([]);
            this.valFormSearch.controls['producto'].setValue([]);
        
            if(event){
                this.listclientes = [];
                for(let i = 0;i<this.clientesTotal.length;i++){
                    if(this.clientesTotal[i].emp_id_operador == this.valFormSearch.controls['operador'].value){
                        this.listclientes.push({
                            cli_id:this.clientesTotal[i].cli_id,
                            emp_id:this.clientesTotal[i].emp_id,
                            emp_abrev:this.clientesTotal[i].emp_abrev
                        });
                    }
                }
            }else{
                this.listclientes = [];
            }
        }
    }

    searchProducto(event){//console.log("event=",event);
        this.ordenes();
        this.listproductos = [];
        this.valFormSearch.controls['producto'].setValue([]);
        if(event.length > 0){
            this.listproductos = [];
            let param={ order:'prd_id desc' };
            let where={}
            let array =[];
            for(let i = 0; i < event.length; i++){
                array.push({cli_id:event[i].cli_id});
            }
            where['or'] = array;
            param["where"]=where;
            this._productoService.query(
                { filter:param },
            data=>{this.listproductos = data;/*console.log("data=",data);*/},
                error=>{
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                }
            );
        }else{
            this.listproductos = [];
        }
    }

    btnCambio(){
        this.router.navigate(['/distribucion/cambiogestion']);
    }

    btnCerrar(){
        this.loading=true;
        let ord_ids = '';
        /*if(this.checkedOS.length > 0){
            for(let i in this.checkedOS){
                if(ord_ids == ''){
                    ord_ids = this.checkedOS[i].ord_id.toString();
                }else{
                    ord_ids = ord_ids+','+this.checkedOS[i].ord_id.toString();
                }
            }*/
        if(this.selected.length > 0){
            for(let i in this.selected){
                for(let j in this.selected[i].detalle){
                    if(ord_ids == ''){
                        ord_ids = this.selected[i].detalle[j].ord_id.toString();
                    }else{
                        ord_ids = ord_ids+','+this.selected[i].detalle[j].ord_id.toString();
                    }
                }                
            }
            this._gestionClientesService.cerrar(
                {ord_ids:ord_ids},
                data=>{ //console.log("cerrar:", data);
                this.selected = [];     
                this.loading=false;
                    if(data[0].observacion != '' || data[0].observacion != null){
                        this.mostrar_error_alerta(data[0]['observacion']);
                    }else{
                        this.showMessage('success', '¡Proceso exitoso!', '');
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
        }else{
            this.loading=false;
            this.showMessage('warning', 'Debe selecionar una orden', '');
        }
    }

    btnReabrir(){
        this.loading=true;
        let ord_ids = '';
        /*if(this.checkedOS.length > 0){
            for(let i in this.checkedOS){
                if(ord_ids == ''){
                    ord_ids = this.checkedOS[i].ord_id.toString();
                }else{
                    ord_ids = ord_ids+','+this.checkedOS[i].ord_id.toString();
                }
            }*/
        if(this.selected.length > 0){
            for(let i in this.selected){
                for(let j in this.selected[i].detalle){
                    if(ord_ids == ''){
                        ord_ids = this.selected[i].detalle[j].ord_id.toString();
                    }else{
                        ord_ids = ord_ids+','+this.selected[i].detalle[j].ord_id.toString();
                    }
                }                
            }
            this._gestionClientesService.abrir(
                {ord_ids:ord_ids},
                    data=>{ //console.log("abrir:", data);
                    this.selected = [];     
                    this.loading=false;
                        if(data.length > 0){
                            this.mostrar_error_alerta(data[0]['observacion']);
                        }else{
                            this.showMessage('success', '¡Proceso exitoso!', '');
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
        }else{
            this.loading=false;
            this.showMessage('warning', 'Debe selecionar una orden', '');
        }
    }

    btnExportar_click(event){
        this.loading=true;
        let ord_ids = '';
        /*if(this.checkedOS.length > 0){
            for(let i in this.checkedOS){
                if(ord_ids == ''){
                    ord_ids = this.checkedOS[i].ord_id.toString();
                }else{
                    ord_ids = ord_ids+','+this.checkedOS[i].ord_id.toString();
                }
            }*/
        if(this.selected.length > 0){
            for(let i in this.selected){
                for(let j in this.selected[i].detalle){
                    if(ord_ids == ''){
                        ord_ids = this.selected[i].detalle[j].ord_id.toString();
                    }else{
                        ord_ids = ord_ids+','+this.selected[i].detalle[j].ord_id.toString();
                    }
                }
            }
            this._gestionClientesService.exportar(
                { order_ids:ord_ids },
                excel=>{
                    this.selected = []; 
                    this._downloadService.token(
                        {id:0,tipo:19},
                        data=>{
                            if(data.des_token_validation.length < 1){
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                this.loading=false;
                            }else{
                                this.loading=false;
                                let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+19+"&extra="+excel.archivo;
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
        }else{
            this.loading=false;
            this.showMessage('warning', 'Debe selecionar una orden', '');
        }
    }

    btnExportarTXT1_click(event){//console.log("event:",event);
        this.loading1=true;
        let ord_ids = '';
        if(this.selected.length > 0){
            for(let i in this.selected){
                for(let j in this.selected[i].detalle){
                    if(ord_ids == ''){
                        ord_ids = this.selected[i].detalle[j].ord_id.toString();
                    }else{
                        ord_ids = ord_ids+','+this.selected[i].detalle[j].ord_id.toString();
                    }
                }                
            }
            console.log("ord_ids=",ord_ids.split(",").length, ord_ids.split(","));
            this._gestionClientesService.exportartxt1(
                {
                    order_ids:ord_ids,
                    tipo_txt:event,
                    reg_id: (this.valFormSearch.controls['regional'].value == null || this.valFormSearch.controls['regional'].value.length == 0 ? '' : this.valFormSearch.controls['regional'].value.join()),
                    courier_id: (this.valFormSearch.controls['courier'].value == null || this.valFormSearch.controls['courier'].value.length == 0 ? '' : this.valFormSearch.controls['courier'].value.join())
                },
                txtdata=>{
                    this.selected = []; 
                    this.loading1=false;
                    //console.log("txt:",txtdata);
                    let url = GLOBAL.url2+txtdata.url;
                    url = url;//console.log("url:",url);
                    window.open(url);
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
            this.loading1=false;
            this.showMessage('warning', 'Debe selecionar al menos una orden', '');
        }
    }

    btnExportarTXT_click(event){//console.log("event:",event);
        this.loading3=true;
        let ord_ids = '';
        /*if(this.checkedOS.length > 0){
            for(let i in this.checkedOS){
                if(ord_ids == ''){
                    ord_ids = this.checkedOS[i].ord_id.toString();
                }else{
                    ord_ids = ord_ids+','+this.checkedOS[i].ord_id.toString();
                }
            }*/
        if(this.selected.length > 0){
            for(let i in this.selected){
                for(let j in this.selected[i].detalle){
                    if(ord_ids == ''){
                        ord_ids = this.selected[i].detalle[j].ord_id.toString();
                    }else{
                        ord_ids = ord_ids+','+this.selected[i].detalle[j].ord_id.toString();
                    }
                }                
            }
            let suc_id;
            if(this.panelBusqSeleccionado === -1){
                suc_id = this.valFormSearch.controls['sucursal'].value;
            }else{
                suc_id = this.orden.controls['sucursal'].value;
            }
            this._gestionClientesService.exportartxt(
                {
                    order_ids:ord_ids,
                    tipo:event,
                    suc_id:suc_id },
                txtdata=>{
                    this.selected = []; 
                    this.loading3=false;
                    //console.log("txt:",txtdata);
                    let url = GLOBAL.url2+txtdata.url;
                    url = url;
                    window.open(url);
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
        }else{
            this.loading3=false;
            this.showMessage('warning', 'Debe selecionar una orden', '');
        }
    }

    Opcion_click(opcion_value){
        this.valFormSearch.controls['Opcion'].setValue(opcion_value);
        this.habilita_opciones(opcion_value);        
    }

    habilita_opciones(opcion_selected){
        
        switch (opcion_selected) {
            case '1':
                this.valFormSearch.controls['desde'].enable();
                this.valFormSearch.controls['hasta'].enable();
                this.valFormSearch.controls['corte'].disable();
                this.corte = false;
                break;
            case '2':
                this.valFormSearch.controls['desde'].disable();
                this.valFormSearch.controls['hasta'].disable();
                this.valFormSearch.controls['corte'].enable();
                this.corte = true;
                break;
            default:
                break;
        }
        this.searchCliente(1);
    }

    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
        if(idpanel === 0){
            this.orden.controls['tipo'].setValue(1);
        }
    }

    ordenes(){
        this.parameters = {
            desde:(this.valFormSearch.controls['desde'].value), 
            hasta:(this.valFormSearch.controls['hasta'].value), 
            ope:(this.valFormSearch.controls['operador'].value == null || this.valFormSearch.controls['operador'].value == '' ? 2 : this.valFormSearch.controls['operador'].value),
            cli: (this.valFormSearch.controls['cliente'].value == null || this.valFormSearch.controls['cliente'].value.length == 0 ? '' : this.valFormSearch.controls['cliente'].value.join()),
            pro:(this.valFormSearch.controls['producto'].value == null || this.valFormSearch.controls['producto'].value.length == 0 ? '' : this.valFormSearch.controls['producto'].value.join()), 
            protipo:(this.valFormSearch.controls['tiposProd'].value == null || this.valFormSearch.controls['tiposProd'].value == '' ? '' : this.valFormSearch.controls['tiposProd'].value),
            corte:(this.corte ? this.valFormSearch.controls['corte'].value : ''),
        }       
        if(!this.loading2){
            this.loading2 = true;
            this._gestionClientesService.listordenes(
                this.parameters,
                data=>{ 
                    this.listordenes = data;
                    this.loading2 = false;
                }
            );
        }
    }
    hola(){
        document.getElementById('toggelExpand').click();
    }
    //grilla
    onPage(event){ }
    onSort(event){  }
    onActivate(event) { 
        if(event.type === 'dblclick'){
            //this.toggleExpandRow(event.row);console.log("event.row",event);
            //this.detailTable.rowDetail.expandAllRows();
            this.selectedOS.push(event.row);      
            this.detailModal.show();
            //let el: HTMLElement = this.toggelExpand.nativeElement as HTMLElement;
            //el.click();
            
            //if((<HTMLInputElement>document.getElementById('toggelExpand')).readyState === "complete") {
                //document.getElementById('toggelExpand').click();
            //}
            
            this.toggleExpandRow(event.row);
            //this.detailTable.rowDetail.expandAllRows();
        }
        if(event.type === 'mouseenter'){}
        /*if(event.type === 'checkbox'){
            console.log('Select Event', event.row.detalle);
            if(this.checksnivel1.selected.length < 1){
                this.checksnivel1.selected =  event.row.detalle;
            }else{
                for(let i in event.row.detalle){
                    this.checksnivel1.selected.push(event.row.detalle[i]);
                }
            }
            this.onSelect2(this.checksnivel1);
        }*/
    }

    onSelect2({ selected }) {
    
        this.checkedOS.splice(0, this.checkedOS.length);
        this.checkedOS.push(...selected);
      }

    onActivate2(event) {
        //this.checkedOS.splice(0, this.checkedOS.length);
        /*console.log("event",event.type);
        if(event.type === 'checkbox'){
            this.checkedOS.push(event.row);
            console.log("check",this.checkedOS);
        }*/
    }

    onSelect({ selected }) {  
        
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);console.log("allselect:",this.selected);
    }

    toggleExpandRow(row) {
        this.click = true;
        //this.detailTable.rowDetail.toggleExpandRow(row);
    }

    onDetailToggle(event) {
        //this.hola();
        //console.log("aqui");
    }

    detailModalCerrar(){
        this.detailModal.hide();
        this.selectedOS = [];
    }

    allCheckbox(event){}

    onCheckboxChangeFn(event,row){}

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
    }
    mostrar_error_alerta(sMensaje:string){
        this.alertDocumentos.show();
        document.getElementById('alertDocumentos_msj').innerHTML=sMensaje;
    }

    // When the user scrolls down 20px from the top of the document, show the button
    //window.onscroll = function() {scrollFunction()};

    scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
    }

    // When the user clicks on the button, scroll to the top of the document
    topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
}