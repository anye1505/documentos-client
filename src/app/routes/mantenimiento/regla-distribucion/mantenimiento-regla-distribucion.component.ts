import { Component, OnInit,TemplateRef ,ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { FileUploader } from 'ng2-file-upload';

import { ModalDirective,BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModeloDistribucionService } from '../../../services/modelo-distribucion.service';
import { ReglaDistribucionService } from '../../../services/regla-distribucion.service';
@Component({
    selector: 'mantenimiento-regla-distribucion',
    templateUrl: './mantenimiento-regla-distribucion.component.html',
    styleUrls: ['./mantenimiento-regla-distribucion.component.scss']
})
export class MantenimientoReglaDistribucionComponent implements OnInit {
    public updateAction:number = 0;
    public eliminarAction:number = 0;
    public textoRegla:string = '';
    public modalRef: BsModalRef;

   	public formLoading:boolean;
    public valFormSearch: FormGroup;


    public toasActive;
    public filterRows;
    public toaster: any;
    public toasterConfig: any;
    public toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    /*Tabla regla distribución*/
    public columns=[];
    public rows=[];
    public limit=10;
    public count=0;
    public loading:boolean;
    public order:string;
    public selected = [];

    public reglaSelected = null;


    /*Form crear/actualizar producto*/
    public valFormRegistrarRegla: FormGroup;

    public titulo_modal:string = 'Registrar regla';


    @ViewChild('modalCrearRegla') modalCrearRegla: ModalDirective;
    @ViewChild('modalEliminarRegla') modalEliminarRegla: ModalDirective;
    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        public toasterService: ToasterService,
        private modalService: BsModalService,
        private _modeloDistribucionService : ModeloDistribucionService,
        private _reglaDistribucionService : ReglaDistribucionService
    ) {


        this.order = 'rdi_id DESC';

        this.valFormSearch = fb.group({
            'rdi_nombre':['',Validators.compose([])]
        })
        // Model Driven validation
        this.valFormRegistrarRegla = fb.group({
            //'emp_id_courier': ['',Validators.compose([])], integer,
            'rdi_nombre': ['',Validators.compose([Validators.required])],
            'rdi_si_entrega': ['',Validators.compose([])], 
            'rdi_si_dirincompleta': ['',Validators.compose([])], 
            'rdi_si_entregasello': ['',Validators.compose([])],
            'rdi_si_dirnoexiste': ['',Validators.compose([])], 
            'rdi_si_entregapuerta': ['',Validators.compose([])],
            'rdi_si_semudo': ['',Validators.compose([])], 
            'rdi_si_entregabuzon': ['',Validators.compose([])],
            'rdi_si_ausente': ['',Validators.compose([])],
            'rdi_si_rechazado': ['',Validators.compose([])],
            'rdi_si_desconocido': ['',Validators.compose([])],
            'rdi_si_fallecido': ['',Validators.compose([])],


            'rdi_si_sabado': ['',Validators.compose([])], 
            'rdi_si_domingo': ['',Validators.compose([])],
            'rdi_si_feriado': ['',Validators.compose([])], 



            'rdi_dias_dist_centrico': ['',Validators.compose([Validators.required,Validators.pattern('^[0-9]+$')])],
            'rdi_dias_dist_alejado': ['',Validators.compose([Validators.required,Validators.pattern('^[0-9]+$')])], 
            'rdi_dias_dist_rural': ['',Validators.compose([Validators.required,Validators.pattern('^[0-9]+$')])],
            'rdi_dias_dist_periferico': ['',Validators.compose([Validators.required,Validators.pattern('^[0-9]+$')])], 
            'rdi_dias_dist_balneario': ['',Validators.compose([Validators.required,Validators.pattern('^[0-9]+$')])],


            'rdi_si_primera_fecha': ['',Validators.compose([])],
            'rdi_si_segunda_fecha': ['',Validators.compose([])], 
        });
  
            this.updateRows(1);

    }

    ngOnInit() {
    }

    hiddenModal(){
           /* this.formCrearOp.controls['operador'].setValue('');
            this.formCrearOp.controls['cliente'].setValue('');
            this.formCrearOp.controls['ruc'].setValue('');
            this.formCrearOp.controls['abreviado'].setValue('');
            this.formCrearOp.controls['direccion'].setValue('');
            this.formCrearOp.controls['distrito'].setValue('');*/
    }
 

    submitFormSearch($ev, value: any) {
    	//this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valFormSearch.controls) {
            this.valFormSearch.controls[c].markAsTouched();
        }
        if (this.valFormSearch.valid) {   
            this.updateRows(1);
        }else{
    		this.formLoading = false;
        }
    }

    submitRegistrarRegla($ev, value: any){
        $ev.preventDefault();
        for (let c in this.valFormRegistrarRegla.controls) {
            this.valFormRegistrarRegla.controls[c].markAsTouched();
        }
        


        if (this.valFormRegistrarRegla.valid) { 
            value.rdi_dias_dist_centrico = value.rdi_dias_dist_centrico!=''?parseInt(value.rdi_dias_dist_centrico,10):0;
            value.rdi_dias_dist_alejado = value.rdi_dias_dist_alejado!=''?parseInt(value.rdi_dias_dist_alejado,10):0;
            value.rdi_dias_dist_rural = value.rdi_dias_dist_rural!=''?parseInt(value.rdi_dias_dist_rural,10):0;
            value.rdi_dias_dist_periferico = value.rdi_dias_dist_periferico!=''?parseInt(value.rdi_dias_dist_periferico,10):0;
            value.rdi_dias_dist_balneario = value.rdi_dias_dist_balneario!=''?parseInt(value.rdi_dias_dist_balneario,10):0;

           this.loading = true;    
           if(this.updateAction > 0){
               console.log("update");

               value.rdi_id = this.updateAction;

                this._reglaDistribucionService.update(
                    value,
                    data=>{
                        if(data.error){
                            this.showMessage('error', data.mensaje, '');

                        }else{
                            this.showMessage('success', data.mensaje, '');
                            //let name = '';
                            for(let i=0;i<this.rows.length;i++){
                                if(this.rows[i].rdi_id===data.data.rdi_id){
                                    this.rows[i] = data.data;
                                    console.log("coincide");
                                    break;
                                }
                            }
                            
                            this.rows = [...this.rows];
                            //this.valFormSearch.controls['cliente'].setValue(data.rdi_id); 

                            this.modalCrearRegla.hide();
                            this.updateRows(1);                        
                        }
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
               console.log("crear");
                this._reglaDistribucionService.create(
                    value,
                    data=>{
                        if(data.error){
                            this.showMessage('error', data.mensaje, '');

                        }else{
                            this.showMessage('success', data.mensaje, '');

                            this.modalCrearRegla.hide();
                            this.updateRows(1);                        
                        }
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
           }
        }    
    }

    submitEliminarRegla(){
        this.loading=true;
        this._reglaDistribucionService.delete(
            {rdi_id:this.eliminarAction},
            data=>{
                if(data.error){
                    this.showMessage('error', data.mensaje, '');

                }else{
                    this.showMessage('success', data.mensaje, '');
                    //let name = '';
                    for(let i=0;i<this.rows.length;i++){
                        if(this.rows[i].rdi_id==this.eliminarAction){
                            this.rows.splice(i, 1);
                            break;
                        }
                    }
                    
                    this.rows = [...this.rows]; 
                    this.eliminarAction = 0 ;

                    this.modalEliminarRegla.hide();           
                }
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
    }

    onPage(event){
        this.updateRows(event.offset+1);
    }

    onSort(event){
       /* if(event.column.prop='estado'){
            this.order = 'pro_estado '+event.newValue;
        }else{
            if(event.column.prop='estado'){
                this.order = 'pro_tipo '+event.newValue;                
            }else{

                this.order = event.column.prop+" "+event.newValue;  
            }
        }*/
    }

    onSelect({ selected }) {
       /* this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        this.clienteSelected = this.selected[0];
        this.updateRowsProductos(1);*/
    }

    onActivate(event) {
        
    }

    updateRows(page){
        this.selected=[];
        this.loading=true;
        //this.timeOut = setTimeout(function(){
        //this.loading=true;
        let param={
            limit:this.limit,
            order:this.order            
        };

        let where={}
        where['rdi_usu_elim']=null;//{lte:0}

        if(this.valFormSearch.controls['rdi_nombre'].value !=null && this.valFormSearch.controls['rdi_nombre'].value != ""){            
//            where["rdi_nombre"] = {regexp:'.*'+this.valFormSearch.controls['rdi_nombre'].value +'.*',"options":"i"};7
            where["rdi_nombre"] = {ilike:'%'+this.valFormSearch.controls['rdi_nombre'].value +'%'};
        }
/*
        if(this.valFormSearch.controls['cliente'].value !=null && this.valFormSearch.controls['cliente'].value != ""){
            where["emp_id_cliente"] = this.valFormSearch.controls['cliente'].value;
        }*/

        param["where"]=where;
        if(page > 1){
            param["offset"]=(page*this.limit)-this.limit;
        }


        this._reglaDistribucionService.count(
            {where:where},
            count=>{
                if(count.count>0){   
                    this._reglaDistribucionService.query(
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



    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }

    showCrearModal(){

        this.valFormRegistrarRegla.controls['rdi_nombre'].setValue('');
        this.valFormRegistrarRegla.controls['rdi_si_entrega'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_dirincompleta'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_entregasello'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_dirnoexiste'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_entregapuerta'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_semudo'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_entregabuzon'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_ausente'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_rechazado'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_desconocido'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_fallecido'].setValue(false);

        this.valFormRegistrarRegla.controls['rdi_si_sabado'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_domingo'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_feriado'].setValue(false);

        this.valFormRegistrarRegla.controls['rdi_dias_dist_centrico'].setValue('');
        this.valFormRegistrarRegla.controls['rdi_dias_dist_alejado'].setValue('');
        this.valFormRegistrarRegla.controls['rdi_dias_dist_rural'].setValue('');
        this.valFormRegistrarRegla.controls['rdi_dias_dist_periferico'].setValue('');
        this.valFormRegistrarRegla.controls['rdi_dias_dist_balneario'].setValue('');

        this.valFormRegistrarRegla.controls['rdi_si_primera_fecha'].setValue(false);
        this.valFormRegistrarRegla.controls['rdi_si_segunda_fecha'].setValue(false);

        this.updateAction = 0;
        this.titulo_modal = 'Registrar regla';
        this.modalCrearRegla.show();
    }

    showEditarModal(row){       


        this.valFormRegistrarRegla.controls['rdi_nombre'].setValue(row.rdi_nombre);
        this.valFormRegistrarRegla.controls['rdi_si_entrega'].setValue(row.rdi_si_entrega);
        this.valFormRegistrarRegla.controls['rdi_si_dirincompleta'].setValue(row.rdi_si_dirincompleta);
        this.valFormRegistrarRegla.controls['rdi_si_entregasello'].setValue(row.rdi_si_entregasello);
        this.valFormRegistrarRegla.controls['rdi_si_dirnoexiste'].setValue(row.rdi_si_dirnoexiste);
        this.valFormRegistrarRegla.controls['rdi_si_entregapuerta'].setValue(row.rdi_si_entregapuerta);
        this.valFormRegistrarRegla.controls['rdi_si_semudo'].setValue(row.rdi_si_semudo);
        this.valFormRegistrarRegla.controls['rdi_si_entregabuzon'].setValue(row.rdi_si_entregabuzon);
        this.valFormRegistrarRegla.controls['rdi_si_ausente'].setValue(row.rdi_si_ausente);
        this.valFormRegistrarRegla.controls['rdi_si_rechazado'].setValue(row.rdi_si_rechazado);
        this.valFormRegistrarRegla.controls['rdi_si_desconocido'].setValue(row.rdi_si_desconocido);
        this.valFormRegistrarRegla.controls['rdi_si_fallecido'].setValue(row.rdi_si_fallecido);

        this.valFormRegistrarRegla.controls['rdi_si_sabado'].setValue(row.rdi_si_sabado);
        this.valFormRegistrarRegla.controls['rdi_si_domingo'].setValue(row.rdi_si_domingo);
        this.valFormRegistrarRegla.controls['rdi_si_feriado'].setValue(row.rdi_si_feriado);

        this.valFormRegistrarRegla.controls['rdi_dias_dist_centrico'].setValue(row.rdi_dias_dist_centrico);
        this.valFormRegistrarRegla.controls['rdi_dias_dist_alejado'].setValue(row.rdi_dias_dist_alejado);
        this.valFormRegistrarRegla.controls['rdi_dias_dist_rural'].setValue(row.rdi_dias_dist_rural);
        this.valFormRegistrarRegla.controls['rdi_dias_dist_periferico'].setValue(row.rdi_dias_dist_periferico);
        this.valFormRegistrarRegla.controls['rdi_dias_dist_balneario'].setValue(row.rdi_dias_dist_balneario);

        this.valFormRegistrarRegla.controls['rdi_si_primera_fecha'].setValue(row.rdi_si_primera_fecha);
        this.valFormRegistrarRegla.controls['rdi_si_segunda_fecha'].setValue(row.rdi_si_segunda_fecha);

        this.updateAction = row.rdi_id;
        this.titulo_modal = 'Actualizar regla';
        this.modalCrearRegla.show();

    }

    showEliminarModal(row){
        this.textoRegla = row.rdi_nombre;
        this.eliminarAction = row.rdi_id;
        this.modalEliminarRegla.show();
    }
}
