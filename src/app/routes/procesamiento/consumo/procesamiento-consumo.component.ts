import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

import { OrdenService } from '../../../services/orden.service';

@Component({
    selector: 'procesamiento-consumo',
    templateUrl: './procesamiento-consumo.component.html'
})
export class ProcesamientoConsumoComponent implements OnInit {
   	formLoading:boolean;
    valFormSearch: FormGroup;

    public toasActive;
    public filterRows;
    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    columns=[];
    rows=[];
    limit=10;
    count=0;
    loading:boolean;
    selected = [];

    estados = [];
    tipos=[];


    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        public toasterService: ToasterService,
        public _ordenService:OrdenService
    ) {

        // Model Driven validation
        this.valFormSearch = fb.group({
            'anio': ['2018', Validators.compose([Validators.required])],
            'mes': ['01', Validators.compose([Validators.required])]
        });        
    }

    ngOnInit() {

    }

    ordenar(){
        console.log(this.selected);
        if(this.selected.length === 1){
            if(this.selected[0].pro_estado < 5){

            }else{
                this.showMessage("warning","Seleccionar una orden con que no se encuentren ordenados","");                
            }
        }else{
            this.showMessage("warning","Seleccionar una orden","");
        }
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

   /*onPage(event){
        this.updateRows(event.offset+1);
    }

    onSort(event){
    }

    

    onSelect({ selected }) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
    }

    onActivate(event) {
        
    }
*/
    updateRows(page=1){
        this.loading=true;

        let where={}

        if(this.valFormSearch.controls['anio'].value!=null && this.valFormSearch.controls['mes'].value!=""){
            where["valor"]=this.valFormSearch.controls['anio'].value+this.valFormSearch.controls['mes'].value;

            this._ordenService.consumo(
                where,
                data=>{
                    if(data.length>0){                        
                        this.rows = data;                
                        this.rows = [...this.rows];
                        this.count = data.length;
                    }else{
                        this.showMessage('warning', 'No se encontraron datos', '');                        
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
            this.showMessage('warning', 'Por seleccionar valor año y mes', '');
            this.loading=false;
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

    onSort($event){

    }
    onPage($event){

    }
}
