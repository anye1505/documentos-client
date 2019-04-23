import { Component, OnInit, ViewEncapsulation, ViewChild,TemplateRef  } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { GLOBAL } from '../../../global';


import { TareaService } from '../../../services/tarea.service';
import { DownloadService } from '../../../services/download.service';

declare var $: any;

@Component({
    selector: 'tarea',
    templateUrl: './reporte-tarea.component.html'
})
export class ReporteTareaComponent implements OnInit {


    public filterRows="";
    public formLoading:boolean;


    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });


    public limit=10;
    public count=0;
    public loading: boolean = false;
    public toasActive;
    public rows = [];
    public columns = [];
    public con;



    @ViewChild(DatatableComponent) table: DatatableComponent;

    ngOnInit() {

    }
    constructor(
        fb: FormBuilder,
        public _tareaService:TareaService,
        public toasterService: ToasterService,
        public _downloadService:DownloadService
    ) {
      
        this.loading=false;
        this.formLoading = false;
    
        this.updateRows();

    }
    
    onPage(event){
        this.updateRows(event.offset+1);
    }

    onSort(event){
        console.log(event);
    }


    updateFilter(event){
        let val = event.target.value;//.toLowerCase();
        this.filterRows=val;
        this.updateRows(1);
        //{"limit":1,"offset":0,"where":{"id":1}}
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
        

        console.log(this.con);
        //this.timeOut = setTimeout(function(){
            this.loading=true;
            let param={
                limit:this.limit,
                include:['tipo']
            };

            let where={}

            if(this.filterRows!=""){
                where["tar_descripcion"]={"like":"%"+this.filterRows+"%","options":"i"}
                param["where"]=where;
            }

            if(page > 1){
                param["offset"]=(page*this.limit)-this.limit;
            }


            this.con=this._tareaService.count(
                {where:where},
                count=>{
                    if(count.count>0){                                
                        this.con=this._tareaService.find(
                            {filter:param},
                            data=>{
                                this.rows=data;
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

    descarga(row){
        this.loading=true;
        this._downloadService.token(
            {
                id:row.tar_id,
                tipo:8
            },
            data=>{
                 if(data.des_token_validation.length < 1){
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    this.loading=false;
                }else{
                    this.loading=false;
                    let url = GLOBAL.url+"/descargas/download/"+data.des_token_validation+"?tipo="+8;
                    url = url;
                    window.open(url);
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
}