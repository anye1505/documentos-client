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

import { OrdenService } from '../../../services/orden.service';
import { DownloadService } from '../../../services/download.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ProductoService } from '../../../services/producto.service';
import { OrdenEstadoService } from '../../../services/orden-estado.service';

import { TareaService } from '../../../services/tarea.service';

@Component({
    selector: 'procesamiento-orden',
    templateUrl: './procesamiento-orden.component.html'
})
export class ProcesamientoOrdenComponent implements OnInit {

    public modalRef: BsModalRef;

   	formLoading:boolean;
    valFormSearch: FormGroup;
    formCrearOp: FormGroup;


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
    limit=10;
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
        queueLimit: 1,
        url: GLOBAL.url+"ordenes/upload" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });
    public empresas:Empresa[];
    
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
    public clientes:any;
    public productos:any;

    public chkList:any;
    public checkedTotal:any;
    public lista:any;
    public btnReporte:any;
    public tipoReporteExtension:any;
    public tipoReporte:any;

    btnDescargar:boolean;
    @ViewChild('modalCargarBase') modalCargarBase: ModalDirective;
    @ViewChild('modelReporte') modelReporte: ModalDirective;
    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        public toasterService: ToasterService,
        public _ordenService:OrdenService,
        public _empresaService:EmpresaService,
        public _productoService:ProductoService,
        private modalService: BsModalService,
        private _downloadService:DownloadService,
        public _ordenEstadoService:OrdenEstadoService,
        public _tareaService:TareaService
    ) {
        this.checkedTotal = false;
        this.lista = [];
        this.btnDescargar=false;
        this.btnReporte = false;
        this.tipoReporteExtension = [
            {value:'XLSX'},
            {value:'PDF'}
        ];

        this.order = 'pro_fecha_inicio_ord DESC';

        this._empresaService.operador(
            {
            },
            data=>{
                //this.empresas = data;
                let empresa = [];
                for(let i = 0;i<data.length;i++){
                    if(data[i].emp_id==2){
                        //this.empresas.splice(i,1); //No muestra Enotria
                        empresa.push(data[i]);    //Muestra sólo Enotria
                        this.empresas = empresa;
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

          this._empresaService.cliente(
            {},
            data=>{
                this.clientes=data;
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
            {filter:{where:{ode_id:{lte:6}}}},
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

    	let password = new FormControl('', Validators.required);
        let certainPassword = new FormControl('', CustomValidators.equalTo(password));

        let now = new Date();
        let dDesde = new Date();
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        dDesde = new Date(Date.UTC(dDesde.getFullYear(), dDesde.getMonth(), dDesde.getDate(),  dDesde.getHours(), dDesde.getMinutes(), dDesde.getSeconds()));
        dDesde.setDate(dDesde.getDate() - 30);
        // Model Driven validation
        this.valFormSearch = fb.group({
            'desde': [dDesde.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'hasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'estado': ['',Validators.compose([])],
            'tipo': ['',Validators.compose([])]
        });

        this.formCrearOp =fb.group({
            'operador': [{value: '', disabled: true}, Validators.compose([])],
            'archivo': [{value: '', disabled: true}, Validators.compose([])],
            'nroOp': ['', Validators.compose([Validators.required,Validators.pattern('^[A-Za-z0-9]+$')])],
            'nroDias': ['', Validators.compose([Validators.required,Validators.pattern('^[A-Za-z0-9]+$')])],
            'nroDocumentos': [{value: '', disabled: true}, Validators.compose([])],
            'fechaCorte': [{value: '', disabled: true}, Validators.compose([])],
            'cliente': ['',Validators.compose([Validators.required])],
            'producto': ['', Validators.compose([Validators.required])],
            'fechaInicio': ['',Validators.compose([Validators.required,CustomValidators.date])]
            //'fechaFin': ['',Validators.compose([Validators.required,CustomValidators.date])]
            
        });
        this.updateRows();
/*
        this.estados = [
            {est_id:1,est_name:"Registro - Nuevo"},
            {est_id:2,est_name:"Descargado"},
            {est_id:3,est_name:"Procesando"},
            {est_id:4,est_name:"Ordenado"},
            {est_id:5,est_name:"Ordenado - Transferido FTP"},
            {est_id:6,est_name:"Ordenado - Email"},
            
        ]*/

        this.tipos=[
            {tip_id:1,tip_name:"Automático"},
            {tip_id:2,tip_name:"Manual"}
        ]

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
            if(this.cliente!="" && this.cliente!=null){
                    this.formLoading = true;
                form.append('cliente', this.cliente);
            }else{
                this.showMessage('info', 'Seleccionar cliente', '');
                this.uploader[0].cancel();            
            }
        };
        /*this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
            //console.log("ImageUpload:uploaded:", item, status);
        };
        */
        this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
            this.formLoading = false;
            item.remove();
            this.showMessage('success', 'Se ha cargado la base', '');
            this.modalCargarBase.hide();

            let dDesde = new Date();
            dDesde = new Date(Date.UTC(dDesde.getFullYear(), dDesde.getMonth(), dDesde.getDate(),  dDesde.getHours(), dDesde.getMinutes(), dDesde.getSeconds()));
            dDesde.setDate(dDesde.getDate() + 1);
            this.valFormSearch.controls['hasta'].setValue(dDesde.toISOString().substring(0, 10));
            this.order ='ord_id desc';
            this.updateRows(1);
            //console.log("onSuccessItem " + status, response, item); 
            if(response) { //parse your response. 
            } 
        }
        this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => { 
           /* console.log("onErrorItem " + status, response, item); 
            if(response) { //parse your response. 
            } */

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
            this.formLoading = false;
            /*
            if(status!=0){
                if(status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }*/
        }

    }


    descargar(tipo){
        if(this.selected.length === 1){
            if(this.selected[0].pro_estado > 3 ){               
                this.loading=true;
                this._downloadService.token(
                    {id:this.selected[0].ord_id,tipo:tipo},
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
        }else{
            this.showMessage("warning","Seleccionar una orden","");
        }
    }


    searchProducto(event){
        this.formCrearOp.controls['producto'].setValue(null);
        this._productoService.query(
            {filter:{where:{emp_id:event.emp_id}}},
            data=>{
                this.productos=data;
            },
            error=>{
              if(error.status===401){
                  this.showMessage("warning","Ud. no cuenta con permiso para modificar la información ","");              
              }else{
                this.showMessage("error","Vuelva intentar en unos minutos","");
              }
            }
        );
        console.log(event);
    }

    submitFormSearch($ev, value: any) {
    	//this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valFormSearch.controls) {
            this.valFormSearch.controls[c].markAsTouched();
        }
        if (this.valFormSearch.valid) {   
            this.updateRows();
        }else{
    		this.formLoading = false;
        }
    }

    onPage(event){
        this.updateRows(event.offset+1);
    }

    
    onSort(event){
        if(event.column.prop='estado'){
            this.order = 'pro_estado '+event.newValue;
        }else{
            if(event.column.prop='estado'){
                this.order = 'pro_tipo '+event.newValue;                
            }else{

                this.order = event.column.prop+" "+event.newValue;  
            }
        }
    }

    

    onSelect({ selected }) {
        this.btnDescargar=false;

        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);

        if(this.selected[0].pro_estado > 3 ){    
            this.btnDescargar=true;
        }

    }

    onActivate(event) {
        
    }

    updateRows(page=1){

        this.btnDescargar=false;
        this.btnReporte = false;
        this.lista = [];
        this.checkedTotal = false;

        this.selected=[];
        this.loading=true;
        //this.timeOut = setTimeout(function(){
        //this.loading=true;
        let param={
            limit:this.limit,
            order:this.order,
            include:["ordenEstado",{"configuracion":["empresa"]}]
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
                where["pro_estado"] = {'lt':7};
            }

            if(this.valFormSearch.controls['tipo'].value!=null && this.valFormSearch.controls['tipo'].value!=""){
                where["pro_tipo"]=this.valFormSearch.controls['tipo'].value;
            }

            where["conf_id"] = {gt:0};
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


    allCheckbox(event){
       // console.log(this.table);
       // console.log(event);
        this.lista = [];

        if(event.target.checked == false){
            this.checkedTotal=false;
            this.btnReporte=false;
        }else{               
            let ordenEstadoTemp = this.rows.length > 0?this.rows[0].ordenEstado.ode_id:null;

            for(let i=0;i<this.rows.length;i++){
                if(this.rows[i].ordenEstado.ode_id != ordenEstadoTemp){
                    event.target.checked = false;
                    this.checkedTotal=false;
                    this.showMessage('warning','Estados diferentes','Las filas deben contener el mismo tipo de estado.');
                    return;
                }
            }
            
            this.checkedTotal=true;
            for(let i=0;i<this.rows.length;i++){
                this.lista.push(this.rows[i]);
            }
            //this.lista = this.rows;

            if(ordenEstadoTemp >= 4 &&  ordenEstadoTemp <= 7){   
                this.btnReporte=true;
            }
        }
    }


    onCheckboxChangeFn(event,row){

        //console.log(event);
        let position = -1;
        let pasa = true;


        for(let i=0; i < this.lista.length; i++){
            if(row.ord_id == this.lista[i].ord_id ){
                position = i;
                //break;
            } 
            if(event.target.checked){
                if(row.pro_estado != this.lista[i].pro_estado){
                    this.showMessage('warning','Estados diferentes','Seleccionar mismo estado.');
                    event.target.checked = false;
                    pasa = false;
                    break;
                }
            }else{
                this.chkList = false;
            }
        }

        if(pasa){

            this.btnReporte = false;

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
                if(row.pro_estado >= 4 && row.pro_estado <= 7){   
                    this.btnReporte=true;
                }
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
    }

    reporte(){
        this.modelReporte.show();
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
                        descripcion:'Reporte de ordenamiento: ' + ordenes.join(),
                        tipo:1,
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

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }

}
