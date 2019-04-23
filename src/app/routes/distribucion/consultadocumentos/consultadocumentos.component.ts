import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GuiaService } from '../../../services/guia.service';
import { DownloadService } from '../../../services/download.service';
import { FileUploader } from 'ng2-file-upload';
import { ConsultaDocumentosService } from '../../../services/consulta-documentos.service';
import { Role,RoleMapping } from '../../../models/role';
import * as $ from 'jquery';

//const Tiff = require('tiff.js');
//const fs = require('fs');
@Component({
    selector: 'consultadocumentos',
    templateUrl: './consultadocumentos.component.html',
    styleUrls: ['./timeline.component.scss']
})
export class ConsultaDocumentosComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public loading2:boolean = false;
    public formLoading:boolean = false;
    public selecteddoc:boolean = false;
    public fileupload:boolean = false;
    public rolesUsuario:RoleMapping[];
    public panelBusqSeleccionado: number = -1;

    codigo_barra: FormGroup;
    codigo_barra2: FormGroup;
    archivo: FormGroup;
    destinatario: FormGroup;
    frmasivo: FormGroup;
    listmensajeros:any = [];
    listmotivos:any = [];
    listdespachadores:any = [];
    listcodigosbarra:any=[];
    listoperadores:any = [];
    lbltituloprocesados:string='';
    lbltituloprocesadosmasivo:string='';
    tipo_reg:number=0;
    sucursal: number=0;
    codigosBarra:string = '';
    codigosBarra2:string = '';
    values:any={codigoBarra:'',Opcion:1};
    queryparams:boolean=false;
    role:number=0;
    timelineAlt = true;
    courier: number=0;
    permiso:boolean = false;
    tiposreg = [
        {id:1,nombre:'Distribución'},
        {id:2,nombre:'Cliente'}
    ];
    sender;
    isSingleClick:boolean = true;
    listclientes:any = [];
    clientesTotal:any = [];

    /*Grilla*/
    columns=[];
    rows=[];
    limit=100;
    count=0;
    order:string;
    selected = [];
    /*Grilla 2*/
    columns2=[];
    rows2=[];
    limit2=5;
    count2=0;
    order2:string;
    /*Grilla 3*/
    columns3=[];
    rows3=[];
    limit3=5;
    count3=0;
    order3:string;
    public uploader: FileUploader = new FileUploader({ 
        queueLimit: 1,
        url: GLOBAL.url+"consultadocumentos/buscar_archivo" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });
    /*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    @ViewChild('ppBsqGuiaxCodigo') ppBsqGuiaxCodigo: ModalDirective;
    @ViewChild('alertDocumentos') alertDocumentos: ModalDirective;
    @ViewChild('timelinemodal') timelinemodal: ModalDirective;
    @ViewChild('consultabasica') consultabasica: ModalDirective;
    @ViewChild('imgmodal') imgmodal: ModalDirective;

    constructor(
        fb: FormBuilder,
        private router: Router,
        private toasterService: ToasterService,
        private _userService: UserService,
        private _authService: AuthService,
        private _consultaDocumentoService: ConsultaDocumentosService,
        private activateRoute: ActivatedRoute,
        private _empresaService: EmpresaService
    ){
        /*if(this.activateRoute.snapshot.queryParams['cod'] && this.activateRoute.snapshot.queryParams['tip'] && this.activateRoute.snapshot.queryParams['suc'] ){
            this.codigosBarra2 = this.activateRoute.snapshot.queryParams['cod'];
            this.tipo_reg = this.activateRoute.snapshot.queryParams['tip'];
            this.sucursal = this.activateRoute.snapshot.queryParams['suc'];
            this.values['Opcion'] = 1;
            this.queryparams = true;
            this.query();
        }*/
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        this.codigo_barra = fb.group({
            'codigoBarra': ['',Validators.compose([Validators.required])],
            'tipo': [1,Validators.compose([Validators.required])]
            //'Archivo': [{ value:'', disabled: true},Validators.compose([])],
            //'Opcion': ['']
        });

        this.codigo_barra2 = fb.group({
            'codigoBarra': ['',Validators.compose([Validators.required])],
            'tipo': [1,Validators.compose([Validators.required])]
            //'Archivo': [{ value:'', disabled: true},Validators.compose([])],
            //'Opcion': ['']
        });

        this.archivo = fb.group({
            'Archivo': ['',Validators.compose([Validators.required])],
            'tipo': ['',Validators.compose([Validators.required])]
        });

        this.destinatario = fb.group({
            'codigo': ['',Validators.compose([Validators.required])],
            'operador': ['',Validators.compose([Validators.required])],
            'tipo': ['',Validators.compose([Validators.required])],
            'cliente': ['',Validators.compose([Validators.required])]
        });
        this.sucursal = this._authService.getIdentity().suc_id;
        this.courier = this._authService.getIdentity().emp_id;

        /*this._userService.find({ id : this.sesion.userId },
            data=>{ 
                this.sucursal = data['suc_id'];
                this.courier = data['emp_id'];*/
                this._empresaService.operador(
                    { 'emp_id':this.courier },
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
            /*},
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );*/
        /*this._userService.getroles(
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
        this._userService.roles(
            {filter:{include:"role",where:{principalId:this.sesion.userId}}},
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

        this._empresaService.cliente(
            {},
            data=>{
                this.clientesTotal=data;
                this.searchCliente({emp_id:this.destinatario.controls['operador'].value});
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

        switch (this.panelBusqSeleccionado) {
            case -1:
            this.panelBusqSeleccionado=-1;
            this.codigo_barra2.controls['codigoBarra'].setValue('');
            this.codigo_barra2.controls['tipo'].setValue(1);
            //this.por_codigo_barra();
            break;
            case 0:
            this.panelBusqSeleccionado=0;
            this.codigo_barra.controls['codigoBarra'].setValue('');
            this.codigo_barra.controls['tipo'].setValue(1);
            //this.por_codigo_barra();
            break;
            case 1:
            this.panelBusqSeleccionado=1;
            this.fileupload = true;
            this.archivo.controls['Archivo'].setValue('');
            this.archivo.controls['tipo'].setValue(1);
            //this.por_archivo();
            break;
            case 2:
            this.panelBusqSeleccionado=2 ;
            this.destinatario.controls['codigo'].setValue('');
            this.destinatario.controls['operador'].setValue('');
            this.destinatario.controls['tipo'].setValue(1);
            //this.por_detinatario();
            break;
            default:
                break;
        }
        //this.Opcion_click('1');
        this.uploader = new FileUploader({ 
            queueLimit: 1,
            url: GLOBAL.url+"consultadocumentos/buscar_archivo" ,
            headers: [{ 
                    name:'Authorization',
                    value:localStorage.getItem('token')
                }]
        });
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {   
            this.formLoading = true;
            this.loading = true;
            form.append('tipo_reg', this.archivo.controls['tipo'].value.toString());
            //form.append('tipo_reg', this.tipo_reg.toString());
        };
        this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
            this.loading = false;
            this.formLoading = false;
            item.remove();
            if(response) { 
                let data = JSON.parse(response);
                if(data.length > 0){
                    for(let i in data){
                        if(data[i].url_imagen){
                            let src0 = data[i].url_imagen;
                            let posicion = src0.indexOf('/');
                            let array = [];
                            while ( posicion != -1 ) {
                                array.push(posicion);
                                posicion = src0.indexOf("/",posicion+1);
                                }
                            console.log("array=",array);
                            let src1 = src0.substring(0, array[2]+1);
                            console.log("src1=",src1);
                            let scr2 = src0.substring(array[2]+1, 500);
                            console.log("src2=",scr2);
                            src0 = src1+'MostrarImagen.ashx?ImageFileName='+scr2;
                            data[i].url_imagen = src0;
                        }
                    }
                    this.rows = data;
                    this.count = data.length;  
                    //this.mostrar_error_alerta(data.length.toString() + ' documentos no pudieron asignarse, revise la lista.');
                    
                    //let alertaSonidoControl:HTMLAudioElement = (<HTMLAudioElement>document.getElementById('alertaSonido'));
                    //alertaSonidoControl.play(); alertaSonidoControl.loop = true;
                    
                }// else { this.showMessage('success', 'Se ha cargado la información', ''); }
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
    }
    ngOnInit(){  /*
            var img = new Image();
            img.addEventListener("load", function(){
                alert( this.naturalWidth +' '+ this.naturalHeight );
            });
            img.src = 'http://192.168.1.38/MostrarImagen.ashx?ImageFileName=Imagenes/2018/DIC/LIMA/20100117526/00013944/0001394400000006.tif';*/
    }

    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
        if(idpanel === 0){
            this.codigo_barra.controls['tipo'].setValue(1);
        }
        if(idpanel === 1){
            this.archivo.controls['tipo'].setValue(1);
            this.fileupload = true;
        }
        if(idpanel === 2){
            this.destinatario.controls['tipo'].setValue(1);
        }
    }

    por_codigo_barra(){}
    por_archivo(){}
    por_destinatario(){
        this.rows = [];
        this.formLoading = true;
        this.loading = true;
        this.count = 0;
        let validdate;
        let day;
        let monthIndex;
        let year;
        let newdate;
        for (let c in this.destinatario.controls) {
            this.destinatario.controls[c].markAsTouched();
        }
        //console.log("codigo:", typeof this.destinatario.controls['codigo'].value);
        if(!this.permiso){
            this.destinatario.controls['tipo'].setValue(1);
        }
        if (this.destinatario.valid) {
            this._consultaDocumentoService.porDestinatario({
                'emp_id': this.destinatario.controls['operador'].value,
                'codigo': this.destinatario.controls['codigo'].value.toString(),
                'tipo_reg': this.destinatario.controls['tipo'].value,//this.tipo_reg,
                'courier': this.courier,
                'suc': this.sucursal,
                'cli_id': this.destinatario.controls['cliente'].value
            }, data=>{
                console.log("data:", data);
                this.formLoading = false; this.loading = false;
                this.rows = data;
                this.rows = [...this.rows];
                for(let i in this.rows){
                    if(this.rows[i].url_imagen){
                        /*let src0 = this.rows[i].url_imagen;
                        let posicion = src0.indexOf('/');
                        let array = [];
                        while ( posicion != -1 ) {
                            array.push(posicion);
                            posicion = src0.indexOf("/",posicion+1);
                         }
                        console.log("array=",array);
                        let src1 = src0.substring(0, array[2]+1);
                        console.log("src1=",src1);
                        let scr2 = src0.substring(array[2]+1, 500);
                        console.log("src2=",scr2);
                        src0 = src1+'MostrarImagen.ashx?ImageFileName='+scr2;
                        this.rows[i].url_imagen = src0;*/
                        /*document.getElementById("cargobutton").innerHTML = '<a href="'+this.rows[i].url_imagen+'"><img class="img-responsive" src="assets/img/cargo.jpeg" alt="img cargo" /></a>';*/
                    }else{
                        document.getElementById("cargobutton").innerHTML = '';
                    }
                }
                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                else { this.count = data.length; }
            }, error=>{
                this.formLoading = false;
                this.loading = false;
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
            );
        }else{
            this.formLoading = false;
            this.loading = false;
        }
    }

    codigoBarra_keypress(sender:HTMLInputElement, event){
        if(event && sender.value){       
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
                    document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length; 
                }
                else { this.showMessage('warning', 'El código: '+sender.value+', ya ha sido agregado a la lista', ''); }
                sender.value='';
                sender.focus();
            }
        }
    }
    eliminarCodigoLista(index){
        this.listcodigosbarra.splice(index,1);
        document.getElementById('lblManualTotal').innerHTML="Total: " + this.listcodigosbarra.length;
    }
    buscar(sender:HTMLInputElement, alertaSonido:HTMLAudioElement) {
        this.rows = [];
        this.selecteddoc = false;
        this.formLoading = true;
        this.loading = true;
        this.count = 0;
        this.queryparams = false;
        if(this.panelBusqSeleccionado == -1){sender.value='';
            for (let c in this.codigo_barra2.controls) {
                this.codigo_barra2.controls[c].markAsTouched();
            }
            if(!this.permiso){
                this.codigo_barra2.controls['tipo'].setValue(1);
            }
            if(this.codigo_barra2.valid){
                this.sender = sender;
                this.query();
            }else{
                this.formLoading = false;
                this.loading = false;
            }
        }
        if(this.panelBusqSeleccionado == 0){
            for (let c in this.codigo_barra.controls) {
                this.codigo_barra.controls[c].markAsTouched();
            }
            if(!this.permiso){
                this.codigo_barra.controls['tipo'].setValue(1);
            }//console.log("2:",this.codigo_barra.valid);
            if(this.codigo_barra.valid){
                if(this.codigo_barra.controls['codigoBarra'].value){
                    this.listcodigosbarra.splice(0,0,this.codigo_barra.controls['codigoBarra'].value); 
                }//console.log("3:",this.listcodigosbarra);
                this.codigosBarra = '';//console.log("4:",this.permiso);
                //console.log("5:",this.codigo_barra.controls['tipo'].value);
                //if (this.codigo_barra.valid) {
                    if(this.listcodigosbarra.length==0){ 
                        this.formLoading = false; this.loading = false;
                        alertaSonido.play();
                        this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
                    }
                    else {
                        this.query();
                    }            
                //}else{
                    
                //}
            }else{
                this.formLoading = false;
                this.loading = false;
            }
        }
        if(this.panelBusqSeleccionado == 1){
            for (let c in this.archivo.controls) {
                this.archivo.controls[c].markAsTouched();
            }
            if(!this.permiso){
                this.archivo.controls['tipo'].setValue(1);
            }
            if (this.archivo.valid) {
                if(this.uploader.queue.length == 0){
                    this.formLoading = false; this.loading = false;
                    alertaSonido.play();
                    this.showMessage('error', 'No ha especificado el archivo a procesar', '');
                }else {
                    this.query();
                } 
            }else{
                this.formLoading = false;
                this.loading = false;
            }
        }
        /*if(this.frmanual.controls['codigoBarra'].value){
            this.listcodigosbarra.splice(0,0,this.frmanual.controls['codigoBarra'].value); 
        }
        this.codigosBarra = '';
        if (this.frmanual.valid) {
            if((values['Opcion']=='1') && (this.listcodigosbarra.length==0)){ 
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el/los código(s) de barras', '');
            }else if(values['Opcion']=='2'&& this.uploader.queue.length == 0){
                this.formLoading = false; this.loading = false;
                alertaSonido.play();
                this.showMessage('error', 'No ha especificado el archivo a procesar', '');
            }
            else {
                this.query();
            }            
        }else{
            this.formLoading = false;
            this.loading = false;
        }*/
    }
    query(){
        this.formLoading = true;
        this.loading = true;        
        let validdate;
        let day;
        let monthIndex;
        let year;
        let newdate;
        if(this.panelBusqSeleccionado == -1){
            this.consultabasica.show();
            this._consultaDocumentoService.buscarbasico({
                'cod_barra': this.codigo_barra2.controls['codigoBarra'].value,
                'tipo_reg': this.codigo_barra2.controls['tipo'].value,
                'suc': this.sucursal
            }, data=>{
                this.formLoading = false;
                this.loading = false;                
                /*if(data[0].fecha_corte){              
                    validdate = this.isValidDate(data[0].fecha_corte);
                    if(!validdate){                    
                        day = data[0].fecha_corte.getDate();
                        monthIndex = data[0].fecha_corte.getMonth();
                        year = data[0].fecha_corte.getFullYear();
                        newdate = day+'/'+monthIndex+'/'+year;
                        data[0].fecha_corte = newdate;
                    }
                }
                if(data[0].fecha_os){
                    validdate = this.isValidDate(data[0].fecha_os);
                    if(!validdate){                    
                        day = data[0].fecha_os.getDate();
                        monthIndex = data[0].fecha_os.getMonth();
                        year = data[0].fecha_os.getFullYear();
                        newdate = day+'/'+monthIndex+'/'+year;
                        data[0].fecha_os = newdate;
                    }
                }*/
                
                this.rows3 = data;
                this.rows3 = [...this.rows3];
                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                else {
                    if(data[0].url_imagen){console.log("url",data[0].url_imagen);
                        let src0 = data[0].url_imagen;//document.getElementById('a').getAttribute("href");
                        let posicion = src0.indexOf('/');
                        let array = [];
                        while ( posicion != -1 ) {
                            array.push(posicion);
                            posicion = src0.indexOf("/",posicion+1);
                        }
                        console.log("array=",array);
                        let src1 = src0.substring(0, array[2]+1);
                        console.log("src1=",src1);
                        let scr2 = src0.substring(array[2]+1, 500);
                        console.log("src2=",scr2);
                        src0 = src1+'MostrarImagen.ashx?ImageFileName='+scr2;
                        this.rows3[0].url_imagen = src0;
                    }
                    //console.log("this.rows",this.rows3);
                }
            }, error=>{
                this.formLoading = false;
                this.loading = false;         
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            });
        }
        if(this.panelBusqSeleccionado == 0){
        /*if(this.codigo_barra){
            this.values = this.codigo_barra.value;
        }*/
        //if(this.values['Opcion']=='1'){ 
            //if(!this.queryparams){    
                for (let index = this.listcodigosbarra.length; index > 0; index--) {
                    this.codigosBarra = this.codigosBarra + (this.codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
                }
            /*}else{
                this.codigosBarra = this.codigosBarra2;
                for (let index = this.listcodigosbarra.length; index > 0; index--) {
                    this.codigosBarra = this.codigosBarra + (this.codigosBarra != '' ? ',':'') + this.listcodigosbarra[(index-1)];
                }
            }*/
            this.listcodigosbarra = [];
            this._consultaDocumentoService.buscar({
                'cod_barra': this.codigosBarra,
                'tipo_reg': this.codigo_barra.controls['tipo'].value,//this.tipo_reg,
                'suc': this.sucursal
                //'role': this.role
            }, data=>{
                this.codigosBarra2 = this.codigosBarra;
                this.codigosBarra = '';
                this.formLoading = false; this.loading = false;
                for(let i in data){
                    /*if(data[i].fecha_carga_imagen){              
                        validdate = this.isValidDate(data[i].fecha_carga_imagen);
                        if(!validdate){                    
                            day = data[i].fecha_carga_imagen.getDate();
                            monthIndex = data[i].fecha_carga_imagen.getMonth();
                            year = data[i].fecha_carga_imagen.getFullYear();
                            newdate = day+'/'+monthIndex+'/'+year;
                            data[i].fecha_carga_imagen = newdate;
                        }
                    }
                    if(data[i].fecha_descarga){
                        validdate = this.isValidDate(data[i].fecha_descarga);
                        if(!validdate){                    
                            day = data[i].fecha_descarga.getDate();
                            monthIndex = data[i].fecha_descarga.getMonth();
                            year = data[i].fecha_descarga.getFullYear();
                            newdate = day+'/'+monthIndex+'/'+year;
                            data[i].fecha_descarga = newdate;
                        }
                    }
                    if(data[i].fecha_entrega){
                        validdate = this.isValidDate(data[i].fecha_entrega);
                        if(!validdate){                    
                            day = data[i].fecha_entrega.getDate();
                            monthIndex = data[i].fecha_entrega.getMonth();
                            year = data[i].fecha_entrega.getFullYear();
                            newdate = day+'/'+monthIndex+'/'+year;
                            data[i].fecha_entrega = newdate;
                        }
                    }*/
                    if(data[i].url_imagen){
                        let src0 = data[i].url_imagen;
                        let posicion = src0.indexOf('/');
                        let array = [];
                        while ( posicion != -1 ) {
                            array.push(posicion);
                            posicion = src0.indexOf("/",posicion+1);
                            }
                        console.log("array=",array);
                        let src1 = src0.substring(0, array[2]+1);
                        console.log("src1=",src1);
                        let scr2 = src0.substring(array[2]+1, 500);
                        console.log("src2=",scr2);
                        src0 = src1+'MostrarImagen.ashx?ImageFileName='+scr2;
                        data[i].url_imagen = src0;
                    }
                }
                this.rows = data;
                this.rows = [...this.rows];
                
                /*for(let i in this.rows){
                    if(this.rows[i].url_imagen){
                        console.log("hola");
                        document.getElementById("cargobutton").innerHTML = '<a href="'+this.rows[i].url_imagen+'"><img class="img-responsive" src="assets/img/cargo.jpeg" alt="img cargo" /></a>';
                    }else{
                        document.getElementById("cargobutton").innerHTML = '';
                    }
                }*/
                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                else { this.count = data.length; }
                document.getElementById('lblManualTotal').innerHTML='';         
            }, error=>{    
                document.getElementById('lblManualTotal').innerHTML='';
                this.formLoading = false;
                this.loading = false;         
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            });
        }else{
            this.listcodigosbarra = [];
            this.uploader.queue.forEach(element => {
                element.upload();
                this.lbltituloprocesados='No Descargados';
            });
        }
        
    }

    isValidDate(date) {
        let temp = date.split('/');
        let d = new Date(temp[1] + '/' + temp[0] + '/' + temp[2]);
         return (d && (d.getMonth() + 1) == temp[1] && d.getDate() == Number(temp[0]) && d.getFullYear() == Number(temp[2]));
    }
    modificar(event, alertaSonido:HTMLAudioElement) {  }
    //grilla
    onPage(event){ 
        this.query();
    }
    onSort(event){  }
    onActivate(event) {console.log("eventeee:",event);
        //if(event.type === 'dblclick'){
            this.selecteddoc = true;
            this.formLoading = true;
            this.loading2 = true;
            this.rows2 = [];
            let ul = document.getElementById("ul");
            ul.innerHTML = '';
            switch (this.panelBusqSeleccionado) {
                case -1:
                this.tipo_reg = this.codigo_barra2.controls['tipo'].value;
                break;
                case 0:
                this.tipo_reg = this.codigo_barra.controls['tipo'].value;
                break;
                case 1:
                this.tipo_reg = this.archivo.controls['tipo'].value;
                break;
                case 2:
                this.tipo_reg = this.destinatario.controls['tipo'].value;
                break;
                default:
                    break;
            }
            document.getElementById("cod_bar").innerHTML = "<b>Código de barra</b>: "+event.codigo_barra;
            this._consultaDocumentoService.detalle({
                'doc_id': event.doc_id,
                'tipo_reg': this.tipo_reg,
                'ord_id': event.ord_id
            }, data=>{
                this.loading2 = false;
                
                //document.getElementById("ubuscarl").innerHTML = "";
                //console.log("2");
                //document.getElementById("divtimeline").innerHTML = '';
                this.rows2 = data;
                if(this.rows2.length > 0){
                    let li1;
                    let li2;
                    
                    for(let i = 0; i < this.rows2.length; i++){
                        //li1 = document.createElement("li");
                        //li1.setAttribute('class', 'timeline-separator');
                        li2 = document.createElement("li");
                        
                        li2.innerHTML = '<div class="timeline-badge primary"><em class="fa fa-users"></em></div><div class="timeline-card"><div id="popover" class="popover left"><h4 class="popover-header">'
                                        +this.rows2[i].titulo+
                                        '</h4><div></div><div class="popover-body"><p>'
                                        +this.rows2[i].contenido+
                                        '<br/><small></small></p></div></div></div>';                
                        if(i%2 != 0){
                            li2.setAttribute('class', 'timeline-inverted');
                        }
                        console.log("li2: ",li2);
                        //ul.appendChild(li1);
                        ul.appendChild(li2);
                    }                
                }
            }, error=>{
                this.loading2 = false;
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading2 = false;
            });
            this.timelinemodal.show();
        //}
    }
    onSelect(event) {
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
    mostrar_error_alerta(sMensaje:string){ this.alertDocumentos.show(); document.getElementById('alertDocumentos_msj').innerHTML=sMensaje; }

    imagepreview(value){
        this.loading2 = true;
        this.imgmodal.show();
        let imagemodal = document.getElementById("imagemodal");
        imagemodal.innerHTML = '';
        imagemodal.innerHTML = '<a href="#" download="'+value.codigo_barra+'.tif" type="media_type"><img class="img-responsive" src="'+value.url_imagen+'" alt="img cargo" style="width:100%;height:auto !important"/></a>';
        this.loading2 = false;
        /*let src0 = value.url_imagen;
        let posicion = src0.indexOf('/');
        let array = [];
        while ( posicion != -1 ) {
            array.push(posicion);
            posicion = src0.indexOf("/",posicion+1);
            }
        console.log("array=",array);
        let src1 = src0.substring(0, array[2]+1);
        console.log("src1=",src1);
        let scr2 = src0.substring(array[2]+1, 500);
        console.log("src2=",scr2);
        src0 = src1+'MostrarImagen.ashx?ImageFileName='+scr2;

        var downloadLink = document.createElement("a");
        downloadLink.target="popup"
        downloadLink.href = src0;
        //downloadLink.download = value.codigo_barra;
        downloadLink.setAttribute('download', value.codigo_barra);

        //document.body.appendChild(downloadLink);
        //downloadLink.click();
        //document.body.removeChild(downloadLink);
        window.open(src0,value.codigo_barra,'width:736px;height:600px,resizable=1');*/
    };

    searchCliente(event){
        
        if(event!=1){
            this.listclientes = [];
            this.destinatario.controls['cliente'].setValue('');
        
            if(event){
                this.listclientes = [];
                for(let i = 0;i<this.clientesTotal.length;i++){
                    if(this.clientesTotal[i].emp_id_operador == this.destinatario.controls['operador'].value){
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

    timelinemodalhide(){
        document.getElementById("ul").innerHTML = '';
        this.rows2 = [];
        this.timelinemodal.hide();
    }


    /*msieversion()// this function for recognize ie from other browser
    { var ua = window.navigator.userAgent;//inner commands
    var msie = ua.indexOf("MSIE "); 
    if (msie > 0) // If Internet Explorer, return version number 
    {
        return true;
        //alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
    }  
    else  // If another browser, return 0  
    {  
        return false;  
        //alert('otherbrowser');
    }
    return false;
    }*/
}