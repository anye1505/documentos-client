import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
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
import { GLOBAL } from '../../../global';

@Component({
    selector: 'gestiondistribucion',
    templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {

    private sesion: any;
    public loading:boolean = false;
    public loading1:boolean = false;
    public loading2:boolean = false;
    public formLoading:boolean = false;

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
    pendienterow;
    rows2=[];
    permiso:boolean=false;
    seleccionado:boolean=false;

    /*Grilla*/
    columns=[];
    rows=[];
    limit=50;
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

    @ViewChild('table') table: any;
    @ViewChild('pendientesModal') pendientesModal: ModalDirective;

    constructor(
        fb: FormBuilder,
        private router: Router,
        private toasterService: ToasterService,
        private _empresaService: EmpresaService,
        private _userService: UserService,
        private _authService: AuthService,
        private _sucursalService: SucursalService,
        private _descargaGestionService: DescargaGestionService,
        private _downloadService:DownloadService,
        public _productoService:ProductoService,
        private _mensajeroService:MensajeroService
    ){
        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.valfrmbusqmultiple = fb.group({
            'Inicio': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'Fin': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'Courier': ['',Validators.compose([])],
            'Mensajero': [[],Validators.compose([])],
            'Operador': ['',Validators.compose([])],
            'Cliente': ['',Validators.compose([])],
            'Producto': [[],Validators.compose([])],
            'Sucursal': ['',Validators.compose([])],
        });

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
        let user_id = this._authService.getIdentity().userId;

        this._userService.roles(
            {filter:{include:"role",where:{principalId:user_id}}},
        /*this._userService.getroles(
            {},*/
            data=>{
                let perm = [];
                for(let i=0;i<data.length;i++){
                    perm.push(data[i]["role"].name);
                    //perm.push(data[i].name);
                }
                if(perm.indexOf('administrador') != -1){
                    this.permiso = true;                    
                }

                this._userService.find({ id : this.sesion.userId },
                    data=>{
                        /* Courier del usuario */
                        this.emp_id_user = data['emp_id'];
                        /* busca todas las sucursales dependiendo de si es administrador */
                        if(this.permiso){//console.log("con permiso")
                            this.searchSucursal(this.emp_id_user);
                        }else{//console.log("sin permiso")
                            this.searchSucursal(data['suc_id']);
                        }
                        /* Operadores */
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
                        /* Mensajeros */
                        /*this._empresaService.mensajero(
                            { 'emp_id':data['emp_id'] },
                            data=>{ this.listmensajeros = data; },
                            error=>{                
                                if(error.status===401){
                                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                                }else{                  
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                }o
                                this.loading=false;
                            }
                        );*/
                        this._descargaGestionService.couriers(
                            { 'emp_id':data['emp_id'] },
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
                        /* Sucursales */
                        
                        /*
                        this._sucursalService.sucursalseleccionada(
                            { 'suc_id':data['suc_id'] },
                            data=>{ this.listsucursales = data; },
                            error=>{                
                                if(error.status===401){
                                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                                }else{                  
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                }
                                this.loading=false;
                            }
                        );*/
                        
                        if(sessionStorage.getItem('reportes')!=undefined){
                            let dataBusqueda = JSON.parse(sessionStorage.getItem('reportes'));
                            console.log("busq:",dataBusqueda);
                            this.valfrmbusqmultiple.controls['Inicio'].setValue(dataBusqueda['data']['Inicio']);
                            this.valfrmbusqmultiple.controls['Fin'].setValue(dataBusqueda['data']['Fin']);
                            //this.valfrmbusqmultiple.controls['Courier'].setValue(dataBusqueda['data']['Courier']);
                            //this.valfrmbusqmultiple.controls['Mensajero'].setValue(dataBusqueda['data']['Mensajero']);
                            this.valfrmbusqmultiple.controls['Operador'].setValue(dataBusqueda['data']['Operador']);
                            this.valfrmbusqmultiple.controls['Cliente'].setValue(dataBusqueda['data']['Cliente']);
                            //this.valfrmbusqmultiple.controls['Cliente'].setValue(dataBusqueda['data']['Cliente']);
                            this.valfrmbusqmultiple.controls['Sucursal'].setValue(dataBusqueda['data']['Sucursal']);
                            /*if(dataBusqueda['data']['Sucursal'] == null || dataBusqueda['data']['Sucursal'] == ''){
                                this.valfrmbusqmultiple.controls['Sucursal'].setValue(1);
                            }*/
                            if(this.valfrmbusqmultiple.controls['Operador'].value != "" && this.valfrmbusqmultiple.controls['Operador'].value != null){
                                this.searchCliente({emp_id:this.valfrmbusqmultiple.controls['Operador'].value});
                            }
                            if(this.valfrmbusqmultiple.controls['Cliente'].value != "" && this.valfrmbusqmultiple.controls['Cliente'].value != null){
                                this.searchProducto({cli_id:this.valfrmbusqmultiple.controls['Cliente'].value});
                            }
                            if(this.valfrmbusqmultiple.controls['Sucursal'].value){
                                this.searchMensajero({suc_id:this.valfrmbusqmultiple.controls['Sucursal'].value});
                            }
                        }
                        this.fn_busquedamultiple();
                        
                    },
                    error=>{                
                        if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                        else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                        this.loading=false;
                    }
                );
            },
            error=>{                        
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para obtener los permisos', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );
        
        
    }

    ngOnInit(){}

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

    fn_busquedamultiple(){
        this.fn_guardacriteriobusqueda();        
        this.updateRows({ 
            fecha_ini:this.valfrmbusqmultiple.controls['Inicio'].value, 
            fecha_fin:this.valfrmbusqmultiple.controls['Fin'].value, 
            mensajero:(this.valfrmbusqmultiple.controls['Mensajero'].value == null || this.valfrmbusqmultiple.controls['Mensajero'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Mensajero'].value.join()),
            emp_id_courier: (this.emp_id_user == null || this.emp_id_user == '' ? 0 : this.emp_id_user),
            suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
            emp_id_operador:(this.valfrmbusqmultiple.controls['Operador'].value == null || this.valfrmbusqmultiple.controls['Operador'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Operador'].value), 
            cli_id:(this.valfrmbusqmultiple.controls['Cliente'].value == null || this.valfrmbusqmultiple.controls['Cliente'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Cliente'].value), 
            prd_id:(this.valfrmbusqmultiple.controls['Producto'].value == null || this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Producto'].value.join()),
            emp_id_operador_dist:(this.emp_id_user == null || this.emp_id_user == '' ? 0 : this.emp_id_user),
        });
    }

    fn_guardacriteriobusqueda(){
        let data = {
            data: [] 
        };
        data.data = this.valfrmbusqmultiple.value;
        sessionStorage.setItem('reportes', JSON.stringify(data));
    }

    updateRows(pdata){
        this.loading=true;
        this.count = 0;
        this._descargaGestionService.reportemensajerocontrol(
            pdata,
            data=>{ //console.log("rows:", data);
                this.loading=false;
                this.rows = data; 
                this.rows = [...this.rows];
                //this.rows[5].gui_fecha_entrega = '07/12/2018';
                //console.log("group",this.groupBy(this.rows,'men_id'));
                
                //this.group = this.groupBy(this.rows,'men_id');

                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                //else { this.count = data[0]['nro_guias']; }
                this.count = data.length;
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

    groupBy(miarray, prop) {
        return miarray.reduce(function(groups, item) {
            var val = item[prop];
            //console.log("grupo=",groups,"item",item);
            groups[val] = groups[val] || {
                                            //fecha: item.gui_fecha_entrega,
                                            mensajero: item.men_nombre,
                                            total_por_cerrar: 0,
                                            total_imagen: 0,
                                            total_entregados: 0,
                                            total_cerrados: 0
                                        };
            groups[val].total_por_cerrar += item.documentos_por_cerrar;
            groups[val].total_imagen += item.documentos_imagen;
            groups[val].total_entregados += item.documentos_entregados_al_mensajero;
            groups[val].total_cerrados += item.documentos_cerrados_por_el_mensajero;
            
            return groups;
        }, {});
    }

    searchCliente(event){console.log("cliente:",event);
        this.valfrmbusqmultiple.controls['Cliente'].setValue('');
        this.listclientes = [];
        if(event){
            for(let i = 0;i<this.clientesTotal.length;i++){
                if(this.clientesTotal[i].emp_id_operador===event.emp_id){
                    this.listclientes.push({
                        cli_id:this.clientesTotal[i].cli_id,
                        emp_id:this.clientesTotal[i].emp_id,
                        emp_abrev:this.clientesTotal[i].emp_abrev
                    });
                }
            }
        }
    }

    searchProducto(event){console.log("producto:",event);
        this.valfrmbusqmultiple.controls['Producto'].setValue([]);
        this.listproductos = [];
        if(event){
            let param={ order:'prd_id desc' };
            let where={}
            where["cli_id"] = event.cli_id;
            param["where"]=where;
            this._productoService.query(
                { filter:param },
                data=>{/*console.log("pro:",data);*/this.listproductos = data;},
                error=>{
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                }
            );
        }
    }

    searchSucursal(event){
        this.valfrmbusqmultiple.controls['Sucursal'].setValue('');
        this.listsucursales = [];
        if(this.permiso){
            this._sucursalService.query(
                {filter:{where:{emp_id:event}}},
                data=>{//console.log("suc:",data);
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
        }else{
            this._sucursalService.query(
                {filter:{where:{suc_id:event}}},
                data=>{//console.log("suc:",data);
                    this.listsucursales = data;
                    if(data.length>0){
                        this.valfrmbusqmultiple.controls['Sucursal'].setValue(data[0]['suc_id']);
                        this.searchMensajero({suc_id:this.valfrmbusqmultiple.controls['Sucursal'].value});
                    }
                    //console.log("aqui:", this.valfrmbusqmultiple.controls['Sucursal'].value)
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

    searchMensajero(event){
        this.valfrmbusqmultiple.controls['Mensajero'].setValue([]);
        this.listmensajeros = [];
        if(event){console.log("mensajero:",event);
        this._mensajeroService.mensajerobysuc(
                {suc_id:event.suc_id},
                data=>{//console.log("men:",data);
                    this.listmensajeros = data;
                },
                error=>{

                if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para ver la información", '');                
                }else{
                    this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                }
                }
            );
        }
    }

    pendientes(row){
        this.rows2 = [];
        this.pendienterow = {};
        this.pendienterow = row;
        this.loading = true;
        this._descargaGestionService.reportemensajeropendiente(
            {gui_id:row.gui_id,emp_id_courier:this.emp_id_user},
            data=>{                
                //console.log("data:",data);
                this.loading = false;
                if(data.length>0){
                    this.rows2 = data; 
                    this.rows2 = [...this.rows2];
                }else{
                    this.toasterService.pop('info', "No se encontró información", '');
                }                
            },
            error=>{
                this.loading = false;
                if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');                
                }else{
                    this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                }
            }
        );
        this.pendientesModal.show();       
    }

    selectElementContents() {
        let el = document.getElementById('tabletocopy');
        var body = document.body, range, sel;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
            document.execCommand("copy");
        }
    }

    btnExportar_click(event){
        this.loading1=true;
        this._descargaGestionService.exportar(
            {
                fecha_ini:this.valfrmbusqmultiple.controls['Inicio'].value, 
                fecha_fin:this.valfrmbusqmultiple.controls['Fin'].value, 
                mensajero:(this.valfrmbusqmultiple.controls['Mensajero'].value == null || this.valfrmbusqmultiple.controls['Mensajero'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Mensajero'].value.join()),
                emp_id_courier: (this.emp_id_user == null || this.emp_id_user == '' ? 0 : this.emp_id_user),
                suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
                emp_id_operador:(this.valfrmbusqmultiple.controls['Operador'].value == null || this.valfrmbusqmultiple.controls['Operador'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Operador'].value), 
                cli_id:(this.valfrmbusqmultiple.controls['Cliente'].value == null || this.valfrmbusqmultiple.controls['Cliente'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Cliente'].value), 
                prd_id:(this.valfrmbusqmultiple.controls['Producto'].value == null || this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Producto'].value.join()),
                emp_id_operador_dist:(this.emp_id_user == null || this.emp_id_user == '' ? 0 : this.emp_id_user)
            },
            excel=>{ 
                this._downloadService.token(
                    {id:0,tipo:23},
                    data=>{
                        if(data.des_token_validation.length < 1){
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            this.loading1=false;
                        }else{
                            this.loading1=false;
                            let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+23+"&extra="+excel.archivo;
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
    }

    btnExportarDetallado_click(event){
        let fecha1 = new Date(this.valfrmbusqmultiple.controls['Inicio'].value);
        let fecha2 = new Date(this.valfrmbusqmultiple.controls['Fin'].value);
        let diasDif = fecha2.getTime() - fecha1.getTime();
        let dias = Math.round(diasDif/(1000 * 60 * 60 * 24));
        //console.log("dias:",dias);
        if( dias < 16){
            this.loading2=true;
            this._descargaGestionService.exportardetallado(
                {
                    fecha_ini:this.valfrmbusqmultiple.controls['Inicio'].value, 
                    fecha_fin:this.valfrmbusqmultiple.controls['Fin'].value, 
                    mensajero:(this.valfrmbusqmultiple.controls['Mensajero'].value == null || this.valfrmbusqmultiple.controls['Mensajero'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Mensajero'].value.join()),
                    emp_id_courier: (this.emp_id_user == null || this.emp_id_user == '' ? 0 : this.emp_id_user),
                    suc_id:(this.valfrmbusqmultiple.controls['Sucursal'].value == null || this.valfrmbusqmultiple.controls['Sucursal'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Sucursal'].value), 
                    emp_id_operador:(this.valfrmbusqmultiple.controls['Operador'].value == null || this.valfrmbusqmultiple.controls['Operador'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Operador'].value), 
                    cli_id:(this.valfrmbusqmultiple.controls['Cliente'].value == null || this.valfrmbusqmultiple.controls['Cliente'].value == '' ? 0 : this.valfrmbusqmultiple.controls['Cliente'].value), 
                    prd_id:(this.valfrmbusqmultiple.controls['Producto'].value == null || this.valfrmbusqmultiple.controls['Producto'].value.length == 0 ? '' : this.valfrmbusqmultiple.controls['Producto'].value.join()),
                    emp_id_operador_dist:(this.emp_id_user == null || this.emp_id_user == '' ? 0 : this.emp_id_user)
                },
                excel=>{
                    if(excel.error){
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        this.loading2=false;
                    }else{
                        this._downloadService.token(
                            {id:0,tipo:24},
                            data=>{
                                if(data.des_token_validation.length < 1){
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                    this.loading2=false;
                                }else{
                                    this.loading2=false;
                                    let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+24+"&extra="+excel.archivo;
                                    url = url;
                                    window.open(url);
                                }
                            },
                            error=>{              
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                this.loading2=false;
                            }
                        );
                    }
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
            this.showMessage('warning', 'El rango de fechas no debe ser mayor a 15 días', '');
        }
    }

    //grilla
    onPage(event){ }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {
        this.seleccionado=true;
        console.log("seleccionado!!!") }

    toggleExpandRow(row) {
        console.log('Toggled Expand Row!', row);
        this.table.rowDetail.toggleExpandRow(row);//expande una fila
      }
    
      onDetailToggle(event) {
        console.log('Detail Toggled', event);
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