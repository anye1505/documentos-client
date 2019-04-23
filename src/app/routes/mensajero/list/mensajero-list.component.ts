import { Component, OnInit, ViewEncapsulation, ViewChild,TemplateRef  } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

import { ModalDirective,BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TareaService } from '../../../services/tarea.service';
import { MensajeroService } from '../../../services/mensajero.service';
import { PersonaService } from '../../../services/persona.service';
import { UbigeoService } from '../../../services/ubigeo.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

import { User,UserEdit,UserResetPassword } from '../../../models/user';

import { Role,RoleMapping } from '../../../models/role';
import { GLOBAL } from '../../../global';

declare var $: any;

@Component({
    selector: 'mensajero-list',
    templateUrl: './mensajero-list.component.html',
    styleUrls: ['./mensajero-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MensajeroListComponent implements OnInit {

    public filterRows:any;
    public modalRef: BsModalRef;
    public formLoading:boolean;
    public identity;


    public idUserRole;
    public roles:Role[];
    public rolesUsuario:RoleMapping[];
    public usuarios:User[];
    public userEdit:UserEdit;
    public userResetPassword:UserResetPassword

    public valForm: FormGroup;
    public valFormChangePassword: FormGroup; 

    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });
    suc_id:number=0;
    sesion;
    page:number=-1;

    public limit=10;
    public count=0;
    public loading: boolean = false;
    public toasActive;
    public rows = [];
    public rows2 = [];
    public columns = [];
    public con;


    public empresas:any;
    public sucursales:any;

    /*Form Search*/
    public valFormSearch:any;

    /*Form Nuevo Mensajero*/
    public valFormNuevoMensajero:any;
    public tipoDocumentos:any;
    public imagen:any;
    public distritos:any;
    public situacion = [{id:0,nombre:'LOCACION'},{id:1,nombre:'PLANILLA'}];;

    @ViewChild(DatatableComponent) table: DatatableComponent;
    @ViewChild('modalNuevoMensajero') modalNuevoMensajero: ModalDirective;

    ngOnInit() {

    }
    constructor(
        fb: FormBuilder,
        private _mensajeroService:MensajeroService,
        private toasterService: ToasterService,
        public _tareaService:TareaService,
        public _personaService:PersonaService,
        public _ubigeoService:UbigeoService,
        private _userService: UserService,
        private _authService: AuthService
    ) {
        this.sesion = this._authService.getIdentity();
        this.filterRows = {};
        this.valFormSearch = fb.group({
            'documento': ['',Validators.compose([])],
            'nombre':['',Validators.compose([])],
            'apellido':['',Validators.compose([])],

            /*'hasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'estado': ['',Validators.compose([])],
            'cliente': ['',Validators.compose([])],
            'operador': ['',Validators.compose([])],
            'pro_nro_orden_courier': ['',Validators.compose([])],
            'pro_orden_operador':['',Validators.compose([])]*/
        });
        this.valFormNuevoMensajero = fb.group({
            'men_id': [0,Validators.compose([])],    
            'per_id': [0,Validators.compose([])],    
            'per_tipo_documento': ['',Validators.compose([Validators.required])],
            'per_nro_documento': ['',Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9]+$')])],
            'per_nombre1': [{value: '', disabled: true},Validators.compose([Validators.required,Validators.pattern('^[a-zA-ZñÑ ]+$')])],
            'per_nombre2': [{value: '', disabled: true},Validators.compose([Validators.pattern('^[a-zA-ZñÑ ]+$')])],
            'per_apellido1': [{value: '', disabled: true},Validators.compose([Validators.required,Validators.pattern('^[a-zA-ñÑZ ]+$')])],
            'per_apellido2': [{value: '', disabled: true},Validators.compose([Validators.required,Validators.pattern('^[a-zA-ZñÑ ]+$')])],
            'per_email':[{value: '', disabled: true},Validators.compose([CustomValidators.email])],
            'per_telefono1':[{value: '', disabled: true},Validators.compose([Validators.pattern('^[0-9]+$')])],
            'per_telefono2':[{value: '', disabled: true},Validators.compose([Validators.pattern('^[0-9]+$')])],
            'per_fecha_nacimiento':[{value: '', disabled: true},Validators.compose([Validators.required,CustomValidators.date])],
            'imagen':[{value: '', disabled: true},Validators.compose([])],
            'per_direccion':[{value: '', disabled: true},Validators.compose([])],
            'ubi_id_distrito':[{value: 0, disabled: true},Validators.compose([])],
            'men_activo':[{value: false, disabled: true},Validators.compose([])],
            'cod_mensajero_courier':[{value: 0, disabled: true},Validators.compose([])],
            'men_situacion_laboral':[{value: 0, disabled: true},Validators.compose([])]

            /*'hasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'estado': ['',Validators.compose([])],
            'cliente': ['',Validators.compose([])],
            'operador': ['',Validators.compose([])],
            'pro_nro_orden_courier': ['',Validators.compose([])],
            'pro_orden_operador':['',Validators.compose([])]*/
        });
        this.tipoDocumentos = [
            {
                value:'DNI'
            },
            {
                value:'PASAPORTE'
            }
        ];

        this._ubigeoService.find(
            {}
            ,
            data=>{
                this.distritos = data;
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

        this._userService.find({ id : this.sesion.userId },
            data=>{
                this.suc_id = data['suc_id'];
                this.updateRows(1); },
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
    
    onPage(event){
        this.page = event.offset+1;
        this.updateRows(event.offset+1);
    }

    onSort(event){
        console.log(event);
    }

    updateRows(page=1){

        if(this.con!=null){
            console.log("abort");
            this.con.$abortRequest();
        }
        /*
        if(this.timeOut!=null){
            clearTimeout(this.timeOut);
        }*/
        

        console.log("sucursal",this.suc_id);
        //this.timeOut = setTimeout(function(){
            this.loading=true;
            let param={
                limit:this.limit,
               // include:['persona'],
                order:'men_id DESC'
            };

            let where={}
            console.log("filter",this.filterRows)
            if(this.filterRows && (this.filterRows.documento || this.filterRows.nombre || this.filterRows.apellido)){                
                if(this.filterRows.documento ){console.log("1")
                    where["per_nro_documento"]=this.filterRows.documento;
                    //where["persona.per_nro_documento"]=this.filterRows.documento;
                }
                if(this.filterRows.nombre ){console.log("2")
                    //where["per_nombre1"]={"like":"%"+this.filterRows.nombre+"%","options":"i"};

                    //where["per_nombre1"]={"regexp":"/.*"+this.filterRows.nombre+".*/i"};
                    //where["per_nombre2"]={"like":"%"+this.filterRows.nombre+"%","options":"i"};
                    where['or'] = [
                        {per_nombre1:{"regexp":"/.*"+this.filterRows.nombre+".*/i"}},
                        {per_nombre2:{"regexp":"/.*"+this.filterRows.nombre+".*/i"}},
                        {and: [{suc_id:this.suc_id}]}
                    ]
                }
                if(this.filterRows.apellido ){console.log("3")
                    //where["per_apellido1"]={"like":"%"+this.filterRows.apellido+"%","options":"i"};
                    where['or'] = [
                        {per_apellido1:{"regexp":"/.*"+this.filterRows.apellido+".*/i"}},
                        {per_apellido2:{"regexp":"/.*"+this.filterRows.apellido+".*/i"}},
                        {and: [{suc_id:this.suc_id}]}
                    ]
                    //where["per_apellido2"]={"like":"%"+this.filterRows.apellido+"%","options":"i"};
                }
                    //where["per_nro_documento"]={"like":"%"+this.filterRows+"%","options":"i"};
                //

                //
            }else{
                where['suc_id'] = this.suc_id;
                param["where"]=where;
            }
            //where['suc_id'] = this.suc_id;

            param['include'] = {
                relation:'persona',
                scope:{
                    //where:where,
                    include:'ubigeo'
                }
            }

            if(page > 1){
                
                param["offset"]=(page*this.limit)-this.limit;
            }

            console.log("where:",where);
            this.con=this._mensajeroService.count(
                {where:where},
                count=>{console.log("count:",count.count);
                    if(count.count>0){
                        this.con=this._mensajeroService.query(
                            {filter:param},
                            data=>{
                                let dataTemp = [];
                                for(let i=0;i<data.length;i++){
                                    if(data[i].persona){                                        
                                        for (var key in data[i].persona) { 
                                            data[i][key] = data[i].persona[key];
                                        }
                                        dataTemp.push(data[i]);
                                    }
                                }console.log("dataTemp",dataTemp);
                                this.rows=dataTemp;
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
        //}, 1000);
    }

    btnModificar(row){
        console.log("row editar:",row);
        //if(row.persona.per_foto != null){
        if(row.per_foto != null && row.per_foto != ''){
            //this.imagen = GLOBAL.url +'mensajeros/foto?nombre='+row.persona.per_foto;
            this.imagen = GLOBAL.url +'mensajeros/foto?nombre='+row.per_foto;
        }else{
            this.imagen = '';
        }
        //let dateTemp =  new Date(row.persona.per_fecha_nacimiento);
        let dateTemp =  new Date(row.per_fecha_nacimiento);

        //console.log(dateTemp);
        /* Modificacion de anyelys: Todos los row.persona... se cambiaron y estan sin .persona */
        this.valFormNuevoMensajero.controls['per_tipo_documento'].setValue(row.per_tipo_documento);
        this.valFormNuevoMensajero.controls['per_nro_documento'].setValue(row.per_nro_documento);
        this.valFormNuevoMensajero.controls['per_nombre1'].setValue(row.per_nombre1);
        this.valFormNuevoMensajero.controls['per_nombre2'].setValue(row.per_nombre2);
        this.valFormNuevoMensajero.controls['per_apellido1'].setValue(row.per_apellido1);
        this.valFormNuevoMensajero.controls['per_apellido2'].setValue(row.per_apellido2);
        this.valFormNuevoMensajero.controls['per_email'].setValue(row.per_email);
        this.valFormNuevoMensajero.controls['per_telefono1'].setValue(row.per_telefono1);
        this.valFormNuevoMensajero.controls['per_telefono2'].setValue(row.per_telefono2);
        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].setValue(dateTemp.toISOString().substring(0, 10));
        this.valFormNuevoMensajero.controls['per_id'].setValue(row.per_id);
        this.valFormNuevoMensajero.controls['men_id'].setValue(row.men_id);

        this.valFormNuevoMensajero.controls['men_activo'].setValue(row.men_activo);
        this.valFormNuevoMensajero.controls['ubi_id_distrito'].setValue(row.ubi_id_distrito);
        this.valFormNuevoMensajero.controls['per_direccion'].setValue(row.per_direccion);
        this.valFormNuevoMensajero.controls['cod_mensajero_courier'].setValue(row.cod_mensajero_courier);
        this.valFormNuevoMensajero.controls['men_situacion_laboral'].setValue(row.men_situacion_laboral);
        this.valFormNuevoMensajero.controls['imagen'].setValue('');


        this.valFormNuevoMensajero.controls['per_nombre1'].enable();
        this.valFormNuevoMensajero.controls['per_nombre2'].enable();
        this.valFormNuevoMensajero.controls['per_apellido1'].enable();
        this.valFormNuevoMensajero.controls['per_apellido2'].enable();
        this.valFormNuevoMensajero.controls['per_email'].enable();
        this.valFormNuevoMensajero.controls['per_telefono1'].enable();
        this.valFormNuevoMensajero.controls['per_telefono2'].enable();
        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].enable();
        this.valFormNuevoMensajero.controls['per_id'].enable();
        this.valFormNuevoMensajero.controls['men_id'].enable();
        this.valFormNuevoMensajero.controls['imagen'].enable();

        this.valFormNuevoMensajero.controls['men_activo'].enable();
        this.valFormNuevoMensajero.controls['ubi_id_distrito'].enable();
        this.valFormNuevoMensajero.controls['per_direccion'].enable();

        this.valFormNuevoMensajero.controls['cod_mensajero_courier'].enable();
        this.valFormNuevoMensajero.controls['men_situacion_laboral'].enable();
        this.modalNuevoMensajero.show();
    }

    btnNuevo(){

        this.imagen = '';

        this.valFormNuevoMensajero.controls['per_tipo_documento'].setValue('');
        this.valFormNuevoMensajero.controls['per_nro_documento'].setValue('');
        this.valFormNuevoMensajero.controls['per_nombre1'].setValue('');
        this.valFormNuevoMensajero.controls['per_nombre2'].setValue('');
        this.valFormNuevoMensajero.controls['per_apellido1'].setValue('');
        this.valFormNuevoMensajero.controls['per_apellido2'].setValue('');
        this.valFormNuevoMensajero.controls['per_email'].setValue('');
        this.valFormNuevoMensajero.controls['per_telefono1'].setValue('');
        this.valFormNuevoMensajero.controls['per_telefono2'].setValue('');
        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].setValue('');
        this.valFormNuevoMensajero.controls['per_id'].setValue(0);
        this.valFormNuevoMensajero.controls['men_id'].setValue(0);
        this.valFormNuevoMensajero.controls['imagen'].setValue('');

        this.valFormNuevoMensajero.controls['men_activo'].setValue(false);
        this.valFormNuevoMensajero.controls['ubi_id_distrito'].setValue(0);
        this.valFormNuevoMensajero.controls['per_direccion'].setValue('');
        this.valFormNuevoMensajero.controls['cod_mensajero_courier'].setValue('');
        this.valFormNuevoMensajero.controls['men_situacion_laboral'].setValue('');

        this.valFormNuevoMensajero.controls['per_nombre1'].disable();
        this.valFormNuevoMensajero.controls['per_nombre2'].disable();
        this.valFormNuevoMensajero.controls['per_apellido1'].disable();
        this.valFormNuevoMensajero.controls['per_apellido2'].disable();
        this.valFormNuevoMensajero.controls['per_email'].disable();
        this.valFormNuevoMensajero.controls['per_telefono1'].disable();
        this.valFormNuevoMensajero.controls['per_telefono2'].disable();
        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].disable();
        this.valFormNuevoMensajero.controls['per_id'].disable();
        this.valFormNuevoMensajero.controls['men_id'].disable();
        this.valFormNuevoMensajero.controls['imagen'].disable();

        this.valFormNuevoMensajero.controls['men_activo'].disable();
        this.valFormNuevoMensajero.controls['ubi_id_distrito'].disable();
        this.valFormNuevoMensajero.controls['per_direccion'].disable();
        this.valFormNuevoMensajero.controls['cod_mensajero_courier'].disable();
        this.valFormNuevoMensajero.controls['men_situacion_laboral'].disable();

        this.modalNuevoMensajero.show();
    }

    changeDNI(){
        if(this.valFormNuevoMensajero.controls['per_nro_documento'].value != '' && 
            this.valFormNuevoMensajero.controls['per_tipo_documento'].value != '' ){

                this.formLoading = true;
                this._personaService.find(
                {
                    filter:{
                        where:{
                            per_nro_documento:this.valFormNuevoMensajero.controls['per_nro_documento'].value ,
                            per_tipo_documento:this.valFormNuevoMensajero.controls['per_tipo_documento'].value
                        }
                    }
                },  
                (persona)  =>  {          
                    //console.log(persona);  
                    this.formLoading = false;
                    this.valFormNuevoMensajero.controls['men_activo'].enable();
                    this.valFormNuevoMensajero.controls['cod_mensajero_courier'].enable();
                    this.valFormNuevoMensajero.controls['men_situacion_laboral'].enable();
                    if(persona.length != 1){
                        this.imagen = '';
                        //console.log(this.valFormNuevoMensajero.controls['per_nombre1']);

                        this.valFormNuevoMensajero.controls['per_nombre1'].setValue('');
                        this.valFormNuevoMensajero.controls['per_nombre2'].setValue('');
                        this.valFormNuevoMensajero.controls['per_apellido1'].setValue('');
                        this.valFormNuevoMensajero.controls['per_apellido2'].setValue('');
                        this.valFormNuevoMensajero.controls['per_email'].setValue('');
                        this.valFormNuevoMensajero.controls['per_telefono1'].setValue('');
                        this.valFormNuevoMensajero.controls['per_telefono2'].setValue('');
                        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].setValue('');
                        this.valFormNuevoMensajero.controls['per_id'].setValue(0);
                        //this.valFormNuevoMensajero.controls['men_id'].setValue(0);
                        this.valFormNuevoMensajero.controls['imagen'].setValue('');

                        this.valFormNuevoMensajero.controls['men_activo'].setValue(false);
                        this.valFormNuevoMensajero.controls['ubi_id_distrito'].setValue(0);
                        this.valFormNuevoMensajero.controls['per_direccion'].setValue('');

                        this.valFormNuevoMensajero.controls['per_nombre1'].enable();
                        this.valFormNuevoMensajero.controls['per_nombre2'].enable();
                        this.valFormNuevoMensajero.controls['per_apellido1'].enable();
                        this.valFormNuevoMensajero.controls['per_apellido2'].enable();
                        this.valFormNuevoMensajero.controls['per_email'].enable();
                        this.valFormNuevoMensajero.controls['per_telefono1'].enable();
                        this.valFormNuevoMensajero.controls['per_telefono2'].enable();
                        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].enable();
                        this.valFormNuevoMensajero.controls['per_id'].enable();
                        this.valFormNuevoMensajero.controls['men_id'].enable();


                        this.valFormNuevoMensajero.controls['imagen'].enable();

                        this.valFormNuevoMensajero.controls['men_activo'].enable();
                        this.valFormNuevoMensajero.controls['ubi_id_distrito'].enable();
                        this.valFormNuevoMensajero.controls['per_direccion'].enable();

                    }else{
                        let dateTemp =  new Date(persona[0].per_fecha_nacimiento);
                        this.valFormNuevoMensajero.controls['per_nombre1'].setValue(persona[0].per_nombre1);
                        this.valFormNuevoMensajero.controls['per_nombre2'].setValue(persona[0].per_nombre2);
                        this.valFormNuevoMensajero.controls['per_apellido1'].setValue(persona[0].per_apellido1);
                        this.valFormNuevoMensajero.controls['per_apellido2'].setValue(persona[0].per_apellido2);
                        this.valFormNuevoMensajero.controls['per_email'].setValue(persona[0].per_email);
                        this.valFormNuevoMensajero.controls['per_telefono1'].setValue(persona[0].per_telefono1);
                        this.valFormNuevoMensajero.controls['per_telefono2'].setValue(persona[0].per_telefono2);

                        this.valFormNuevoMensajero.controls['ubi_id_distrito'].setValue(persona[0].ubi_id_distrito);
                        this.valFormNuevoMensajero.controls['per_direccion'].setValue(persona[0].per_direccion);
                       



                        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].setValue(dateTemp.toISOString().substring(0, 10));
                        //this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].setValue(persona[0].per_fecha_nacimiento);
                        this.valFormNuevoMensajero.controls['per_id'].setValue(persona[0].per_id);
                        if(persona[0].per_foto != null){
                            this.imagen = GLOBAL.url+'mensajeros/foto?nombre='+persona[0].per_foto;
                        }else{
                            this.imagen = '';
                        }
                        this.valFormNuevoMensajero.controls['imagen'].setValue('');
                        //this.valFormNuevoMensajero.controls['men_id'].setValue(0);
                        //this.valFormNuevoMensajero.controls['per_foto'].setValue();
                        //disable
                        this.valFormNuevoMensajero.controls['per_nombre1'].enable();
                        this.valFormNuevoMensajero.controls['per_nombre2'].enable();
                        this.valFormNuevoMensajero.controls['per_apellido1'].enable();
                        this.valFormNuevoMensajero.controls['per_apellido2'].enable();
                        this.valFormNuevoMensajero.controls['per_email'].enable();
                        this.valFormNuevoMensajero.controls['per_telefono1'].enable();
                        this.valFormNuevoMensajero.controls['per_telefono2'].enable();
                        this.valFormNuevoMensajero.controls['per_fecha_nacimiento'].enable();
                        this.valFormNuevoMensajero.controls['per_id'].enable();
                        this.valFormNuevoMensajero.controls['men_id'].enable();
                        this.valFormNuevoMensajero.controls['imagen'].enable();

                        this.valFormNuevoMensajero.controls['ubi_id_distrito'].enable();
                        this.valFormNuevoMensajero.controls['per_direccion'].enable();

                    }
                },
                error => {
                  if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');                
                  }else{
                      if(error.status===422){
                        this.toasterService.pop('warning', "Usuario y/o email ya existe", '');                
                      }else{
                        this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                    }
                  }
                  this.formLoading = false;
                });
        }else{
            this.showMessage('warning','Debe ingresar tipo y número de documento.','');
        }
    }

    submitFormNuevoMensajero($ev, value: any) {
        this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valFormNuevoMensajero.controls) {
            this.valFormNuevoMensajero.controls[c].markAsTouched();
        }
        if (this.valFormNuevoMensajero.valid) {
            value.per_fecha_nacimiento = value.per_fecha_nacimiento/*+' 00:00:00.341976-05'*/;
            if(this.valFormNuevoMensajero.controls['men_id'].value > 0){
                value.cod_mensajero_courier = (value.cod_mensajero_courier==null ? '':value.cod_mensajero_courier);
                value.men_situacion_laboral = (value.men_situacion_laboral==null ? '':value.men_situacion_laboral);
                value.per_direccion = (value.per_direccion==null ? '':value.per_direccion);
                value.ubi_id_distrito = (value.ubi_id_distrito==null || value.ubi_id_distrito=='' ? 0:value.ubi_id_distrito);
                this._mensajeroService.actualizar(
                value,  
                (mensajero)  =>  {            
                    this.toasterService.pop('success', "Mensajero actualizado", "");
                    this.formLoading = false;
                    this.filterRows = null;
                    this.updateRows(1);
                    this.modalNuevoMensajero.hide();
                },
                error => {
                   // console.log(error);
                  if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');
                  }else{
                      if(error.status===500){
                          if(error["_body"]){
                              let rpta = JSON.parse(error["_body"]);
                                this.toasterService.pop('warning',rpta.error.message, '');

                          }else{
                            this.toasterService.pop('warning',"Vuelvalo a intentar en unos minutos", '');
                          }
                            //this.toasterService.pop('warning', error.error.message, '');                
                      }else{
                        this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                    }
                  }
                  this.formLoading = false;
                });
            }else{
                this._mensajeroService.crear(
                value,
                (mensajero)  =>  {            
                    this.toasterService.pop('success', "Mensajero creado", "");
                    this.formLoading = false;
                    this.filterRows = null;
                    this.updateRows(1);
                    this.modalNuevoMensajero.hide();
                },
                error => {
                  //  console.log(error);
                  if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');
                  }else{
                      if(error.status===500){
                          if(error["_body"]){
                              let rpta = JSON.parse(error["_body"]);
                                this.toasterService.pop('warning',rpta.error.message, '');

                          }else{
                            this.toasterService.pop('warning',"Vuelvalo a intentar en unos minutos", '');
                          }
                            //this.toasterService.pop('warning', error.error.message, '');                
                      }else{
                        this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                    }
                  }
                  this.formLoading = false;
                });
            }     
            
        }else{
            this.formLoading = false;
        }
        
    }

    submitFormSearch($ev, value: any){

        $ev.preventDefault();
        for (let c in this.valFormSearch.controls) {
            this.valFormSearch.controls[c].markAsTouched();
        }
        if (this.valFormSearch.valid) {
            this.filterRows = {};
            if(value.documento != '' || value.nombre != '' || value.apellido != ''){
                if(value.documento != ''){
                    this.filterRows['documento'] = value.documento;
                }
                if(value.nombre != ''){
                    this.filterRows['nombre'] = value.nombre;
                }
                if(value.apellido != ''){
                    this.filterRows['apellido'] = value.apellido;
                }
                this.updateRows2();
            }else{
                this.rows2 = []
                if(this.page != -1){this.updateRows(this.page);}
                else{this.updateRows(1);}
            }
        }
    }

    updateRows2(){
        this.loading=true;
        this._mensajeroService.buscar(
            {
                suc_id:this.suc_id,
                nombre:this.filterRows.nombre,
                apellido:this.filterRows.apellido,
                documento:this.filterRows.documento
            },
            data=>{
                this.loading=false;
                console.log("busqueda",data);
                this.rows2=data;
                this.rows2 = [...this.rows2];
                this.count = data.length;
                this.loading=false;
            },error=>{this.loading=false;}
        );
    }
    
    handleFileRegistrar(event){

          let reader = new FileReader();
         
          if(event.target.files && event.target.files.length) {
            const [file] = event.target.files;
            reader.readAsDataURL(file);
            let name =file.name;
            name = name.substr(0,name.lastIndexOf('.') );
            name = name.replace(/P| |!/g,"-");
          
            reader.onload = () => {
                this.valFormNuevoMensajero.controls['imagen'].setValue(reader.result);
                //this.valFormNuevoMensajero.controls['imagen_nombre'].setValue(name);
                /*
              this.formGroup.patchValue({
                file: reader.result
              });
              
              // need to run CD since file load runs outside of zone
              this.cd.markForCheck();
              */
            };
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
