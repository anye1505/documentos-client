import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { GLOBAL } from '../../../global';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { SucursalService } from '../../../services/sucursal.service';
import { TipoReseteoService } from '../../../services/tipo-reseteo.service';
import { DocumentoReseteoService  } from '../../../services/documento-reseteo.service';

@Component({
    selector: 'reseteolista',
    templateUrl: './reseteolista.component.html'
})
export class ReseteoListaComponent implements OnInit {
    private sesion: any;
    public loading:boolean = false;
    public formLoading:boolean = false;
    listusuarios:any = [];
    listtipos:any = [];
    frmbusqueda: any = {
        asignaciondesde: '',
        asignacionhasta: '',
        usuario: '',
        tipo: ''
    };
    navigator: any = navigator;
    /*Grilla*/
    columns=[];
    rows=[];
    limit=10;
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
        private toasterService: ToasterService,
        private _authService: AuthService,
        private _userService: UserService,
        private _sucursalSrv: SucursalService,
        private _tipoReseteoSrv: TipoReseteoService,
        private _documentoReseteoService: DocumentoReseteoService
    ){
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
                this._tipoReseteoSrv.lista({},
                    data=>{ this.listtipos = data; },
                    error=>{                
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading=false;
                    }
                );
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
    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }
    }
    //eventos formulario
    frmbusqueda_submit(event, formValues){ 
        formValues['ordenado_por'] = '';
        this.recuperar_detalle(0, formValues);
     }
    btnNuevo_click(sender){
        this.router.navigate(['/distribucion/reseteoeditar']);
    }

    /*grilla*/
    onPage(event){ console.log(this.frmbusqueda.value); this.recuperar_detalle(event.offset,this.frmbusqueda.value); }
    onSort(event){  }
    onActivate(event) {  }
    onSelect({ selected }) {  }
    /*Metodos internos*/
    recuperar_detalle(nPagina:number=0, valores){
        this.loading = true;        
        let tipo=0;
        if(valores['tipo']===0)
            tipo=-2;

        if(!valores['tipo'] && tipo===0)
            valores['tipo']=-1;

        console.log("tir:",valores['tipo']);
        this._documentoReseteoService.consultaMultiple({
            fecha_desde: valores['asignaciondesde'],
            fecha_hasta: valores['asignacionhasta'],
            usu_reseteo: (valores['usuario'] == '' ? 0 : valores['usuario']),
            tir_id: valores['tipo'],//(!valores['tipo']? -1 : valores['tipo']),
            ordenado_por: 'dre_id asc',
            desde_fila:(nPagina * this.limit),
            limite_filas:this.limit
        },
            data=>{
                this.loading = false;
                if(data.lenght>0){
                    this.count =  data[0].nro_registros;
                    this.rows = data; this.rows = [...this.rows];
                }else{
                    this.showMessage('info', 'No se encontraron datos', '');
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
    }
}