import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { EmpresaService } from '../../../services/empresa.service';
import { Role,RoleMapping } from '../../../models/role';
import * as $ from 'jquery';
import { TareaService } from '../../../services/tarea.service';
import { SucursalService } from '../../../services/sucursal.service';

declare var $: any;

@Component({
    selector: 'datos-cierre',
    templateUrl: './datos-cierre.component.html'
})

export class DatosCierreComponent implements OnInit {
    public panelBusqSeleccionado: number = 0;
    public loading: boolean = false;
    public toasActive;

    formensajero: FormGroup;
    formagentes: FormGroup;
    formoperador: FormGroup;

    listsucgen:any = [];
    listsucdist:any = [];
    listsucdesp:any = [];
    listoperadores:any = [];

    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    constructor(
        fb: FormBuilder,
        public _tareaService:TareaService,
        private toasterService: ToasterService,
        private _authService: AuthService,
        private _sucursalService: SucursalService,
        private _empresaService: EmpresaService
    ){
        let now = new Date();        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.formensajero = fb.group({
            'rutadesde': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'rutahasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'sucursalgenera': ['',Validators.compose([Validators.required])],
            'sucursaldist': [[],Validators.compose([Validators.required])]
        });
        this.formagentes = fb.group({
            'despdesde': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'desphasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'sucursalgenera': ['',Validators.compose([Validators.required])],
            'sucursaldesp': [[],Validators.compose([Validators.required])]
        });
        this.formoperador = fb.group({
            'cargbasdesde': [now.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'cargbashasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'operador': ['',Validators.compose([Validators.required])],
            'sucursalgenera': ['',Validators.compose([Validators.required])]            
        });
        this._sucursalService.query(
            {filter:{
                    where:{
                        emp_id:this._authService.getIdentity().emp_id
                    }
                }
            },
            data=>{
                this.listsucgen = data;
                this.listsucdist = data;
                this.listsucdesp = data;
            },
            error=>{

                if(error.status===401){
                    this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');                
                }else{
                    this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                }
            }
        );

        this._empresaService.operador(
            { 'emp_id': this._authService.getIdentity().emp_id },
            data=>{ this.listoperadores = data; },
            error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );

        switch (this.panelBusqSeleccionado) {
            case 0:
            this.panelBusqSeleccionado=0;
            break;
            case 1:
            this.panelBusqSeleccionado=1;
            break;
            case 2:
            this.panelBusqSeleccionado=2;
            break;
            default:
                break;
        }
    }
    ngOnInit() {

    }

    seleccionatab(idpanel){
        this.panelBusqSeleccionado = idpanel;
        if(idpanel === 0){
        }
        if(idpanel === 1){
        }
        if(idpanel === 2){
        }
    }

    descargarmensajero(){
        for (let c in this.formensajero.controls) {
            this.formensajero.controls[c].markAsTouched();
        }
        if (this.formensajero.valid) {
            this.loading=true;
            this._tareaService.planilla_mensajero(
                {
                    desde: this.formensajero.controls['rutadesde'].value,
                    hasta: this.formensajero.controls['rutahasta'].value,
                    suc_id: this.formensajero.controls['sucursalgenera'].value,
                    suc_ids: this.formensajero.controls['sucursaldist'].value.join()
                },
                txtdata=>{
                    this.loading=false;
                    console.log("txt:",txtdata);
                    let url = GLOBAL.url2+txtdata.url;
                    url = url;console.log("url:",url);
                    window.open(url);
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
            this.showMessage('warning', 'Complete la información', '');
        }
    }

    descargaragentes(){
        for (let c in this.formagentes.controls) {
            this.formagentes.controls[c].markAsTouched();
        }
        if (this.formagentes.valid) {
            this.loading=true;
            this._tareaService.planilla_agente(
                {
                    desde: this.formagentes.controls['despdesde'].value,
                    hasta: this.formagentes.controls['desphasta'].value,
                    suc_id: this.formagentes.controls['sucursalgenera'].value,
                    suc_ids: this.formagentes.controls['sucursaldesp'].value.join()
                },
                txtdata=>{
                    this.loading=false;
                    console.log("txt:",txtdata);
                    let url = GLOBAL.url2+txtdata.url;
                    url = url;console.log("url:",url);
                    window.open(url);
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
            this.showMessage('warning', 'Complete la información', '');
        }
    }

    descargaroperador(){
        for (let c in this.formoperador.controls) {
            this.formoperador.controls[c].markAsTouched();
        }
        if (this.formoperador.valid) {
            this.loading=true;
            this._tareaService.liquidacion_operador(
                {
                    desde: this.formoperador.controls['cargbasdesde'].value,
                    hasta: this.formoperador.controls['cargbashasta'].value,
                    ope_id: this.formoperador.controls['operador'].value,
                    suc_id: this.formoperador.controls['sucursalgenera'].value
                },
                txtdata=>{
                    this.loading=false;
                    console.log("txt:",txtdata);
                    let url = GLOBAL.url2+txtdata.url;
                    url = url;console.log("url:",url);
                    window.open(url);
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
            this.showMessage('warning', 'Complete la información', '');
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