import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { FileUploader } from 'ng2-file-upload';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

import { EmpresaService } from '../../../services/empresa.service';
import { DownloadService } from '../../../services/download.service';


import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'cargo',
    templateUrl: './distribucion-base-prioritario.component.html'
})
export class DistribucionBasePrioritarioComponent implements OnInit {
    public loading:boolean = false;
	public formLoading:boolean = false;
	public processRest;

	/*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    public empresas:any[];

    public formOperador;
    public uploader: FileUploader = new FileUploader({ 
        queueLimit: 1,
        url: GLOBAL.url+"ordenes/basePrioritario" ,
        headers: [{ 
                name:'Authorization',
                value:localStorage.getItem('token')
            }]
    });

    constructor(
    	fb: FormBuilder,
        public toasterService: ToasterService,        
        public _empresaService:EmpresaService,
        private _downloadService:DownloadService
    ){
       this._empresaService.operador(
            {},
            data=>{

                this.empresas = data;
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

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {         
            if(this.formOperador!="" && this.formOperador!=null){
                    this.formLoading = true;
                //if(this.formSucursal!="" && this.formSucursal!=null){       
                    form.append('operador', this.formOperador);
//                    form.append('sucursal', this.formSucursal);
               /* }else{
                    this.showMessage('info', 'Seleccionar sucursal', '');
                    this.uploader[0].cancel();            
                }*/
            }else{
                this.showMessage('info', 'Seleccionar operador', '');
                this.uploader[0].cancel();      
                return false;                      
            }
        };
        /*this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
            //console.log("ImageUpload:uploaded:", item, status);
        };
        */
        this.uploader.onSuccessItem = (item:any, response:any, status:any, headers:any) => { 
            this.formLoading = false;
            item.remove();
            this.showMessage('success', 'Se ha cargado la base', '');
            //console.log("onSuccessItem " + status, response, item); 
           // console.log(response);
            if(response) {
            }
        }
        this.uploader.onErrorItem = (item:any, response:any, status:any, headers:any) => { 
           /* console.log("onErrorItem " + status, response, item); 
            if(response) { //parse your response. 
            } */
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
            this.formLoading = false;
            
        }

    }
    ngOnDestroy(){
        if(this.processRest!=null){
            this.processRest.$abortRequest();
        }     
    }

    cancelUpload(item,remove){
        this.showMessage('warning','Carga fue cancelada','');
        if(remove){
            item.remove();    
        }else{
            item.cancel();
        }
        
        this.formLoading =false;
    }

	ngOnInit() {

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