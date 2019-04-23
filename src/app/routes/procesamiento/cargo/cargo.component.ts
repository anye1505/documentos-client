import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { FileUploader } from 'ng2-file-upload';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

import { CargoService } from '../../../services/cargo.service';
import { TipoCargoService } from '../../../services/tipo-cargo.service';
import { DownloadService } from '../../../services/download.service';


import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'cargo',
    templateUrl: './cargo.component.html'
})
export class CargoComponent implements OnInit {
	public formLoading:boolean = false;
	public processRest;

	/*Tabla*/
    public columns=[];
    public rows=[];
    public limit=10;
    public count=0;
    public selected = [];
    public order;
    public sucursal;
    public sesion;

	/*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    /*Form carga update*/
    public nombre;
    public cargo;
    public uploader: FileUploader = new FileUploader({ 
        url: GLOBAL.url+"cargos/generar" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });

    /*Form search*/   	
    public valFormSearch: FormGroup;

    public cargos:any;



    @ViewChild('modelGenerarCargo') modelGenerarCargo: ModalDirective;

    constructor(
    	fb: FormBuilder,
        public _cargoService:CargoService,
        public _tipoCargos:TipoCargoService,
        public toasterService: ToasterService,        
        private _downloadService:DownloadService,
        private _userService: UserService,
        private _authService: AuthService
    ){
        this.sucursal = this._authService.getIdentity().suc_id;
        this.sesion = this._authService.getIdentity();
        let now = new Date();
        let dDesde = new Date();
        now = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes(), now.getSeconds()));
        dDesde = new Date(Date.UTC(dDesde.getFullYear(), dDesde.getMonth(), dDesde.getDate(),  dDesde.getHours(), dDesde.getMinutes(), dDesde.getSeconds()));

        dDesde.setDate(dDesde.getDate() - 30);
		this.valFormSearch = fb.group({
            'desde': [dDesde.toISOString().substring(0, 10),Validators.compose([CustomValidators.date])],
            'hasta': [now.toISOString().substring(0, 10), Validators.compose([CustomValidators.date])],
            'estado': ['',Validators.compose([])]
        });
        console.log("dates:",this.valFormSearch.controls['desde'].value," ",this.valFormSearch.controls['hasta'].value)
        //this.formLoading=true;

        this._tipoCargos.query(
            {},
            data=>{
                this.cargos = data;
                this.formLoading=false;
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.formLoading=false;
            }
        );
        this.cargos = [];
        this.updateRows();
    }
    ngOnDestroy(){
        if(this.processRest!=null){
            this.processRest.$abortRequest();
        }     
    }

	ngOnInit() {
        this.order = 'car_fecha_creado DESC';
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            if(this.nombre!="" && this.nombre!=null && this.cargo != '' && this.cargo!=null){
                form.append('nombre', this.nombre);
                form.append('cargo', this.cargo);
            }else{
                this.showMessage('warning', 'Ingresar nombre y/o tipo de cargo', '');
                this.uploader[0].cancel();            
            }
            this.formLoading = true;
        };
        

        this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
            //console.log("ImageUpload:uploaded:", item, status);
            this.formLoading = false;
        };
        
        this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
        	console.log(response);
            item.remove();
            this.showMessage('success', 'Se ha cargado la base', '');
            this.modelGenerarCargo.hide();
            //console.log("onSuccessItem " + status, response, item); 
            if(response) { //parse your response. 
            }else{

            }
        }
        this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => { 
           /* console.log("onErrorItem " + status, response, item); 
            if(response) { //parse your response. 
            } */
            if(status!=0){
                if(status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{
                    if(response){
                        let data = JSON.parse(response);//console.log("data:",data);
                        this.showMessage('error', data.error.message, '');
                    }else{
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }                    
                }
            }
            this.formLoading = true;
        }

    }


    hiddenModal(){
        if(this.processRest!=null){
            this.processRest.$abortRequest();
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

    cargarCargos(){
        this.modelGenerarCargo.show();
    }

    submitFormSearch($ev, value: any){
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
    onActivate(event) {
        
    }


    updateRows(page=1){

        this.selected=[];
        this.formLoading=true;
        //this.timeOut = setTimeout(function(){
        //this.loading=true;
        let param={
            limit:this.limit,
            order:this.order,
            include:'user'
        };

        let where={'suc_id':this.sucursal};
        //if(this.filterRows===true){
            //where["name"]={"like":"%"+this.filterRows+"%","options":"i"}
            if(this.valFormSearch.controls['desde'].value!=null && this.valFormSearch.controls['desde'].value!=""){
                if(this.valFormSearch.controls['hasta']!=null  && this.valFormSearch.controls['hasta'].value!=""){
                    let finDate=new Date(this.valFormSearch.controls['hasta'].value);
                    finDate.setDate(finDate.getDate()+1);
                    where["car_fecha_creado"]={
                        between:[this.valFormSearch.controls['desde'].value,finDate.toISOString().substring(0, 10)]
                    }
                }else{
                    let finDate=new Date();
                    finDate = new Date(Date.UTC(finDate.getFullYear(), finDate.getMonth(), finDate.getDate(),  finDate.getHours(), finDate.getMinutes(), finDate.getSeconds()));
                    finDate.setDate(finDate.getDate()+1);
                    where["car_fecha_creado"]={
                        between:[this.valFormSearch.controls['desde'].value,finDate.toISOString().substring(0, 10)]
                    }
                }
                console.log("where",where);
            }
            if(this.valFormSearch.controls['estado'].value!=null && this.valFormSearch.controls['estado'].value!=""){
                where["car_estado"]=this.valFormSearch.controls['estado'].value;
            }


            param["where"]=where;
        //}

        if(page > 1){
            param["offset"]=(page*this.limit)-this.limit;
        }


        this._cargoService.count(
            {where:where},
            count=>{
                if(count.count>0){   
                    this._cargoService.query(
                        {filter:param},
                        data=>{
                            for(let index in data){
                                data[index].usuario = data[index].user.name.toUpperCase()+' '+data[index].user.surname.toUpperCase();
                            }
                            this.rows = data;                
                            this.rows = [...this.rows];
                            this.count = count.count;
                            this.formLoading=false;
                        },
                        error=>{
                            if(error.status===401){
                                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                            }else{                  
                                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                            }
                            this.formLoading=false;
                        }
                    );
                }else{
                    this.rows=[];
                    this.rows = [...this.rows];
                    this.count = 0;
                    this.showMessage('info', 'No se encontraron datos', '');
                    this.formLoading=false;
                }
            },
            error=>{
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.formLoading=false;
            }
        );
    }


    descargar(cargo){             
        this.formLoading=true;
        this._downloadService.token(
            {id:cargo.car_id,tipo:3},
            data=>{
                if(data.des_token_validation.length < 1){
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    this.formLoading=false;
                }else{
                    this.formLoading=false;
                    let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+3;
                    url = url;
                    window.open(url);
                }
            },
            error=>{              
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                this.formLoading=false;
            }
        );
    }
}