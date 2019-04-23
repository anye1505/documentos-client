import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { NoClasificadoService } from '../../../services/no-clasificado.service';
import { SucursalService } from '../../../services/sucursal.service';

@Component({
    selector: 'noclasificadolista',
    templateUrl: './noclasificadolista.component.html'
})
export class NoClasificadoListaComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public formLoading:boolean = false;
    /* Formulario */
    frmbusqueda: FormGroup;
    listusuarios:any = [];
    listtipos:any = [];
    usuario:number;
    navigator: any = navigator;
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
    constructor(
        fb: FormBuilder,
        private router: Router,
        private _noClasificadoService: NoClasificadoService,
        private _sucursalSrv: SucursalService,
        private _authService: AuthService,
        private _userService: UserService,
        private toasterService: ToasterService
    ){
        this.loading=false;
        this.sesion = this._authService.getIdentity();
        let fechadesde: Date = new Date();
        fechadesde.setDate(fechadesde.getDate() - 15);

        let now = new Date();
        
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        this.frmbusqueda = fb.group({
            //'asignaciondesde': [fechadesde.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'asignaciondesde': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'asignacionhasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'usuario': ['',Validators.compose([])],
            'tipo': ['',Validators.compose([])]
        });
        
        this._userService.find({ id : this.sesion.userId },
            data=>{
                this.usuario = data['id'];
                this._sucursalSrv.despachador(
                    { 'suc_id': data['suc_id'] },
                    data=>{ this.listusuarios = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
                this.fn_busquedamultiple(0);
            },
            error=>{                
                if(error.status===401){ this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', ''); }
                else{ this.showMessage('error', 'Vuelva a intentar en unos minutos', ''); }
                this.loading=false;
            }
        );
    }
    ngOnInit(){
        
    }
    fn_busquedamultiple(page){        
        this.updateRows({
            'fecha_desde': (this.frmbusqueda.controls['asignaciondesde'].value == null || this.frmbusqueda.controls['asignaciondesde'].value == '' ? 0 : this.frmbusqueda.controls['asignaciondesde'].value),
            'fecha_hasta': (this.frmbusqueda.controls['asignacionhasta'].value == null || this.frmbusqueda.controls['asignacionhasta'].value == '' ? 0 : this.frmbusqueda.controls['asignacionhasta'].value),
            'usu_cla_id': (this.frmbusqueda.controls['usuario'].value== null || this.frmbusqueda.controls['usuario'].value == '' ? 0 : this.frmbusqueda.controls['usuario'].value),
            'desde_fila':( page * this.limit),
            'limite_filas':this.limit,
            'ordenado_por':'cla_id desc'
        });
    }
    //eventos formulario
    frmbusqueda_submit(event,value: any){
        event.preventDefault();
        for (let c in this.frmbusqueda.controls) {
            this.frmbusqueda.controls[c].markAsTouched();
        }
        if (this.frmbusqueda.valid) { 
            this.fn_busquedamultiple(0);
        }else{
    		this.formLoading = false;
        }
    }

    frmAgregar_submit(event, formValues){ }
    btnNuevo_click(sender){
        this.router.navigate(['/distribucion/noclasificadoeditar']);
    }

    updateRows(pdata){
        this.loading=true;
        this.count = 0;
        this._noClasificadoService.consultaMultiple(
            pdata,            
            data=>{
                this.loading=false;
                this.rows = data;
                this.rows = [...this.rows];
                if(data.length==0){ this.showMessage('info', 'No se encontraron datos', ''); }
                else { this.count = data[0]['nro_filas']; }
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

    /*grilla*/
    onPage(event){ this.fn_busquedamultiple(event.offset) }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {  }
}