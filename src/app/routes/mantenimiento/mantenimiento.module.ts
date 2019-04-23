import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload';
//import { SelectModule } from 'ng2-select';

import { SharedModule } from '../../shared/shared.module';

import { MantenimientoClienteComponent } from './cliente/mantenimiento-cliente.component';
import { MantenimientoAgentesComponent } from './agentes/mantenimiento-agentes.component';
import { MantenimientoReglaDistribucionComponent } from './regla-distribucion/mantenimiento-regla-distribucion.component';

import { OrdenService } from '../../services/orden.service';
import { DownloadService } from '../../services/download.service';
import { CargoService } from '../../services/cargo.service';
import { ModeloDistribucionService } from '../../services/modelo-distribucion.service';
import { ReglaDistribucionService } from '../../services/regla-distribucion.service';
import { TipoCargoService } from '../../services/tipo-cargo.service';
import { AgenteService } from '../../services/agente.service';

const routes: Routes = [
    { path: 'cliente', component: MantenimientoClienteComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','produccion','ejecutivo'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'reglaDistribucion', component: MantenimientoReglaDistribucionComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','produccion','ejecutivo'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'agentes', component: MantenimientoAgentesComponent, 
        data: {
            permissions: {
               only: ['admin','administrador'],
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
        MantenimientoClienteComponent,
        MantenimientoReglaDistribucionComponent,
        MantenimientoAgentesComponent
    ],
    exports: [
        RouterModule
    ],
    providers: [
        OrdenService,
        DownloadService,
        CargoService,
        ModeloDistribucionService,
        ReglaDistribucionService,
        TipoCargoService,
        AgenteService
    ]
})
export class MantenimientoModule { }
