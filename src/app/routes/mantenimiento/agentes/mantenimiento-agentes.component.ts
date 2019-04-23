import { Component, OnInit ,ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { AgenteService } from '../../../services/agente.service';

@Component({
    selector: 'mantenimiento-agentes',
    templateUrl: './mantenimiento-agentes.component.html'
})
export class MantenimientoAgentesComponent implements OnInit {
    
    public toasActive;
    public listSucursales:any=[];

    formAgente: FormGroup;

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
    loading:boolean=false;
    loading2:boolean=false;
    order:string;
    selected = [];

    @ViewChild('modalAgregarAgente') modalAgregarAgente: ModalDirective;

    constructor(
    	fb: FormBuilder,   	
        public toasterService: ToasterService,
        public _agenteService:AgenteService
    ) {
        this.formAgente = fb.group({
            'sucursal': ['',Validators.compose([Validators.required])]
        });
        this.agentes();
    }

    ngOnInit(){
        this.sucursales();
    }

    agentes(){
        this.loading=true;
        this._agenteService.agentes({},
            data=>{
                this.loading=false;
                if(data.length>0){
                    this.rows = data;                
                    this.rows = [...this.rows];
                    this.count = data.length;
                }else{
                    this.rows=[];
                    this.rows = [...this.rows];
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

    sucursales(){
        this.loading2=true;
        this._agenteService.sucursalAgentes({},
            data=>{
                this.loading2=false;
                if(data.length>0){
                    this.listSucursales = data;
                }else{
                    this.showMessage('info', 'No se encontraron sucursales', '');
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
    }

    agregarAgenteSubmit(){
        this.loading2 = true;
        this._agenteService.agregar({suc_idd:this.formAgente.controls['sucursal'].value},
            data=>{                 
                if(data.error){
                    this.showMessage('error', data.mensaje, '');
                }else{
                    this.showMessage('success', 'El agente se agregó exitosamente', '');
                    this.sucursales();
                    this.agentes();
                    this.loading2=false;
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
    }

    eliminar(event){
        this.loading2 = true;
        this._agenteService.eliminar({age_id:event.age_id},
            data=>{
                this.loading2=false;   
                if(data.error){
                    this.showMessage('error', data.mensaje, '');
                }else{
                    this.showMessage('success', 'El agente se eliminó exitosamente', '');
                    this.agentes();
                    this.sucursales();
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
    }

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }

    scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById("myBtn").style.display = "block";
        } else {
            document.getElementById("myBtn").style.display = "none";
        }
    }

    topFunction() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
}