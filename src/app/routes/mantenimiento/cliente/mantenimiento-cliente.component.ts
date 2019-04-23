import { Component, OnInit,TemplateRef ,ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { FileUploader } from 'ng2-file-upload';

import { ModalDirective,BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

import { Empresa } from '../../../models/empresa';

import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { ProductoService } from '../../../services/producto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ModeloDistribucionService } from '../../../services/modelo-distribucion.service';
import { ReglaDistribucionService } from '../../../services/regla-distribucion.service';
import { TipoCargoService } from '../../../services/tipo-cargo.service';
import { DownloadService } from '../../../services/download.service';

@Component({
    selector: 'mantenimiento-cliente',
    templateUrl: './mantenimiento-cliente.component.html'
})
export class MantenimientoClienteComponent implements OnInit {

    public modalRef: BsModalRef;

   	formLoading:boolean;
    valFormSearch: FormGroup;
    formCrearOp: FormGroup;
    tiposProd: any = [{prd_tipo:'DOCUMENTO'},{prd_tipo:'VALORADO'}];


    public toasActive;
    public filterRows="";
    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    /*Table Cliente*/
    columns=[];
    rows=[];
    limit=5;
    count=0;
    loading:boolean;
    loading2:boolean = false;
    order:string;
    selected = [];

    clienteSelected = null;
    /*Table Productos*/
    columnsProductos=[];
    rowsProductos=[];
    limitProductos=5;
    countProductos = 0;

    estados = [];
    tipos=[];
    temp = [];

    public cliente;

    public empresasTotal;

    /*Form carga update*/
    public empresas:Empresa[];

    /*Form generar Cliente*/

    public clientes:any;
    public clientesTotal:any;
    public productos:any;
    public valFormRegistrarCliente: FormGroup;
    public distritos:any;


    /*Form crear producto*/
    public modeloDistribucion = [];
    public reglaDistribucion = [];
    public tipoCargo = [];
    public valFormRegistrarProducto;



    @ViewChild('modalCrearCliente') modalCrearCliente: ModalDirective;
    @ViewChild('modalCrearProducto') modalCrearProducto: ModalDirective;
    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        public toasterService: ToasterService,
        public _empresaService:EmpresaService,
        public _productoService:ProductoService,
        private modalService: BsModalService,
        private _clienteService:ClienteService,
        private _modeloDistribucionService : ModeloDistribucionService,
        private _reglaDistribucionService : ReglaDistribucionService,
        private _tipoCargoService : TipoCargoService,
        private _downloadService:DownloadService
    ) {


        this.order = 'cli_id DESC';

        this._empresaService.operador(
            {

            },
            data=>{
                this.empresas = data;/*[];
                for(let i = 0;i<data.length;i++){
                    if(data[i].emp_id==2){
                        this.empresas.push(data[i]);
                    }
                }*/
                //this.empresas=data;
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

        this.clientes = [];
        this._empresaService.cliente(
            {},
            data=>{
                this.clientesTotal = [];
                for(let i = 0;i<data.length;i++){
                    this.clientesTotal.push({emp_id_operador:data[i].emp_id_operador,emp_id:data[i].emp_id,emp_abrev:data[i].emp_abrev});
                }
                //this.clientes=data;
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

        this._empresaService.query(
            {},
            data=>{
                this.empresasTotal=data;
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


        this._empresaService.distrito(
            {},
            data=>{
                this.distritos=data;
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

        this._tipoCargoService.query(
            {},
            data=>{
                this.tipoCargo=data;
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
        this._reglaDistribucionService.query(
            {
                filter:{
                    where:{
                        rdi_usu_elim:null
                    }
                }
            },
            data=>{
                this.reglaDistribucion=data;
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
        this._modeloDistribucionService.query(
            {},
            data=>{
                this.modeloDistribucion=data;
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


        // Model Driven validation
        this.valFormSearch = fb.group({
            'operador': ['',Validators.compose([])],
            'cliente': ['',Validators.compose([])]
        });

        this.valFormRegistrarCliente = fb.group({
            'id': [0,Validators.compose([])],
            'operador': ['',Validators.compose([Validators.required])],
            'cliente': ['',Validators.compose([Validators.required])],
            'ruc': ['',Validators.compose([Validators.required])],
            'abreviado': ['',Validators.compose([Validators.required])],
            'direccion': ['',Validators.compose([Validators.required])],
            'distrito': ['',Validators.compose([Validators.required])]
        });


        this.valFormRegistrarProducto  = fb.group({
            'id': [0,Validators.compose([])],
            'nombre': ['',Validators.compose([Validators.required])],
            'nombre_docs': ['',Validators.compose([Validators.required])],
            'modeloDistribucion': ['',Validators.compose([Validators.required])],
            'reglaDistribucion': ['',Validators.compose([Validators.required])],
            'tipoCargo': ['',Validators.compose([Validators.required])],
            'prd_tipo': ['',Validators.compose([Validators.required])],
            'prd_imagen_rezago':[false,Validators.compose([])]
        });

    }

    ngOnInit() {
    }

    hiddenModal(){
            this.valFormRegistrarCliente.controls['id'].setValue(0);
            this.valFormRegistrarCliente.controls['operador'].setValue('');
            this.valFormRegistrarCliente.controls['cliente'].setValue('');
            this.valFormRegistrarCliente.controls['ruc'].setValue('');
            this.valFormRegistrarCliente.controls['abreviado'].setValue('');
            this.valFormRegistrarCliente.controls['direccion'].setValue('');
            this.valFormRegistrarCliente.controls['distrito'].setValue('');
    }
 

    submitFormSearch($ev, value: any) {
    	//this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valFormSearch.controls) {
            this.valFormSearch.controls[c].markAsTouched();
        }
        if (this.valFormSearch.valid) {   
            this.updateRows(1);
        }else{
    		this.formLoading = false;
        }
    }

    showModalActualizarCliente(row){
        this.valFormRegistrarCliente.controls['id'].setValue(row.cli_id);
        this.valFormRegistrarCliente.controls['operador'].setValue(row.operador.emp_id);
        this.valFormRegistrarCliente.controls['cliente'].setValue(row.cliente.emp_id);
        this.valFormRegistrarCliente.controls['ruc'].setValue(row.cliente.emp_ruc);
        this.valFormRegistrarCliente.controls['abreviado'].setValue(row.cliente.emp_abrev);
        this.valFormRegistrarCliente.controls['direccion'].setValue(row.cliente.emp_direccion);
        this.valFormRegistrarCliente.controls['distrito'].setValue(row.cliente.emp_ubigeo);
        this.modalCrearCliente.show();        
    }

    submitRegistrarCliente($ev, value: any){
        $ev.preventDefault();
        for (let c in this.valFormRegistrarCliente.controls) {
            this.valFormRegistrarCliente.controls[c].markAsTouched();
        }
        if (this.valFormRegistrarCliente.valid) { 
           this.loading = true;    
            this._clienteService.create(
               /* {
                    "emp_id_cliente": value.cliente,
                    "emp_id_operador": value.operador
                }*/
                value,
                data=>{
                    if(data.error){
                        this.showMessage('error', data.mensaje, '');

                    }else{
                        this.showMessage('success', data.mensaje, '');
                        //let name = '';
                        for(let i=0;i<this.empresasTotal.length;i++){
                            if(this.empresasTotal[i].emp_id===value.cliente){
                              //      name = this.empresasTotal[i].emp_abrev;
                                this.empresasTotal[i].emp_abrev = value.abreviado;
                                this.empresasTotal[i].emp_ruc = value.ruc;
                                this.empresasTotal[i].emp_direccion = value.direccion;
                                this.empresasTotal[i].emp_ubigeo = value.distrito;
                                this.empresasTotal = [...this.empresasTotal];
                                break;
                            }
                        }
                        //this.clientes.push({emp_id:data.emp_id_cliente,emp_abrev:name});
                        
                        this.clientesTotal.push({emp_id:data.data.emp_id_cliente,emp_abrev:data.data.emp_id});
                        this.clientes.push({emp_id:data.data.emp_id_cliente,emp_abrev:data.data.emp_id});
                        this.clientes = [...this.clientes];
                        this.valFormSearch.controls['cliente'].setValue(data.emp_id_cliente); 

                        this.modalCrearCliente.hide();
                        this.updateRows(1);                        
                    }
                    this.loading=false;

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
    }

    onPage(event){
        this.updateRows(event.offset+1);
    }
    onPageProducto(event){
        this.updateRowsProductos(event.offset+1);
    }

    onSort(event){
       /* if(event.column.prop='estado'){
            this.order = 'pro_estado '+event.newValue;
        }else{
            if(event.column.prop='estado'){
                this.order = 'pro_tipo '+event.newValue;                
            }else{

                this.order = event.column.prop+" "+event.newValue;  
            }
        }*/
    }

    validar(){
        if(this.selected.length == 0){
            this.showMessage('warning', 'Seleccione un cliente', '');
        }else{
            this.modalCrearProducto.show();
        }
    }

    onSelect({ selected }) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        this.clienteSelected = this.selected[0];console.log("select:",this.selected);
        this.updateRowsProductos(1);
    }

    onActivate(event) {
        
    }

    updateRows(page){
        this.selected=[];
        this.loading=true;
        //this.timeOut = setTimeout(function(){
        //this.loading=true;
        let param={
            limit:this.limit,
            order:this.order,            
            include:[
                {relation:"operador",scope:{fields:["emp_ruc","emp_razon_social"]}},
                {relation:"cliente",scope:{fields:["emp_ruc","emp_razon_social","emp_tipo","emp_abrev","emp_direccion","emp_ubigeo"]}}
            ]
        };

        let where={}

        if(this.valFormSearch.controls['operador'].value !=null && this.valFormSearch.controls['operador'].value != ""){
            where["emp_id_operador"] = this.valFormSearch.controls['operador'].value;
        }

        if(this.valFormSearch.controls['cliente'].value !=null && this.valFormSearch.controls['cliente'].value != ""){
            where["emp_id_cliente"] = this.valFormSearch.controls['cliente'].value;
        }

        param["where"]=where;
        if(page > 1){
            param["offset"]=(page*this.limit)-this.limit;
        }


        this._clienteService.count(
            {where:where},
            count=>{
                if(count.count>0){   
                    this._clienteService.query(
                        {filter:param},
                        data=>{
                            this.rows = data;                
                            this.rows = [...this.rows];
                            this.temp = this.rows;
                            this.count = count.count;
                            this.loading=false;
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
                    this.rows=[];
                    this.rows = [...this.rows];
                    this.count = 0;
                    this.showMessage('info', 'No se encontraron datos', '');
                    this.loading=false;
                }
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
            }
        );
    }

    showModalActualizarProducto(row){
        this.valFormRegistrarProducto.controls['id'].setValue(row.prd_id);
        this.valFormRegistrarProducto.controls['nombre'].setValue(row.prd_nombre);
        this.valFormRegistrarProducto.controls['nombre_docs'].setValue(row.prd_nombre_docs);
        this.valFormRegistrarProducto.controls['modeloDistribucion'].setValue(row.mdi_id);
        this.valFormRegistrarProducto.controls['reglaDistribucion'].setValue(row.rdi_id);
        this.valFormRegistrarProducto.controls['tipoCargo'].setValue(row.tca_id);
        this.valFormRegistrarProducto.controls['prd_tipo'].setValue(row.prd_tipo);
        this.valFormRegistrarProducto.controls['prd_imagen_rezago'].setValue(row.prd_imagen_rezago);
        this.modalCrearProducto.show(); 
    }
    hiddenModalCrearProducto(){
        this.valFormRegistrarProducto.controls['id'].setValue(0);
        this.valFormRegistrarProducto.controls['nombre'].setValue('');
        this.valFormRegistrarProducto.controls['nombre_docs'].setValue('');
        this.valFormRegistrarProducto.controls['modeloDistribucion'].setValue('');
        this.valFormRegistrarProducto.controls['reglaDistribucion'].setValue('');
        this.valFormRegistrarProducto.controls['tipoCargo'].setValue('');
        this.valFormRegistrarProducto.controls['prd_tipo'].setValue('');
        this.valFormRegistrarProducto.controls['prd_imagen_rezago'].setValue(false);
    }

    updateRowsProductos(page){
        if( this.clienteSelected!=null){
            this.loading=true;
            //this.timeOut = setTimeout(function(){
            //this.loading=true;
            let param={
                limit:this.limitProductos,   
                 order:'prd_id desc',        
                include:[
                    {relation:"tipoCargo",scope:{fields:["tca_id","tca_nombre"]}},
                    {relation:"modeloDistribucion",scope:{fields:["mdi_id","mdi_nombre"]}},                
                    {relation:"reglaDistribucion",scope:{fields:["rdi_id","rdi_nombre"]}}
                ]
            };

            let where={}

            where["cli_id"] = this.clienteSelected.cli_id;
            //console.log("filterrows:",this.filterRows);
            if(this.filterRows!=""){
                where["prd_nombre"]={"like":"%"+this.filterRows+"%","options":"i"};
            }

            param["where"]=where;

            if(page > 1){
                param["offset"]=(page*this.limit)-this.limit;
            }


            this._productoService.count(
                {
                    where:where
                },
                count=>{
                    if(count.count>0){   
                        this._productoService.query(
                            {
                                filter:param                            
                            },
                            data=>{console.log("data prod:",data);
                                for(let i = 0; i < data.length; i++){
                                    if(data[i].prd_imagen_rezago){
                                        data[i].imagen_rezago = 'SI';
                                    }else{
                                        data[i].imagen_rezago = 'NO';
                                    }
                                }
                                this.rowsProductos = data;                
                                this.rowsProductos = [...this.rowsProductos];
                                this.countProductos = count.count;
                                this.loading=false;                                
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
                        this.rowsProductos=[];
                        this.rowsProductos = [...this.rowsProductos];
                        this.countProductos = 0;
                        this.showMessage('info', 'No se encontraron datos', '');
                        this.loading=false;
                        
                    }
                },
                error=>{
                        this.rowsProductos=[];
                        this.rowsProductos = [...this.rowsProductos];
                        this.countProductos = 0;
                        this.showMessage('info', 'No se encontraron datos', '');
                        this.loading=false;
                        
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading=false;
                    
                }
            );
        }
    }

    updateFilter(event){ //console.log("filter:",event.target.value)
        let val = event.target.value;
        this.filterRows=val.toUpperCase();
        this.updateRowsProductos(1);
    }

    submitRegistrarProducto($ev, value: any){
        
        if(this.clienteSelected!=null){
            $ev.preventDefault();
            for (let c in this.valFormRegistrarProducto.controls) {
                this.valFormRegistrarProducto.controls[c].markAsTouched();
            }console.log("value:",value);
            if (this.valFormRegistrarProducto.valid) {  
                this.loading = true;   
                if(value.id > 0){
                    value["prd_id"]=value.id;
                    this._productoService.update(
                        value,
                        data=>{
                            if(data.error){
                                this.showMessage('error', data.mensaje, '');
                            }else{
                                this.modalCrearProducto.hide();
                                this.showMessage('success', data.mensaje, '');
                                this.updateRowsProductos(1);

                                this.valFormRegistrarProducto.controls['nombre'].setValue('');
                                //this.valFormRegistrarProducto.controls['tipo'].setValue('');
                                this.valFormRegistrarProducto.controls['nombre_docs'].setValue('');
                                this.valFormRegistrarProducto.controls['modeloDistribucion'].setValue('');
                                this.valFormRegistrarProducto.controls['reglaDistribucion'].setValue('');
                                this.valFormRegistrarProducto.controls['tipoCargo'].setValue('');
                                this.valFormRegistrarProducto.controls['prd_tipo'].setValue('');
                                this.valFormRegistrarProducto.controls['prd_imagen_rezago'].setValue(false);
                                                                
                            }
                            this.loading=false;
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

                    this._productoService.create(
                        {
                            "cli_id": this.clienteSelected.cli_id,
                            "prd_nombre": value.nombre,
                            "prd_tipo" : value.prd_tipo,
                            "prd_nombre_docs" : value.nombre_docs,
                            "mdi_id" : value.modeloDistribucion,
                            "rdi_id" : value.reglaDistribucion,
                            "tca_id" : value.tipoCargo,
                            "prd_imagen_rezago": false
                        },
                        data=>{

                            this.modalCrearProducto.hide();
                            this.showMessage('success', 'Producto registrado', '');
                            this.updateRowsProductos(1);

                            this.valFormRegistrarProducto.controls['nombre'].setValue('');
                            //this.valFormRegistrarProducto.controls['tipo'].setValue('');
                            this.valFormRegistrarProducto.controls['nombre_docs'].setValue('');
                            this.valFormRegistrarProducto.controls['modeloDistribucion'].setValue('');
                            this.valFormRegistrarProducto.controls['reglaDistribucion'].setValue('');
                            this.valFormRegistrarProducto.controls['tipoCargo'].setValue('');
                            this.valFormRegistrarProducto.controls['prd_tipo'].setValue('');
                            this.valFormRegistrarProducto.controls['prd_imagen_rezago'].setValue(false);
                            this.loading=false;
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
            }
        }else{
            this.showMessage('warning', 'Debe seleccionar cliente', '');
        }
                
    }

    btnExportar_click(){

        this._clienteService.exportarexcel(
            {
                'operador':(this.valFormSearch.controls['operador'].value == '' ? 0 : this.valFormSearch.controls['operador'].value),
                'cliente':(this.valFormSearch.controls['cliente'].value == '' ? 0 : this.valFormSearch.controls['cliente'].value)
            },
            gendata=>{ 
                this._downloadService.token(
                    {id:0,tipo:20},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading=false;
                        }else{
                            this.loading=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+20+"&extra="+gendata.archivo;
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
        this.loading2 = true;
    }

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }

    onSelectOperador(event){

        this.valFormSearch.controls['cliente'].setValue('');
        this.clientes = [];
        for(let i = 0;i<this.clientesTotal.length;i++){
            if(this.clientesTotal[i].emp_id_operador===event.emp_id){
                this.clientes.push({emp_id:this.clientesTotal[i].emp_id,emp_abrev:this.clientesTotal[i].emp_abrev});
            }
        }
    }

    onSelectClienteRegistrarCliente(event){
        if(event!=null){
            this.valFormRegistrarCliente.controls['ruc'].setValue(event.emp_ruc);
            this.valFormRegistrarCliente.controls['abreviado'].setValue(event.emp_abrev);
            this.valFormRegistrarCliente.controls['direccion'].setValue(event.emp_direccion);
            this.valFormRegistrarCliente.controls['distrito'].setValue(event.emp_ubigeo);
        }else{
            this.valFormRegistrarCliente.controls['ruc'].setValue('');
            this.valFormRegistrarCliente.controls['abreviado'].setValue('');
            this.valFormRegistrarCliente.controls['direccion'].setValue('');
            this.valFormRegistrarCliente.controls['distrito'].setValue('');
        }
    }

    /*updateFilter(event){
        let val = event.target.value.toLowerCase();
        this.filterRows=val;

        const temp = this.temp.filter(function(d) {
            console.log("filter: ",d);
            return d.name.toLowerCase().indexOf(val) !== -1 || !val;
          });
        //this.updateRows(1);
        //{"limit":1,"offset":0,"where":{"id":1}}
    }*/
}
