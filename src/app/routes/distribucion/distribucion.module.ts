import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload';
//import { SelectModule } from 'ng2-select';

import { SharedModule } from '../../shared/shared.module';

import { DespachosComponent }  from  './despachos/despachos.component';
import { DistribucionRecepcionComponent } from './recepcion/distribucion-recepcion.component';
import { DistribucionBasePrioritarioComponent } from './base-prioritario/distribucion-base-prioritario.component';

import { OrdenService } from '../../services/orden.service';
import { DownloadService } from '../../services/download.service';
import { CargoService } from '../../services/cargo.service';
import { AsignacionDocumentosComponent }  from  './asignaciondocumentos/asignaciondocumentos.component';
import { EditarGuiaComponent }  from  './editarguia/editarguia.component';
import { EditarGuiaDespachoComponent }  from  './editarguiadespacho/editarguiadespacho.component';
import { ReseteoListaComponent }  from  './reseteodocumentos/reseteolista.component';
import { ReseteoEditarComponent }  from  './reseteodocumentos/reseteoeditar.component';
import { NoClasificadoListaComponent }  from  './noclasificados/noclasificadolista.component';
import { NoClasificadoEditarComponent }  from  './noclasificados/noclasificadoeditar.component';
import { DescargaGestionComponent }  from  './descargagestion/descargagestion.component';
import { ConsultaDocumentosComponent }  from  './consultadocumentos/consultadocumentos.component';
import { GestionClientesComponent }  from  './gestionclientes/gestionclientes.component';
import { CambioGestionComponent }  from  './cambiogestion/cambiogestion.component';
import { ReportesComponent }  from  './reportes/reportes.component';
import { GestionAgentesComponent }  from  './gestionagentes/gestionagentes.component';

import { TimelineComponent } from './consultadocumentos/timeline.component';

const routes: Routes = [
    { path: 'despachos', component: DespachosComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'recepcion', component: DistribucionRecepcionComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','agente','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    }, 
    { path: 'base-prioritario', component: DistribucionBasePrioritarioComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'asignaciondocumentos', component: AsignacionDocumentosComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'editarguia/:idguia', component: EditarGuiaComponent,
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'editarguia', component: EditarGuiaComponent,
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'editarguiadespacho/:idguiadespacho', component: EditarGuiaDespachoComponent,
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'editarguiadespacho', component: EditarGuiaDespachoComponent,
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'reseteolista', component: ReseteoListaComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'reseteoeditar', component: ReseteoEditarComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'], 
               redirectTo: 'home'
            }
        }
    },
    { path: 'noclasificadolista', component: NoClasificadoListaComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'noclasificadoeditar', component: NoClasificadoEditarComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'descargagestion', component: DescargaGestionComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','agente','jefe_distribucion','produccion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'consultadocumentos', component: ConsultaDocumentosComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','produccion','agente','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'timeline', component: TimelineComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','produccion','agente','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'gestionclientes', component: GestionClientesComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','agente','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'cambiogestion', component: CambioGestionComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','ejecutivo','agente','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'gestiondistribucion', component: ReportesComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'gestionagentes', component: GestionAgentesComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','jefe_distribucion'],
               redirectTo: 'home'
            }
        }
    }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        TreeModule,
        DndModule.forRoot(),
        InfiniteScrollModule,
        FileUploadModule,
        NgxDatatableModule
    ],
    declarations: [
        DespachosComponent,
        DistribucionRecepcionComponent,
        DistribucionBasePrioritarioComponent,
        AsignacionDocumentosComponent,
        EditarGuiaComponent,
        ReseteoListaComponent,
        ReseteoEditarComponent,
        NoClasificadoListaComponent,
        NoClasificadoEditarComponent,
        EditarGuiaDespachoComponent,
        DescargaGestionComponent,
        ConsultaDocumentosComponent,
        GestionClientesComponent,
        TimelineComponent,
        CambioGestionComponent,
        ReportesComponent,
        GestionAgentesComponent
    ],
    exports: [
        RouterModule
    ],
    providers: [
        OrdenService,
        DownloadService,
        CargoService
    ]
})
export class DistribucionModule { }
