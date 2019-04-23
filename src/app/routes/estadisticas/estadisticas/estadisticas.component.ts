import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { SucursalService } from '../../../services/sucursal.service';
import { DescargaGestionService } from '../../../services/descarga-gestion.service';
import { DownloadService } from '../../../services/download.service';
import { ProductoService } from '../../../services/producto.service';
import { MensajeroService } from '../../../services/mensajero.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GestionClientesService } from '../../../services/gestion-clientes.service';

@Component({
    selector: 'proceso',
    templateUrl: './estadisticas.component.html',
    styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {

    public pieChartLabelsDelivery:string[] = ["% Entregado", "% Entregado con sello", "% Buzón", "% Bajo puerta"];
    public pieChartDataDelivery:number[] = [0,0,0,0];
    public pieChartType:string = 'pie';
    public pieChartOptions:any = {'backgroundColor': [
                "#FF6384",
                "#4BC0C0",
                "#FFCE56",
                "#E7E9ED"
                ]}


    public pieChartLabelsLags:string[] = ["% Dirección no existe", "% Dirección incompleta", "% Se mudó", "% Desconocido", "% Rechazado", "% Ausente", "% Fallecido"];
    public pieChartDataLags:number[] = [0,0,0,0,0,0,0];
    public pieChartType4:string = 'pie';
    public pieChartOptions4:any = {'backgroundColor': [
        "#FF6384",
        "#4BC0C0",
        "#FFCE56",
        "#E7E9ED",
        "#E7E9ED",
        "#4BC0C0",
        "#FF6384"
        ]}

    public pieChartLabelsImages:string[] = ["% Entregas con imagen", "% Entregas sin imagen"];
    public pieChartDataImages:number[] = [0,0];
    public pieChartType3:string = 'pie';
    public pieChartOptions3:any = {'backgroundColor': [
        "#FF6384",
        "#4BC0C0"
        ]}
    
    // events on slice click
    public chartClicked(e:any):void {
        console.log(e);
    }
    
    // event on pie chart slice hover
    public chartHovered(e:any):void {
        console.log(e);
    }

    private sesion: any;
    public loading:boolean = false;
    public formLoading:boolean = false;
    public dist:boolean = false;

    valfrmbusqmultiple: FormGroup;

    listestadosguia:any = [];
    listoperadores:any = [];
    listmensajeros:any = [];
    listsucursales:any = [];
    listclientes:any = [];
    listproductos:any = [];
    listcouriers:any = [];
    clientesTotal:any = [];
    emp_id_user;
    expanded: any = {};
    group = [];
    rows=[];
    timelineAlt = true;

    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    @ViewChild('graficasmodal') graficasmodal: ModalDirective;

    constructor(
        fb: FormBuilder,
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _authService: AuthService,
        private _sucursalService: SucursalService,
        private _descargaGestionService: DescargaGestionService,
        public _productoService:ProductoService,
        public _gestionClientesService:GestionClientesService
    ) {
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.valfrmbusqmultiple = fb.group({
            'Inicio': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'Fin': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'Courier': ['',Validators.compose([Validators.required])],
            'Operador': ['',Validators.compose([])],
            'Cliente': ['',Validators.compose([])],
            'Producto': [[],Validators.compose([])],
            'TipoReg': [2,Validators.compose([])],

        });

        /* Courier del usuario */
        this.emp_id_user = this._authService.getIdentity().emp_id;
        /* Operadores */
        this._empresaService.operador(
            { 'emp_id':this.emp_id_user },
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

        this._descargaGestionService.couriers(
            { 'emp_id':this.emp_id_user },
            data=>{ this.listcouriers = data; },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
            }
        );

        if(sessionStorage.getItem('reportes')!=undefined){
            let dataBusqueda = JSON.parse(sessionStorage.getItem('reportes'));
            
            this.valfrmbusqmultiple.controls['Inicio'].setValue(dataBusqueda['data']['Inicio']);
            this.valfrmbusqmultiple.controls['Fin'].setValue(dataBusqueda['data']['Fin']);
            this.valfrmbusqmultiple.controls['Courier'].setValue(dataBusqueda['data']['Courier']);
            this.valfrmbusqmultiple.controls['Operador'].setValue(dataBusqueda['data']['Operador']);
            this.valfrmbusqmultiple.controls['Cliente'].setValue(dataBusqueda['data']['Cliente']);
            if(dataBusqueda['data']['Cliente']){
                this.searchProducto({cli_id:dataBusqueda['data']['Cliente']});
            }                        
            //this.fn_busquedamultiple(); 
            console.log("aqui")
            this._gestionClientesService.gestion_entrega(
                {
                    'emp_id_operador':this.emp_id_user,
                    'emp_id_courier': this.valfrmbusqmultiple.controls['Courier'].value,
                    'cli_id': this.valfrmbusqmultiple.controls['Cliente'].value,
                    'prd_id': this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Producto'].value.join()
                },
                data=>{
                    console.log("data:",data[0]);
                    if(data[0].labels.length < 1){
                        this.pieChartDataDelivery = [0,0,0,0]; 
                    }else{
                        this.pieChartDataDelivery = data[0].labels;
                    }console.log("pieChartDataDelivery:",this.pieChartDataDelivery);                
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

            this._gestionClientesService.gestion_rezagos(
                {
                    'emp_id_operador':this.emp_id_user,
                    'emp_id_courier': this.valfrmbusqmultiple.controls['Courier'].value,
                    'cli_id': this.valfrmbusqmultiple.controls['Cliente'].value,
                    'prd_id': this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Producto'].value.join()
                },
                data=>{
                    console.log("data:",data[0]);
                    if(data[0].labels.length < 1){
                        this.pieChartDataLags = [0,0,0,0]; 
                    }else{
                        this.pieChartDataLags = data[0].labels;
                    }console.log("data:",this.pieChartDataLags);                
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

            this._gestionClientesService.imagenes(
                {
                    'emp_id_operador':this.emp_id_user,
                    'emp_id_courier': this.valfrmbusqmultiple.controls['Courier'].value,
                    'cli_id': this.valfrmbusqmultiple.controls['Cliente'].value,
                    'prd_id': this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Producto'].value.join()
                },
                data=>{
                    console.log("data:",data[0]);
                    if(data[0].labels.length < 1){
                        this.pieChartDataImages = [0,0,0,0]; 
                    }else{
                        this.pieChartDataImages = data[0].labels;
                    }console.log("data:",this.pieChartDataImages);                
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
                
        } //else { this.fn_busquedamultiple(); }
            
    }

    ngOnInit() {}

    frmBusquedaMultiple_submit($ev, value: any) {
        this.formLoading = true;
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

    fn_guardacriteriobusqueda(){
        let data = {
            data: [] 
        };
        data.data = this.valfrmbusqmultiple.value;
        sessionStorage.setItem('reportes', JSON.stringify(data));
    }

    fn_busquedamultiple(){
        this.fn_guardacriteriobusqueda();        
        this.updateRows({ 
            fecha_ini:this.valfrmbusqmultiple.controls['Inicio'].value, 
            fecha_fin:this.valfrmbusqmultiple.controls['Fin'].value,
            emp_id_courier: (this.valfrmbusqmultiple.controls['Courier'].value == null || this.valfrmbusqmultiple.controls['Courier'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Courier'].value),
            cli_id:(this.valfrmbusqmultiple.controls['Cliente'].value == null || this.valfrmbusqmultiple.controls['Cliente'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Cliente'].value), 
            prd_id:(this.valfrmbusqmultiple.controls['Producto'].value == null || this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['producto'].value.join()),
            emp_id_operador:this.emp_id_user,
            tre_id:this.valfrmbusqmultiple.controls['TipoReg'].value
        });
    }

    updateRows(pdata){
        this.loading=true;
        this._descargaGestionService.reporteclienteproceso(
            pdata,
            data=>{
                this.loading=false;
                for(let i=0; i<data.length; i++){
                    data[i].envio_principal_per = (data[i].envio_principal*100/data[i].envio_total).toFixed(2);
                    data[i].en_reparto_principal_per = (data[i].en_reparto_principal*100/data[i].envio_total).toFixed(2);
                    data[i].entregado_principal_per = (data[i].entregado_principal*100/data[i].envio_total).toFixed(2);
                    data[i].rezago_principal_per = (data[i].rezago_principal*100/data[i].envio_total).toFixed(2);
                    data[i].otro_principal_per = (data[i].otro_principal*100/data[i].envio_total).toFixed(2);
                    data[i].imagen_entrega_principal_per = (data[i].imagen_entrega_principal*100/data[i].envio_total).toFixed(2);
                    data[i].imagen_rezago_principal_per = (data[i].imagen_rezago_principal*100/data[i].envio_total).toFixed(2);
                    data[i].envio_principal_transporte_per = (data[i].envio_principal_transporte*100/data[i].envio_total).toFixed(2);
                    data[i].envio_principal_sucursal_per = (data[i].envio_principal_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].envio_sucursal_per = (data[i].envio_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].en_reparto_sucursal_per = (data[i].en_reparto_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].entregado_sucursal_per = (data[i].entregado_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].rezago_sucursal_per = (data[i].rezago_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].otro_sucursal_per = (data[i].otro_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].imagen_entrega_sucursal_per = (data[i].imagen_entrega_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].imagen_rezago_sucursal_per = (data[i].imagen_rezago_sucursal*100/data[i].envio_total).toFixed(2);
                    data[i].entregado_per = (data[i].entregado*100/data[i].envio_total).toFixed(2);
                    data[i].rezago_per = (data[i].rezago*100/data[i].envio_total).toFixed(2);
                    data[i].otro_per = (data[i].otro*100/data[i].envio_total).toFixed(2);
                    data[i].imagen_entrega_per = (data[i].imagen_entrega*100/data[i].envio_total).toFixed(2);
                    data[i].imagen_rezago_per = (data[i].imagen_rezago*100/data[i].envio_total).toFixed(2);
                }
                this.rows = data;
                this.rows = [...this.rows];
                //this.rows[5].gui_fecha_entrega = '07/12/2018';
                //console.log("group",this.groupBy(this.rows,'men_id'));
                
                //this.group = this.groupBy(this.rows,'men_id');

                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                //else { this.count = data[0]['nro_guias']; }
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

    searchSucursal(event){
        if(event){
            this._sucursalService.query(
                {filter:{where:{emp_id:event.id_courier}}},
                data=>{
                    this.listsucursales = data;
                },
                error=>{

                if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');                
                }else{
                    this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                }
                }
            );
        }
    }

    searchCliente(event){
        this.valfrmbusqmultiple.controls['Cliente'].setValue('');
        this.listclientes = [];
        if(event){            
            this._empresaService.cliente(
                {emp_id_operador:this._authService.getIdentity().emp_id,
                 emp_id_courier:event.id_courier},
                data=>{
                    this.clientesTotal=data;
                    this.listclientes =data;
                    //this.searchCliente(data['emp_id']);
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
            /*for(let i = 0;i<this.clientesTotal.length;i++){
                if(this.clientesTotal[i].emp_id_courier===event.id_courier){
                    this.listclientes.push({
                        cli_id:this.clientesTotal[i].cli_id,
                        emp_id:this.clientesTotal[i].emp_id,
                        emp_abrev:this.clientesTotal[i].emp_abrev
                    });
                }
            }*/
        }
    }

    searchProducto(event){
        this.valfrmbusqmultiple.controls['Producto'].setValue([]);
        this.listproductos = [];
        if(event){
            this._descargaGestionService.productos(
                { 'cli_id':event.cli_id },
                data=>{this.listproductos = data; },
                error=>{                
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.loading=false;
                }
            );
            /*let param={ order:'prd_nombre_docs' };
            let where={}
            where["cli_id"] = event;
            param["where"]=where;
            this._productoService.query(
                { filter:param },
                data=>{console.log("pro:",data);this.listproductos = data;},
                error=>{
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                }
            );*/
        }
    }

    graficas(){
        this.graficasmodal.show();
    }

    distribucion(){
        if(this.dist){
            this.dist = false;
        }else{
            this.dist = true;
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
