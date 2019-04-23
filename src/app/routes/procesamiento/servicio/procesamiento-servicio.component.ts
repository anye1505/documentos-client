import { Component, OnInit,TemplateRef, ViewChild} from '@angular/core';
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

import { OrdenService } from '../../../services/orden.service';
import { DownloadService } from '../../../services/download.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ProductoService } from '../../../services/producto.service';
import { TipoEtiquetaService } from '../../../services/tipo-etiqueta.service';
import { OrdenEstadoService } from '../../../services/orden-estado.service';
//import { SucursalService } from '../../../services/sucursal.service';
import { TareaService } from '../../../services/tarea.service';

import { DatatableComponent } from '@swimlane/ngx-datatable';
declare var $: any;
@Component({
    selector: 'procesamiento-servicio',
    templateUrl:'./procesamiento-servicio.component.html',
    styleUrls: ['./procesamiento-servicio.component.scss']
})
export class ProcesamientoServicioComponent implements OnInit {

    public modalRef: BsModalRef;

   	formLoading:boolean;
    valFormSearch: FormGroup;
    formCrearOp: FormGroup;
    formCrearOpVarios: FormGroup;
    valFormFecha: FormGroup;
    confirmaFecha: string = '';
    opc=<HTMLInputElement>document.getElementById('chkTable');
    posiciones:any=[];
    cont:number = 0;
    response:any=[];
    procesadosTemp = 0;
    generate:boolean=false;
    
    public toasActive;
    public filterRows;
    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true,
        timeout: 0
    });

    columns=[];
    rows=[];
    limit=20;
    count=0;
    loading:boolean;
    order:string;
    selected = [];

    estados = [];
    tipos=[];

    public cliente;

    /*Form carga update*/
    public uploader: FileUploader = new FileUploader({ 
       // removeAfterUpload: true,
        //allowedFileType: ['image/png', 'image/jpg', 'image/jpeg'],
        queueLimit: 100,
        url: GLOBAL.url+"ordenes/uploadBase" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });
    public empresas:Empresa[];
    //public sucursales:any[];
    
/*
    public hasBaseDropZoneOver: boolean = false;
    public hasAnotherDropZoneOver: boolean = false;

    fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }
*/
    /*Form generar OP*/
    public clientesTotal:any;
    public clientes:any;
    public productos:any;

    btnDescargarSim:boolean;
    btnDescargarGenerarOP:boolean;

    public selectedProducto=null;

    public lista = [];

    /*Generar etiqueta*/
    public formCrearEtiqueta: FormGroup;
    public tipoEtiquetas=[];

    /*Form cargar base*/
    public formatos:any;
    public formFormatos;
    public selectab: number = 1;
    //public formSucursal;

    public lblCrearOpVarios;
    public lblCrearOpVariosNotice;

    public checkedTotal:any;
    public chkList:any;

    @ViewChild('modalGenerarOp') modalGenerarOp: ModalDirective;
    @ViewChild('modalGenerarEtiqueta') modalGenerarEtiqueta: ModalDirective;
    @ViewChild('modalCargarBase') modalCargarBase: ModalDirective;    
    @ViewChild('modalGenerarOpVarios') modalGenerarOpVarios: ModalDirective;    
    @ViewChild('modalConFecha') modalConFecha: ModalDirective;
    @ViewChild('modalConFechaVarios') modalConFechaVarios: ModalDirective;

    public tipoReporteExtension:any;
    public tipoReporte:any;
    public btnReporte:any;
    @ViewChild('modelReporte') modelReporte: ModalDirective;

    /*Form cargar base*/
    @ViewChild('table') table: DatatableComponent;

    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        public toasterService: ToasterService,
        public _ordenService:OrdenService,
        public _empresaService:EmpresaService,
        public _productoService:ProductoService,
        public _tipoEtiquetaService:TipoEtiquetaService,
        private modalService: BsModalService,
        private _downloadService:DownloadService,
        public _ordenEstadoService:OrdenEstadoService,
        public _tareaService:TareaService
        //public _sucursalService:SucursalService
    ) {
        this.checkedTotal=true;
        this.btnDescargarGenerarOP=false;
        this.btnDescargarSim = false;
        this.btnReporte = false;
        this.tipoReporteExtension = [
            {value:'XLSX'},
            {value:'PDF'}
        ];

        this.order = 'pro_fecha_inicio_ord DESC';

        this._empresaService.operador(
            {},
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

          this._empresaService.cliente(
            {},
            data=>{
                this.clientesTotal=data;
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

          this._empresaService.formato(
            {},
            data=>{
                this.formatos=data;
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


        this._tipoEtiquetaService.query(
            {},
            data=>{

                this.tipoEtiquetas = data;
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
            {filter:{where:{ode_id:{gte:6}}}},
            data=>{
                 this.estados = data;
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;                
            });
/*
        this._sucursalService.buscar(
            {},
            data=>{
                this.sucursales = data;
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;                   
            }
        );*/

    	let password = new FormControl('', Validators.required);
        let certainPassword = new FormControl('', CustomValidators.equalTo(password));

        let now = new Date();
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        //let dDesde = new Date();
        //dDesde.setDate(dDesde.getDate() - 30);
        // Model Driven validation
        this.valFormSearch = fb.group({
            'desde': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],//[dDesde.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'hasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'estado': ['',Validators.compose([])],
            'cliente': ['',Validators.compose([])],
            'operador': ['',Validators.compose([])],
            'pro_nro_orden_courier': ['',Validators.compose([])],
            'pro_orden_operador':['',Validators.compose([])]
        });

        this.valFormFecha = fb.group({
            'fecha': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])]
        });
        this.formCrearOp =fb.group({
            'operador': [{value: '', disabled: true}, Validators.compose([])],
            'archivo': [{value: '', disabled: true}, Validators.compose([])],
            'nroOp': ['', Validators.compose([Validators.pattern('^[A-Za-z0-9]+$')])],
            'nroDias': [0, Validators.compose([Validators.required,Validators.pattern('^[A-Za-z0-9]+$')])],
            'nroDocumentos': [{value: '', disabled: true}, Validators.compose([])],
            'fechaCorte': [{value: '', disabled: true}, Validators.compose([])],
            'cliente': [{value: '', disabled: true},Validators.compose([Validators.required])],
            'producto': [{value: '', disabled: true}, Validators.compose([Validators.required])],
            'fechaInicio': ['',Validators.compose([Validators.required,CustomValidators.date])],
            "fechaOrdenamiento":[{value: '', disabled: true}],
            'ord_mensaje_cargo':['']

            //'sucursal': ['',Validators.compose([Validators.required])]
            //'fechaFin': ['',Validators.compose([Validators.required,CustomValidators.date])]
            
        });


        this.formCrearOpVarios =fb.group({
            'fechaInicio': ['',Validators.compose([Validators.required,CustomValidators.date])]

            //'sucursal': ['',Validators.compose([Validators.required])],
            //'fechaFin': ['',Validators.compose([Validators.required,CustomValidators.date])]
            
        });

        this.formCrearEtiqueta =fb.group({
            'ord_id':['',Validators.compose([Validators.required])],
            'tet_id': ['',Validators.compose([Validators.required])]            
        });
        
        if(sessionStorage.getItem('orden')!=undefined){
            let dataBusqueda = JSON.parse(sessionStorage.getItem('orden'));
            
                this.valFormSearch.controls['desde'].setValue(dataBusqueda['data']['desde']);
                this.valFormSearch.controls['hasta'].setValue(dataBusqueda['data']['hasta']);
                this.fn_busquedamultiple(); 
             
        } else { this.fn_busquedamultiple(); }
        //this.fn_busquedamultiple();
        
        //this.updateRows();
/*
        this.estados = [
            {est_id:1,est_name:"Registro - Nuevo"},
            {est_id:2,est_name:"Descargado"},
            {est_id:3,est_name:"Procesando"},
            {est_id:4,est_name:"Ordenado"},
            {est_id:5,est_name:"Ordenado - Transferido FTP"},
            {est_id:6,est_name:"Ordenado - Email"},
            
        ]
*/
        this.tipos=[
            {tip_id:1,tip_name:"Automático"},
            {tip_id:2,tip_name:"Manual"}
        ]

    }
    fn_busquedamultiple(ppage:number=0){       
        this.updateRows2({
            osOperador:(this.valFormSearch.controls['pro_orden_operador'].value == null || this.valFormSearch.controls['pro_orden_operador'].value == '' ? 0 : this.valFormSearch.controls['pro_orden_operador'].value),
            nroOS:(this.valFormSearch.controls['pro_nro_orden_courier'].value == null || this.valFormSearch.controls['pro_nro_orden_courier'].value == '' ? 0 : this.valFormSearch.controls['pro_nro_orden_courier'].value),
            estado:(this.valFormSearch.controls['estado'].value == null || this.valFormSearch.controls['estado'].value == '' ? 0 : this.valFormSearch.controls['estado'].value),
            operador:(this.valFormSearch.controls['operador'].value == null || this.valFormSearch.controls['operador'].value == '' ? 0 : this.valFormSearch.controls['operador'].value),
            cliente:(this.valFormSearch.controls['cliente'].value == null || this.valFormSearch.controls['cliente'].value == '' ? 0 : this.valFormSearch.controls['cliente'].value),
            desde:this.valFormSearch.controls['desde'].value,
            hasta:this.valFormSearch.controls['hasta'].value,
            ordenado_por:'pro_fecha_inicio_ord desc',
            desde_fila:( this.limit * ppage),
            limite_filas:this.limit
        });
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
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {         
            //if(this.formFormatos!="" && this.formFormatos!=null){
                    this.formLoading = true;
                //if(this.formSucursal!="" && this.formSucursal!=null){ 
                    form.append('formato', this.formFormatos);
                    if(this.formFormatos == 1){
                        console.log("Con fecha");
                        form.append('fecha', this.valFormFecha.controls['fecha'].value);
                    }else{
                        console.log("Sin fecha");
                        form.append('fecha', undefined);
                    }
//                    form.append('sucursal', this.formSucursal);
               /* }else{
                    this.showMessage('info', 'Seleccionar sucursal', '');
                    this.uploader[0].cancel();            
                }*/
            /*}else{
                this.showMessage('info', 'Seleccionar formato', '');
                this.uploader[0].cancel();                            
            }*/
        };
        /*this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
            //console.log("ImageUpload:uploaded:", item, status);
        };
        */
        this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
            this.formLoading = false;  
            console.log("item = ",item);
            this.cont--;
            response = JSON.parse(response);
            this.response = [];
            /*if(response && response[0]['error']==false && response[0]['mensaje']){
                this.showMessageCargarBase('success', response[0]['mensaje'], '');
            }*/
            if(response.length>0) { //parse your response. 
                item.response = response;
                if(item.response[0].error){
                    item.isError = true;
                    item.isSuccess = false;
                }
                this.response = response;console.log("res:",this.response);
                
            }             
            //this.updateRows();
        }
        this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => { 
           /* console.log("onErrorItem " + status, response, item); 
            if(response) { //parse your response. 
            } */
            console.log("item = ",item);  
            if(response){
                response = JSON.parse(response);
                 if(status ===401){
                    this.showMessageCargarBase('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else if(response.error){             
                    this.showMessageCargarBase('warning', response.error.message, '');               
                }else{                  
                    this.showMessageCargarBase('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
            this.formLoading = false;
        }
    }

    fn_guardacriteriobusqueda(){
        let data = {
            data: [] 
        };
        data.data = this.valFormSearch.value;
        sessionStorage.setItem('orden', JSON.stringify(data));
    }

    cargarBase(){
        this.selectab = 1;
        //this.formFormatos = 1; //this.formatos.tif_id==1, dataimagenes; //Anyelys comentó esto
        if(this.selectab == 1){//Anyelys agrego este if
            this.formFormatos = 2; //this.formatos.tif_id==1, dataimagenes;
        }
        this.modalCargarBase.show();        
    }

    selectedtab(idpanel){
        this.selectab = idpanel;
        if(this.selectab == 0){
            this.formFormatos = 1; //this.formatos.tif_id==1, dataimagenes;
        }else if(this.selectab == 1){
            this.formFormatos = 2; //this.formatos.tif_id==2, enotria;
        }else{
            this.formFormatos = 3; //this.formatos.tif_id==3, documentos;
        }
    }


    descargar(tipo,row){
        //if(this.selected.length === 1){
            if(row.ode_id > 3 ){               
                this.loading=true;
                this._downloadService.token(
                    {id:row.ord_id,tipo:tipo},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading=false;
                        }else{
                            this.loading=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+tipo;
                            url = url;
                            window.open(url);
                        }
                    },
                    error=>{              
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        this.loading=false;
                    }
                );
            }else{
                this.showMessage("warning","Seleccionar una orden que se encuentren ordenado","");                
            }
      /*  }else{
            this.showMessage("warning","Seleccionar una orden","");
        }*/
    }

    //generarOP(template: TemplateRef<any>){
    generarOP(){
        console.log("this.posiciones.length:", this.posiciones.length,"this.lista.length:",this.lista.length, this.lista);
        if(this.posiciones.length > 0 && this.lista.length > 1){
            console.log("pos:",this.posiciones);
            console.log("pos:",this.lista);
            for(let i = 0; i < this.posiciones.length; i++){
                console.log("pos",i,"=",this.posiciones[i]);
                this.posiciones[i].checkbox.checked = false;
                this.lista.splice(this.posiciones[i].pos,1);                
            }
            this.posiciones=[];
            //console.log("lista12:",this.lista);
            this.showMessage('warning','Para seleccionar mas de 1 orden, éstas deben ser sólo de tipo archivo journal','');
        }else{
            this.clientes=[];

            if(this.lista.length === 1){
                if(this.lista[0].ode_id === 6){
                    //console.log(this.lista[0].operador.emp_id);
                    for(var i=0;i<this.clientesTotal.length;i++){
                        if(this.clientesTotal[i].emp_id_operador===this.lista[0].ope_id){
                        this.clientes.push(this.clientesTotal[i]);

                        }
                    }
                    //this.clientes=data;

                    //console.log(this.selected[0]);
                    this.selectedProducto=this.lista[0];

                    this.formCrearOp.controls['operador'].setValue(this.lista[0].ope_nombre);
                    this.formCrearOp.controls['archivo'].setValue(this.lista[0].pro_nombre_archivo_in);
                    this.formCrearOp.controls['nroDocumentos'].setValue(this.lista[0].pro_nro_docs);
                    this.formCrearOp.controls['fechaCorte'].setValue(this.lista[0].pro_corte);
                    this.formCrearOp.controls['cliente'].setValue(this.lista[0].cli_id);
                    //this.formCrearOp.controls['cliente'].setValue(this.lista[0].producto?this.lista[0].producto.cli_id:0);
                    this.formCrearOp.controls['nroOp'].setValue(this.lista[0].pro_orden_operador?this.lista[0].pro_orden_operador:'');
                    //if(this.lista[0].producto){
                        this.searchProducto({cli_id:this.lista[0].cli_id},this.lista[0].prd_id)
                        //this.searchProducto({cli_id:this.lista[0].producto.cli_id},this.lista[0].producto.prd_id)
                    //}
                    if(this.lista[0].ope_id != 2 || this.lista[0].ope_id != 23){
                    //if(this.lista[0].operador.emp_id != 2 || this.lista[0].operador.emp_id != 23){
                        this.formCrearOp.controls['cliente'].enable();
                        this.formCrearOp.controls['producto'].enable();
                    }console.log(typeof this.lista[0].pro_fecha_fin_ord);
                    if(this.lista[0].pro_fecha_inicio_ord != null){
                        var date = new Date(this.lista[0].pro_fecha_inicio_ord);
                        var day = date.getDate();
                        var monthIndex = date.getMonth();
                        var year = date.getFullYear();

                        console.log(this.lista[0].pro_fecha_fin_ord);
                        var newdate = date.toLocaleString('es-Pe', { year: 'numeric', month : '2-digit', day : '2-digit' }).split(/\//);
                        
                        this.formCrearOp.controls['fechaOrdenamiento'].setValue(
                            [ newdate[1], newdate[0], newdate[2] ].join('/')

                            /*(day<10?("0"+day):day)+"/"+
                            (monthIndex<10?("0"+(monthIndex+1)):monthIndex)+"/"+
                            year*/
                        );
                    }else{
                        this.formCrearOp.controls['fechaOrdenamiento'].setValue('');
                    }

                    //this.formCrearOp.controls['nroOp'].setValue('ord_mensaje_cargo');
                    
                    //this.modalRef = this.modalService.show(template);
                    this.modalGenerarOp.show();
                }else{
                    this.showMessage("warning","Seleccionar una orden con estado ordenado - email","");                
                }
            }else if(this.lista.length > 1){
                this.lblCrearOpVarios = '';
                this.lblCrearOpVariosNotice = this.lista.length +' a procesar: ';
                for(let i=0;i<this.lista.length;i++){
                    this.lblCrearOpVariosNotice+=(i==0?'':",")+this.lista[i].ord_id;
                }
                this.formCrearOpVarios.controls['fechaInicio'].setValue('');
                this.modalGenerarOpVarios.show();
            }
            else{
                this.showMessage("warning","Seleccionar una orden","");
            }
        }
        
    }


    hiddenModalGenerarOp(){
        this.formCrearOp.controls["operador"].setValue('');
        this.formCrearOp.controls["archivo"].setValue('');
        this.formCrearOp.controls["nroOp"].setValue('');
        //this.formCrearOp.controls["nroDias"].setValue('');
        this.formCrearOp.controls["nroDocumentos"].setValue('');
        this.formCrearOp.controls["fechaCorte"].setValue('');
        this.formCrearOp.controls["cliente"].setValue('');
        this.formCrearOp.controls["producto"].setValue('');
        this.formCrearOp.controls["fechaInicio"].setValue('');
        //this.formCrearOp.controls["sucursal"].setValue('');
        this.formCrearOp.controls["ord_mensaje_cargo"].setValue('');
        this.selectedProducto = null;
    }


    generarEtiqueta(row){
        this.clientes=[];

        //if(this.selected.length === 1){
            if(row.ode_id > 6){
                this.formCrearEtiqueta.controls['ord_id'].setValue(row.ord_id);
                /*
                console.log(this.selected[0].configuracion.empresa.emp_id);
                for(var i=0;i<this.clientesTotal.length;i++){
                    if(this.clientesTotal[i].emp_id_operador===this.selected[0].configuracion.empresa.emp_id){
                    this.clientes.push(this.clientesTotal[i]);

                    }
                }
                //this.clientes=data;

                this.formCrearOp.controls['operador'].setValue(this.selected[0].configuracion.empresa.emp_abrev);
                this.formCrearOp.controls['archivo'].setValue(this.selected[0].pro_nombre_archivo_in);
                this.formCrearOp.controls['nroDocumentos'].setValue(this.selected[0].pro_nro_docs);
                this.formCrearOp.controls['fechaCorte'].setValue(this.selected[0].pro_corte);
                //this.modalRef = this.modalService.show(template);
                */
                this.modalGenerarEtiqueta.show();
            }else{
                this.showMessage("warning","Seleccionar una orden con estado ordenado - email","");                
            }
        /*}else{
            this.showMessage("warning","Seleccionar una orden","");
        }*/
    }

    hiddenModalGenerarEtiqueta(){

    }
    cargarProd(event){
        this.searchProducto({cli_id:this.formCrearOp.controls['cliente'].value},0) 
    }

    descargarExcel(){
        this.loading=false;
        let url = GLOBAL.url2+'/public/formato_documentos_prueba.xlsx';
        url = url;
        window.open(url);
    }

    searchProducto(event,prd_id){
        this.formCrearOp.controls['producto'].setValue(null);
        this._productoService.query(
            {
                filter:{
                    where:{
                        cli_id:event.cli_id
                    },  
                    include:[
                        {relation:"tipoCargo",scope:{fields:["tca_nombre"]}},
                        {relation:"modeloDistribucion",scope:{fields:["mdi_nombre"]}},
                        {relation:"reglaDistribucion",scope:{fields:["rdi_nombre"]}}
                    ]
                }
            },
            data=>{
                this.productos=data;
                if(prd_id>0){
                    this.formCrearOp.controls['producto'].setValue(prd_id);
                    for(let i = 0;i < this.productos.length; i++){
                        if(this.productos[i].prd_id == prd_id){
                            this.selectProducto(this.productos[i]);
                            break;
                        }
                    }
                }
            },
            error=>{
              if(error.status===401){
                  this.showMessage("warning","Ud. no cuenta con permiso para modificar la información ","");              
              }else{
                this.showMessage("error","Vuelva intentar en unos minutos","");
              }
            }
        );
       // console.log(event);
    }

    selectProducto(event){
        this.selectedProducto = event;
    }

    submitFormSearch($ev, value: any) {
    	//this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valFormSearch.controls) {
            this.valFormSearch.controls[c].markAsTouched();
        }
        if (this.valFormSearch.valid) {   
            this.fn_busquedamultiple();
            //this.updateRows();
        }else{
    		this.formLoading = false;
        }
    }
    registrar(){
        let param = this.formCrearOp.value;
        param['ord_id']=this.lista[0].ord_id;
        param['cliente'] = this.formCrearOp.controls['cliente'].value;
        param['producto'] = this.formCrearOp.controls['producto'].value;
        param['operador'] = this.lista[0].ope_id;
        param['tif_id'] = this.lista[0].tif_id;
        console.log("lista:",this.lista[0]);
        this.formLoading = true; 
        this._ordenService.generarOP(param,  
            (json)  =>  {
                if(json.error){
                    this.showMessage("warning",json.mensaje,"");
                }else{
                    this.showMessage("success",json.mensaje,"");
                    this.fn_busquedamultiple(1); 
                    //this.updateRows(1)
                }
                this.modalConFecha.hide();
                this.modalGenerarOp.hide();
                this.formLoading = false;
            },
            error => {
                if(error.status===401){
                    this.showMessage("warning","Ud. no cuenta con permiso para modificar la información ","");              
                }else{
                    this.showMessage("error","Vuelva intentar en unos minutos","");
                }
                this.formLoading = false;
        });
    }
    hiddenmodalConFecha(){  }
    hiddenmodalConFechaVarios(){  }
    btnConFechaVarios_aceptar(){
        this.registrarVarios();    
    }
    registrarVarios(){ 
        this.formLoading = true; 
        let param=this.formCrearOpVarios.value;
        this.procesadosTemp = 0;
        for(let i=0;i<this.lista.length;i++){   
            param["ord_id"]=this.lista[i].ord_id;
            //param['tif_id'] = this.lista[i].tif_id;
            this._ordenService.generarOPapido(param,  
            (json)  =>  {   console.log("json:",json);
                this.lista[i].error = json.error;
                this.lista[i].mensaje = json.mensaje;
                this.lista[i].codigoerror = json.codigoerror;
                this.lista[i].generar = true;
                this.procesadosTemp++;
                //longitud = 100
                //procesadosTemp = x
                /*if(json.error){
                    this.showMessage("warning",json.mensaje,"");
                }else{
                    this.showMessage("success",json.mensaje,"");
                    
                }*/
                if(this.procesadosTemp == this.lista.length){
                    //this.modalConFecha.hide();
                    //this.modalGenerarOpVarios.hide();
                    this.formLoading = false;
                    //this.fn_busquedamultiple(1); 
                    //this.updateRows(1)
                }
                this.lblCrearOpVarios = 'Procesando <b>'+this.procesadosTemp+'</b> de <b>'+this.lista.length+"</b>";
            },
            error => {
                this.procesadosTemp++;
                if(error.status===401){
                    this.showMessage("warning","Ud. no cuenta con permiso para modificar la información ","");
                }else{              
                    this.showMessage("error","Vuelva intentar en unos minutos","");
                }
                
                if(this.procesadosTemp == this.lista.length){
                    //this.modalGenerarOpVarios.hide();
                    this.formLoading = false;
                    //this.fn_busquedamultiple(1); 
                    //this.updateRows(1)
                }
            });
        } console.log("lista:", this.lista);
        this.formLoading = true; 
        //this.modalConFechaVarios.hide();
    }
    submitFormGenerarOP($ev, value: any){
        $ev.preventDefault();
        for (let c in this.formCrearOp.controls) {
            this.formCrearOp.controls[c].markAsTouched();
        }
        if (this.formCrearOp.valid) { 
            let fecha = new Date(this.formCrearOp.controls['fechaInicio'].value)
            let now = new Date();
            now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
            if(fecha > now){
                this.confirmaFecha = '¿ Confirma la generación de la orden de servicio con fecha futura '+this.formCrearOp.controls['fechaInicio'].value+' ?';  
                this.formLoading = false;
                this.modalConFecha.show();
            } else {
                this.registrar();
            }
        }else{
            this.formLoading = false;
        }
    }
    modalGenerarOpVarioscerrar(){
        this.modalGenerarOpVarios.hide();
        this.fn_busquedamultiple(1);
    }
    btnConFecha_aceptar(){
        this.registrar();
    }
    submitFormGenerarOPVarios($ev, value: any){
        this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.formCrearOpVarios.controls) {
            this.formCrearOpVarios.controls[c].markAsTouched();
        }        
        if (this.formCrearOpVarios.valid) {
            let fecha = new Date(this.formCrearOpVarios.controls['fechaInicio'].value)
            let now = new Date();
            now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
            if(fecha > now){
                this.confirmaFecha = '¿ Confirma la generación de la orden de servicio con fecha futura '+this.formCrearOpVarios.controls['fechaInicio'].value+' ?';
                this.formLoading = false;  
                this.modalConFechaVarios.show();
            } else {
                this.registrarVarios();
            }            
        }else{
            this.showMessage("warning","Introduzca una Fecha de Proceso","");
            this.formLoading = false;
        }
    }

    submitFormGenerarEtiqueta($ev, value: any){

        this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.formCrearEtiqueta.controls) {
            this.formCrearEtiqueta.controls[c].markAsTouched();
        }

        let param=value;

        //param['ord_id']=this.selected[0].ord_id;

        if (this.formCrearEtiqueta.valid) {            
            this._ordenService.generarEtiqueta(param,  
            (json)  =>  {            
                if(json.error){
                    this.showMessage("warning",json.mensaje,"");
                }else{
                    this.showMessage("success",json.mensaje,"");
                    this.fn_busquedamultiple(1); 
                    //this.updateRows(1)
                }
                this.modalGenerarEtiqueta.hide();
                this.formLoading = false;
            },
            error => {
              if(error.status===401){
                  this.showMessage("warning","Ud. no cuenta con permiso para modificar la información ","");              
              }else{
                this.showMessage("error","Vuelva intentar en unos minutos","");
              }
              this.formLoading = false;
            });
        }else{
            this.formLoading = false;
        }
    }

    onPage(event){
        this.rows = [];                
        this.rows = [...this.rows];
        this.count = 0;
        //this.updateRows(event.offset+1);
        this.fn_busquedamultiple(event.offset);
        this.lista = [];
    }

    onSort(event){
        if(event.column.prop='estado'){
            this.order = 'ode_id '+event.newValue;
            //this.order = 'pro_estado '+event.newValue;
        }else{
            if(event.column.prop='estado'){
                this.order = 'pro_tipo '+event.newValue;                
            }else{

                this.order = event.column.prop+" "+event.newValue;  
            }
        }
    }

    

    onSelect({ selected }) {
        /*
        this.btnDescargar=false;
        this.btnDescargarGenerarOP=false;  
        this.btnDescargarCargo=false;

        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);

        if(this.selected[0].pro_estado > 3 ){   
        }

        if(this.selected[0].pro_estado == 6 ){   
            this.btnDescargarGenerarOP=true;
        }

        if(this.selected[0].pro_estado > 7 ){   
            this.btnDescargarCargo=true; 
            this.btnDescargar=true;
        }
        */
    }

    onActivate(event) {
        
    }

    /* Nuevo updaterows */
    updateRows2(pdata){
        this.fn_guardacriteriobusqueda();
        this.loading=true;
        this.count = 0;
        this.checkedTotal=false;
        this.chkList = false;
        this.rows = [];                
        this.rows = [...this.rows];
        this.lista = [];
        this.btnDescargarGenerarOP=false;  
        this.btnDescargarSim = false;
        this.btnReporte = false;

        this.selected=[];
        this._ordenService.consultaMultiple(
            pdata,
            data=>{ console.log("consulta: ",data);
                this.loading=false;
                this.rows = data; 
                this.rows = [...this.rows];                
                this.cont = 0;
                for(let i = 0; i < this.rows.length; i++){
                    if(this.rows[i].tif_id == 1){
                        this.rows[i]["tipo_archivo"] = 'Taylor'
                    }else if(this.rows[i].tif_id == 2){
                        this.rows[i]["tipo_archivo"] = 'Journal'
                    }else{
                        this.rows[i]["tipo_archivo"] =  'Documentos'
                    }                    
                }
                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                else { this.count = data[0]['nro_os']; }
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
        
    }
    /* Fin */

    updateRows(page=1){

        this.checkedTotal=false;
        this.chkList = false;

        this.lista = [];
        
        this.rows = [];                
        this.rows = [...this.rows];
        this.count = 0;

        this.btnDescargarGenerarOP=false;  
        this.btnDescargarSim = false;
        this.btnReporte = false;

        this.selected=[];
        this.loading=true;
        //this.timeOut = setTimeout(function(){
        //this.loading=true;
        let param={
            limit:this.limit,
            order:this.order,
            //fields:{pro_fecha_op_courier:true,pro_nombre_archivo_in:true,pro_orden_operador:true,pro_nro_orden_courier:true,pro_nro_docs:true},
            include:[
               /* {
                    relation: 'ordenEstado'
                },*/
                {
                    relation: 'producto', // include the owner object
                    scope: { // further filter the owner object
                        //fields: ['prd_nombre_docs'], // only show two fields
                        include: { // include orders for the owner
                            relation: 'cliente', 
                            scope: { // further filter the owner object
                                //fields: ['ode_nombre'], // only show two fields
                                include: { // include orders for the owner
                                    relation: 'cliente', 
                                    scope: { // further filter the owner object
                                        fields: ['emp_abrev','cli_id']//, // only show two fields
                                        //include: { // include orders for the owner
                                        //    relation: 'cliente', 
                                            //where: {orderId: 5} // only select order with id 5
                                        //}
                                    }
                                    //where: {orderId: 5} // only select order with id 5
                                }
                            }
                            //where: {orderId: 5} // only select order with id 5
                        }
                    }
                },
                {
                    "relation":"configuracion",
                    scope:{
                        include:{
                            relation:"empresa",
                            scope:{
                                fields:["emp_abrev"]
                            }
                        }
                    }
                }
                ,{
                    relation:"ordenEstado",

                }
                ,{
                    relation:"operador",

                }
            ]
        };

        let where={}
        //if(this.filterRows===true){
            //where["name"]={"like":"%"+this.filterRows+"%","options":"i"}
            if(this.valFormSearch.controls['desde'].value!=null && this.valFormSearch.controls['desde'].value!=""){
                if(this.valFormSearch.controls['hasta']!=null  && this.valFormSearch.controls['hasta'].value!=""){
                    let finDate=new Date(this.valFormSearch.controls['hasta'].value);
                    finDate.setDate(finDate.getDate()+1);
                    where["pro_fecha_inicio_ord"]={
                        between:[new Date(this.valFormSearch.controls['desde'].value),finDate]
                    }
                }else{
                    let finDate=new Date();
                    finDate = new Date(Date.UTC(finDate.getFullYear(), finDate.getMonth(), finDate.getDate(),  finDate.getHours(), finDate.getMinutes(), finDate.getSeconds()));
                    finDate.setDate(finDate.getDate()+1);
                    where["pro_fecha_inicio_ord"]={
                        between:[new Date(this.valFormSearch.controls['desde'].value),finDate]
                    }
                }
            }

            if(this.valFormSearch.controls['estado'].value!=null && this.valFormSearch.controls['estado'].value!=""){
                where["pro_estado"]=this.valFormSearch.controls['estado'].value;
            }else{
                where["pro_estado"] = {'gte':6};
            }

            if(this.valFormSearch.controls['operador'].value!=null && this.valFormSearch.controls['operador'].value!=""){
                where["emp_id_operador"]=this.valFormSearch.controls['operador'].value;
            }
            if(this.valFormSearch.controls['cliente'].value!=null && this.valFormSearch.controls['cliente'].value!=""){
                where["emp_id_cliente"]=this.valFormSearch.controls['cliente'].value;
            }
            if(this.valFormSearch.controls['pro_orden_operador'].value!=null && this.valFormSearch.controls['pro_orden_operador'].value!=""){
                where["pro_orden_operador"]=this.valFormSearch.controls['pro_orden_operador'].value;
            }

            if(this.valFormSearch.controls['pro_nro_orden_courier'].value!=null && this.valFormSearch.controls['pro_nro_orden_courier'].value!=""){
                where["pro_nro_orden_courier"]=this.valFormSearch.controls['pro_nro_orden_courier'].value;
            }

            param["where"]=where;
        //}

        if(page > 1){
            param["offset"]=(page*this.limit)-this.limit;
        }


        this._ordenService.count(
            {where:where},
            count=>{
                if(count.count>0){   
                    this._ordenService.query(
                        {filter:param},
                        data=>{

                            this.rows = data;                
                            this.rows = [...this.rows];
                            this.count = count.count;console.log("data:", data);
                            this.loading=false;
                        },
                        error=>{/*
                            if(error.status ===401){
                                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                            }else if(response.error){             
                                this.showMessage('warning', response.error.message, '');               
                            }else{                  
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            }
*/
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

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }
    showMessageCargarBase(type,title,message){
        if(this.toasActive!=null){
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }

    getClassColor(row ) {
        if(row.pro_fecha_inicio_ord==null || row.ode_id>6){
            return '';
        }else{

            let diff =  new Date().getTime() - new Date(row.pro_fecha_inicio_ord).getTime();
            diff = Math.round(diff / (1000 * 60 * 60 * 24));
           /* diff = diff / 60;
            diff = diff / 60;
            diff = diff / 24;*/
            if(diff <= 1){
                return ' bkg-red-1';//data[i]['color'] = '#fee5d9';
            }else if(diff <= 2){
                return 'bkg-red-2';//data[i]['color'] = '#fcae91';
            }else if(diff <= 3){
                return ' bkg-red-3';//data[i]['color'] = '#hb6a4a';
            }else{
                return 'bkg-red-4';//data[i]['color'] = '#de2d26';
            }
            //console.log(diff);
            //datatable-body-cellred
        }


    ///return "backgroud:"+row.color;
  }

    allCheckbox(event){
       // console.log(this.table);
       // console.log(event);
        this.lista = [];
        debugger;
        if(event.target.checked == false){
            this.checkedTotal=false;
            this.btnDescargarGenerarOP=false;
            this.btnDescargarSim = false;
        }else{               
            let ordenEstadoTemp = this.rows.length > 0?this.rows[0].ode_id:null;

            for(let i=0;i<this.rows.length;i++){
                if(this.rows[i].ode_id != ordenEstadoTemp){
                    event.target.checked = false;
                    this.checkedTotal=false;
                    this.showMessage('warning','Estados diferentes','Las filas deben contener el mismo tipo de estado.');
                    return;
                }
            }
            
            this.checkedTotal=true;
            for(let i=0;i<this.rows.length;i++){
                this.lista.push(this.rows[i]);
                this.lista[i].error = true;
                this.lista[i].mensaje = '';
                this.lista[i].codigoerror = 0;
                this.lista[i].generar = false;
            }
            //this.lista = this.rows;

            if(ordenEstadoTemp == 6 ){   
                this.btnDescargarGenerarOP=true;
            }else if(ordenEstadoTemp >= 7 ){   
                this.btnDescargarSim = true;
            }

            this.btnReporte=true;
        }


    }


    onCheckboxChangeFn(event,row){
        //console.log(event);
        let position = -1;
        let pasa = true;
        let opc;
        if(this.lista.length == 0){
            this.opc = (<HTMLInputElement>document.getElementById('chkTable'));
        }
        for(let i=0; i < this.lista.length; i++){
            if(row.ord_id == this.lista[i].ord_id ){
                position = i;
                //break;
            } 
            if(event.target.checked){
                if(row.ode_id != this.lista[i].ode_id){
                    this.showMessage('warning','Estados diferentes','Seleccionar mismo estado.');
                    event.target.checked = false;
                    pasa = false;
                    break;
                }//console.log("list:",this.lista[i], "longitud:",this.lista.length);
                if(this.lista.length > 0 && row.tif_id != 2){
                    console.log("primer amarrillo:", row.tif_id);
                    
                    opc = event.target;
                    console.log("primer amarrillo2:", opc);
                    this.posiciones.push({pos:this.lista.length,checkbox:event.target});
                    //this.showMessage('warning','Para seleccionar mas de 1 orden, éstas deben ser sólo de formato enotria','');
                    //event.target.checked = false;
                    //pasa = false;
                    //break;
                }
            }else{
                this.chkList = false;
            }
        }

        if(pasa){

            this.btnDescargarSim = false;
            this.btnDescargarGenerarOP=false;  
            this.btnReporte=false;

            if(event.target.checked){
                if(position < 0){
                    this.lista.push(row);
                }
            }else{
                if(position >= 0){
                    this.lista.splice(position,1);
                }
            }

            if(this.lista.length > 0){
                if(row.ode_id == 6 ){   
                    this.btnDescargarGenerarOP=true;
                }
                if(row.ode_id >= 7 ){   
                    this.btnDescargarSim = true;
                }

                this.btnReporte=true;

                if(this.lista.length == this.rows.length){
                    this.chkList = true;
                    this.checkedTotal=true;
                }else{
                    this.chkList = false;                    
                }
            }else{
                this.chkList = false;
            }
        }
        //console.log("lita completa:",this.lista);
        if(this.lista[0]){
            if(this.lista[0].tif_id != 2){
            //console.log("opc:",this.opc.value);
            //console.log("primer amarrillo:", row.tif_id, "primer valor:", this.lista[0].tif_id);
            //this.opc.checked = false;
            //this.lista.shift(); //Elimina el primer elemento
            //this.showMessage('warning','Para seleccionar mas de 1 orden, éstas deben ser sólo de formato enotria','');
            this.posiciones.push({pos:0,checkbox:this.opc});
            }
        }
        //console.log("this.posiciones:",this.posiciones);
            /*

            if(this.lista.length == 1){


                this.selected.splice(0, this.selected.length);
                this.selected.push(row);


                if(row.pro_estado == 6 ){   
                    this.btnDescargarGenerarOP=true;
                }

                if(row.pro_estado > 7 ){   
                    this.btnDescargarSim = true;
                }
            }else{

                if(this.lista.length>1){

                    if(row.pro_estado == 6 ){   
                        this.btnDescargarGenerarOP=true;
                    }
                    if(row.pro_estado > 7 ){   
                        this.btnDescargarSim = true;
                    }
                }

            }*/

        
        /*
         this.btnDescargar=false;
        this.btnDescargarGenerarOP=false;  
        this.btnDescargarCargo=false;

        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);

        if(this.selected[0].pro_estado > 3 ){   
        }

        if(this.selected[0].pro_estado == 6 ){   
            this.btnDescargarGenerarOP=true;
        }

        if(this.selected[0].pro_estado > 7 ){   
            this.btnDescargarCargo=true; 
            this.btnDescargar=true;
        }
        */
    }

    descargarSimVarios(){
        if(this.lista.length > 0){
            let param=this.lista[0].ord_id;
            for(let i=1;i<this.lista.length;i++){
                param+=","+this.lista[i].ord_id;
            }
            this.descargarSim(param);
        }else{            
            this.showMessage('warning', 'Seleccionar', '');
        }
    }

    descargarSim(datos){
        
                this.loading=true;
                this._downloadService.token(
                    {id:0,tipo:4},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading=false;
                        }else{
                            this.loading=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+4+"&extra="+datos;
                            url = url;
                            window.open(url);
                        }
                    },
                    error=>{              
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        this.loading=false;
                    }
                );

        /*
        this._ordenService.descargarSIM({
            ord_id:datos
        },  
        (json)  =>  {            
            if(json.error){
                this.showMessage("warning",json.mensaje,"");
            }else{
                this.showMessage("success",json.mensaje,"");
                this.updateRows(1);
            }
            this.formLoading = false;
        },
        error => {
            if(error.status===401){
                this.showMessage("warning","Ud. no cuenta con permiso para modificar la información ","");              
            }else{
                this.showMessage("error","Vuelva intentar en unos minutos","");
            }
            this.formLoading = false;
        });*/
    }


    searchCliente(event){
        console.log("event: ",event);
        this.valFormSearch.controls['cliente'].setValue('');
        this.clientes = [];
        for(let i = 0;i<this.clientesTotal.length;i++){
            if(this.clientesTotal[i].emp_id_operador===event.emp_id){
                this.clientes.push({emp_id:this.clientesTotal[i].emp_id,emp_abrev:this.clientesTotal[i].emp_abrev,cli_id:this.clientesTotal[i].cli_id});
                console.log("clientes: ",this.clientes);
            }
        }
    }

    reporte(){
        this.modelReporte.show();
    }

    eliminar(row){
        console.log(row)
        this.loading=true;
        this._ordenService.eliminar(
            {
                ord_id:row.ord_id
            },
            data=>{
                if(data.error){
                    this.showMessage('error', data.mensaje, '');
                }else{
                    this.showMessage('success', 'Eliminado éxitosamente', '');
                    this.fn_busquedamultiple(); 
                    //this.updateRows2();
                }
                this.loading=false;
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

    generarReporte(){
        if(this.lista.length < 1){
            this.showMessage('warning','Debe seleccionar ordenes para el reporte','');
        }else{
            if(this.tipoReporte == '' || this.tipoReporte == null){
                this.showMessage('warning','Debe seleccionar tipo de reporte','');
            }else{
                this.loading=true;
                let ordenes = [];
                for(let i=0; i < this.lista.length;i++){
                    ordenes.push(this.lista[i].ord_id);
                }

                this._tareaService.reporte(
                    {
                        descripcion:'Reporte de orden de servicio: ' + ordenes.join(),
						tipo:2,
                        extension:this.tipoReporte,
                        ordenes:ordenes
                    },
                    data=>{
                        if(data.error){
                            this.showMessage('error', data.mensaje, '');
                        }else{
                            this.showMessage('success', data.mensaje, '');
                            this.modelReporte.hide();
                        }
                        this.loading=false;
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
        }
    }

    btnExportar_click(sender){
        this._ordenService.exportarListaOS(
            {
                fecha_desde:this.valFormSearch.controls['desde'].value, 
                fecha_hasta:this.valFormSearch.controls['hasta'].value, 
                
            },
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

    upload(){
        
        console.log("length:",this.uploader.queue.length);
        this.uploader.queue.forEach(element => {
            console.log("element=",element);
            if(!element.isSuccess){  
                this.formLoading = true;              
                element.upload();console.log("element.upload=",element.upload());
            }else{
                this.cont++;
            }
            console.log("cont=",this.cont);
        });
    }

    modalCargarBasehide(){        
        this.modalCargarBase.hide();
        this.fn_busquedamultiple();
    }

}
