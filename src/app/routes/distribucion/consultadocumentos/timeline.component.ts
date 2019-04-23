import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { ConsultaDocumentosService } from '../../../services/consulta-documentos.service';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
    
    private sesion: any;

    docid: number;
    ordid: number;
    tiporeg: number;
    timelineAlt = true;
    rows = [];

    /*Message*/
    public toasActive;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    constructor(
        private router: Router,
        private activateRoute: ActivatedRoute,
        private toasterService: ToasterService,
        private _authService: AuthService,
        private _consultaDocumentoService: ConsultaDocumentosService
    ){
        this.sesion = this._authService.getIdentity();
        this.docid = this.activateRoute.snapshot.queryParams['docid'];
        this.ordid = this.activateRoute.snapshot.queryParams['ordid'];
        this.tiporeg = this.activateRoute.snapshot.queryParams['tiporeg'];
        
        this._consultaDocumentoService.detalle({
            'doc_id': this.docid,
            'tipo_reg': this.tiporeg,
            'ord_id': this.ordid
        }, data=>{
            console.log("data:", data);
            this.rows = data;
            if(this.rows.length > 0){
                let li1;
                let li2;
                let ul = document.getElementById("ul");
                for(let i = 0; i < this.rows.length; i++){
                    //li1 = document.createElement("li");
                    //li1.setAttribute('class', 'timeline-separator');
                    li2 = document.createElement("li");
                    
                    li2.innerHTML = '<div class="timeline-badge primary"><em class="fa fa-users"></em></div><div class="timeline-card"><div id="popover" class="popover left"><h4 class="popover-header">'
                                    +this.rows[i].titulo+
                                    '</h4><div></div><div class="popover-body"><p>'
                                    +this.rows[i].contenido+
                                    '<br/><small></small></p></div></div></div>';                
                    if(i%2 != 0){
                        li2.setAttribute('class', 'timeline-inverted');
                    }
                    console.log("li2: ",li2);
                    //ul.appendChild(li1);
                    ul.appendChild(li2);
                }                
            }
        }, error=>{
            if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
            }else{
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
            }
        });
    }

    ngOnInit() {
    }

    volver(){
        this.router.navigate(['/distribucion/consultadocumentos'],{
            queryParams: {
                cod: this.activateRoute.snapshot.queryParams['cod'],
                tip: this.activateRoute.snapshot.queryParams['tiporeg'],
                suc: this.activateRoute.snapshot.queryParams['suc']
            }
        });
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